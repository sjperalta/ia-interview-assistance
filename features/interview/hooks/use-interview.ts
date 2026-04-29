import { useRef, useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { settingsRepo } from '#root/features/settings/services/settings-repo';
import { DeepgramChunkSpeechStream } from '#root/features/speech';
import { generateInterviewAnswer } from '#root/services/deepseek';
import { historyRepo } from '#root/features/history/services/history-repo';
import { insightsTelemetryRepo } from '#root/features/insights';
import { randomId } from '#root/utils/id';
import { nonWhitespaceLength, normalizeQuestion } from '#root/utils/normalize-question';
import { Audio } from 'expo-av';

export interface InterviewState {
  status: 'Idle' | 'Listening' | 'Detecting' | 'Transcribing' | 'Thinking' | 'Speaking';
  transcript: string;
  suggestedAnswer: string[];
  confidence: number;
  sessionDuration: number;
  whisperModeEnabled: boolean;
  micPermissionStatus: 'unknown' | 'granted' | 'denied';
  lastAudioError: string | null;
  debugEvents: string[];
}

function isLikelyQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (t.includes('?') || t.startsWith('¿')) return true;
  if (
    /^(what|why|how|when|where|who|can you|could you|would you|tell me|describe|walk me|explain)\b/.test(t)
  ) {
    return true;
  }
  // Spanish starters (common interviewer prompts).
  if (/^(que|qué|por que|por qué|como|cómo|cuando|cuándo|donde|dónde|quien|quién|puedes|podrias|podrías|explica|describe)\b/.test(t)) {
    return true;
  }
  return false;
}

export const useInterview = () => {
  const [state, setState] = useState<InterviewState>({
    status: 'Idle',
    transcript: "Waiting for interviewer to speak...",
    suggestedAnswer: [],
    confidence: 0,
    sessionDuration: 0,
    whisperModeEnabled: false,
    micPermissionStatus: 'unknown',
    lastAudioError: null,
    debugEvents: [],
  });

  const streamRef = useRef<DeepgramChunkSpeechStream | null>(null);
  const lastAutoFinalQuestionRef = useRef<string>('');
  const lastLlmCallAtRef = useRef<number>(0);
  const lastLlmQuestionNormRef = useRef<string>('');
  const isGeneratingRef = useRef<boolean>(false);
  const lastSttConfidence01Ref = useRef<number | null>(null);

  const pushDebugEvent = useCallback((message: string) => {
    const ts = new Date().toISOString().slice(11, 19);
    setState((prev) => ({
      ...prev,
      debugEvents: [`${ts}  ${message}`, ...prev.debugEvents].slice(0, 20),
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const settings = await settingsRepo.get();
      if (isMounted) setState((prev) => ({ ...prev, whisperModeEnabled: settings.whisperModeDefault }));
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Timer for session duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (state.status !== 'Idle') {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, sessionDuration: prev.sessionDuration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.status]);

  const startListening = useCallback(async () => {
    try {
      pushDebugEvent('startListening()');
      const settings = await settingsRepo.get();
      if (!streamRef.current) streamRef.current = new DeepgramChunkSpeechStream();

      const handleFinalQuestion = (questionRaw: string, source: 'final' | 'auto'): void => {
        const question = questionRaw.trim();
        if (!question) return;

        pushDebugEvent(`${source}(${Math.min(question.length, 64)} chars)`);
        setState((prev) => ({ ...prev, status: 'Thinking', transcript: question }));

        const likelyQuestion = isLikelyQuestion(question);
        // Fallback: if we got a silence-finalized utterance that's long enough,
        // treat it as a question even if it doesn't match our heuristics.
        const allowFinalFallback = source === 'final' && nonWhitespaceLength(question) >= 20;

        if (!likelyQuestion && !allowFinalFallback) {
          setTimeout(
            () => setState((prev) => (prev.status === 'Thinking' ? { ...prev, status: 'Listening' } : prev)),
            250,
          );
          return;
        }

        if (!likelyQuestion && allowFinalFallback) {
          pushDebugEvent('question:fallback:final');
        }

        // LLM call guardrails (token/cost protection).
        if (nonWhitespaceLength(question) < 10) {
          pushDebugEvent('llm:skip:too_short');
          setState((prev) => ({ ...prev, status: 'Listening' }));
          return;
        }

        const norm = normalizeQuestion(question);
        if (norm === lastLlmQuestionNormRef.current) {
          pushDebugEvent('llm:skip:dedupe');
          setState((prev) => ({ ...prev, status: 'Listening' }));
          return;
        }

        const now = Date.now();
        if (now - lastLlmCallAtRef.current < 5000) {
          pushDebugEvent('llm:skip:cooldown');
          setState((prev) => ({ ...prev, status: 'Listening' }));
          return;
        }

        if (isGeneratingRef.current) {
          pushDebugEvent('llm:skip:busy');
          setState((prev) => ({ ...prev, status: 'Listening' }));
          return;
        }

        void (async () => {
          try {
            isGeneratingRef.current = true;
            pushDebugEvent('deepseek:start');
            const result = await generateInterviewAnswer({ question, style: settings.answerStyle });
            pushDebugEvent('deepseek:ok');

            // Only commit cooldown/dedupe after a successful response so users can retry
            // if the request fails (network/API error).
            lastLlmCallAtRef.current = Date.now();
            lastLlmQuestionNormRef.current = norm;

            setState((prev) => ({
              ...prev,
              status: 'Listening',
              suggestedAnswer: result.bullets,
            }));

            await historyRepo.add({
              id: randomId('h'),
              question,
              answerBullets: result.bullets,
              createdAt: new Date().toISOString(),
              sttConfidence: lastSttConfidence01Ref.current ?? undefined,
              providerMeta: { deepseekModel: result.model, latencyMs: result.latencyMs },
            });

            if (state.whisperModeEnabled) {
              pushDebugEvent('tts:speak');
              Speech.speak(result.bullets.join('. '), { rate: 0.9, pitch: 1.0 });
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to generate answer';
            const suppressed =
              msg.includes('suppressed') || msg.includes('Cooldown active') || msg.includes('too short');
            pushDebugEvent(`deepseek:${suppressed ? 'suppressed' : 'error'}(${msg.slice(0, 80)})`);
            setState((prev) =>
              suppressed ? { ...prev, status: 'Listening' } : { ...prev, status: 'Listening', suggestedAnswer: [msg] },
            );
          } finally {
            isGeneratingRef.current = false;
          }
        })();
      };

      const permission = await Audio.requestPermissionsAsync();
      setState((prev) => ({
        ...prev,
        micPermissionStatus: permission.status === 'granted' ? 'granted' : 'denied',
      }));
      pushDebugEvent(`micPermission:${permission.status}`);
      if (permission.status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      setState((prev) => ({
        ...prev,
        status: 'Listening',
        transcript: 'Listening...',
        confidence: 0,
        suggestedAnswer: [],
        lastAudioError: null,
      }));
      lastSttConfidence01Ref.current = null;

      await streamRef.current.start(
        {
          onSpeechStart: () => {
            pushDebugEvent('speechStart');
            setState((prev) => ({ ...prev, status: 'Detecting' }));
          },
          onPartial: (text, meta) => {
            pushDebugEvent(`partial(${Math.min(text.length, 64)} chars)`);
            if (meta?.confidence != null && typeof meta.confidence === 'number' && !Number.isNaN(meta.confidence)) {
              const c = meta.confidence;
              const c01 = c > 1 ? Math.min(1, c / 100) : Math.min(1, Math.max(0, c));
              lastSttConfidence01Ref.current = c01;
              setState((prev) => ({
                ...prev,
                status: 'Transcribing',
                transcript: text,
                confidence: Math.round(c01 * 100),
              }));
            } else {
              setState((prev) => ({ ...prev, status: 'Transcribing', transcript: text }));
            }

            // If Deepgram already produced a clean question with a question mark, trigger early
            // (avoids requiring the user to stop the session manually).
            const trimmed = text.trim();
            const looksComplete = trimmed.length >= 8 && trimmed.endsWith('?');
            if (!looksComplete) return;
            if (!isLikelyQuestion(trimmed)) return;
            if (trimmed === lastAutoFinalQuestionRef.current) return;
            lastAutoFinalQuestionRef.current = trimmed;
            handleFinalQuestion(trimmed, 'auto');
          },
          onFinal: (text) => {
            handleFinalQuestion(text, 'final');
          },
          onSpeechEnd: () => {
            pushDebugEvent('speechEnd');
            setState((prev) => ({ ...prev, status: 'Idle' }));
          },
          onError: (error) => {
            console.error(error);
            pushDebugEvent(`audio:error(${error.message.slice(0, 120)})`);
            setState((prev) => ({
              ...prev,
              status: 'Idle',
              lastAudioError: error.message,
              transcript: error.message,
            }));
          },
        },
        { vadSilenceMs: settings.vadSilenceMs, chunkMs: 4000 },
      );
    } catch (error) {
      console.error('Failed to start recording', error);
      const msg = error instanceof Error ? error.message : 'Failed to start listening';
      pushDebugEvent(`startListening:error(${msg.slice(0, 120)})`);
      setState((prev) => ({
        ...prev,
        status: 'Idle',
        lastAudioError: msg,
        transcript: msg,
      }));
    }
  }, [pushDebugEvent, state.whisperModeEnabled]);

  const stopListening = useCallback(async () => {
    pushDebugEvent('stopListening()');
    setState((prev) => {
      if (prev.sessionDuration > 0) {
        void insightsTelemetryRepo.recordSessionEnd(prev.sessionDuration);
      }
      return { ...prev, status: 'Idle', sessionDuration: 0 };
    });
    try {
      await streamRef.current?.stop();
    } finally {
      streamRef.current = null;
    }
  }, [pushDebugEvent]);

  const toggleWhisperMode = useCallback(() => {
    setState((prev) => ({ ...prev, whisperModeEnabled: !prev.whisperModeEnabled }));
  }, []);

  const speakAnswer = useCallback(() => {
    if (state.suggestedAnswer.length === 0) return;
    const textToSpeak = state.suggestedAnswer.join('. ');
    Speech.speak(textToSpeak, {
      rate: 0.9,
      pitch: 1.0,
    });
  }, [state.suggestedAnswer]);

  return {
    ...state,
    isListening: state.status !== 'Idle',
    startListening,
    stopListening,
    toggleWhisperMode,
    speakAnswer,
    clearDebug: () =>
      setState((prev) => ({
        ...prev,
        lastAudioError: null,
        debugEvents: [],
      })),
  };
};
