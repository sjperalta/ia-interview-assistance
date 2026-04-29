import { Audio } from 'expo-av';
import type { SpeechStream, SpeechStreamEventHandlers, SpeechStreamStartOptions } from '../types/speech-stream';

type DeepgramListenResponse = {
  results?: {
    channels?: {
      alternatives?: {
        transcript?: string;
        confidence?: number;
      }[];
    }[];
  };
};

function buildDeepgramListenUrl(): string {
  const url = new URL('https://api.deepgram.com/v1/listen');
  // Accuracy + readability defaults.
  url.searchParams.set('model', 'nova-3');
  url.searchParams.set('smart_format', 'true');
  url.searchParams.set('punctuate', 'true');
  url.searchParams.set('numerals', 'true');
  // Helps segmentation for conversational speech; transcript field still exists in results.
  url.searchParams.set('utterances', 'true');
  return url.toString();
}

function getDeepgramKey(): string | null {
  // eslint-disable-next-line no-undef
  const key = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY as string | undefined;
  return key?.trim() ? key : null;
}

async function transcribeWithDeepgram(uri: string): Promise<{ transcript: string; confidence: number | null }> {
  const key = getDeepgramKey();
  if (!key) throw new Error('Missing EXPO_PUBLIC_DEEPGRAM_API_KEY');

  const audioResponse = await fetch(uri);
  const blob = await audioResponse.blob();

  const res = await fetch(buildDeepgramListenUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Token ${key}`,
      'Content-Type': (blob as any).type || 'audio/mp4',
    },
    body: blob as any,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Deepgram error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as DeepgramListenResponse;
  const alt = json.results?.channels?.[0]?.alternatives?.[0];
  const transcript = (alt?.transcript ?? '').trim();
  const confidence = typeof alt?.confidence === 'number' ? alt.confidence : null;

  return { transcript, confidence };
}

export class DeepgramChunkSpeechStream implements SpeechStream {
  private recording: Audio.Recording | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private handlers: SpeechStreamEventHandlers | null = null;
  private options: SpeechStreamStartOptions | null = null;
  private bufferedText = '';
  private isRunning = false;
  private isFlushing = false;

  async start(handlers: SpeechStreamEventHandlers, options: SpeechStreamStartOptions): Promise<void> {
    this.handlers = handlers;
    this.options = options;
    this.bufferedText = '';
    this.isRunning = true;

    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== 'granted') throw new Error('Microphone permission not granted');

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    await this.startNewRecording();
    handlers.onSpeechStart?.();

    this.interval = setInterval(() => {
      void this.flushChunk();
    }, options.chunkMs);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.interval) clearInterval(this.interval);
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    this.interval = null;
    this.silenceTimer = null;
    await this.stopRecordingSafe();

    const finalText = this.bufferedText.trim();
    if (finalText) this.handlers?.onFinal?.(finalText);
    this.handlers?.onSpeechEnd?.();

    this.handlers = null;
    this.options = null;
  }

  private async startNewRecording() {
    if (!this.isRunning) return;
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    this.recording = recording;
  }

  private async stopRecordingSafe(): Promise<string | null> {
    if (!this.recording) return null;
    try {
      await this.recording.stopAndUnloadAsync();
      return this.recording.getURI() ?? null;
    } finally {
      this.recording = null;
    }
  }

  private bumpSilenceFinalizer() {
    const ms = this.options?.vadSilenceMs ?? 1000;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => {
      const text = this.bufferedText.trim();
      if (text) this.handlers?.onFinal?.(text);
      this.bufferedText = '';
    }, ms);
  }

  private async flushChunk(): Promise<void> {
    const handlers = this.handlers;
    if (!handlers || !this.isRunning) return;
    if (this.isFlushing) return;
    this.isFlushing = true;

    try {
      const uri = await this.stopRecordingSafe();
      await this.startNewRecording();
      if (!uri) return;

      const { transcript, confidence } = await transcribeWithDeepgram(uri);
      if (!transcript) return;

      this.bufferedText = [this.bufferedText, transcript].filter(Boolean).join(' ').trim();
      handlers.onPartial?.(this.bufferedText, { confidence });
      this.bumpSilenceFinalizer();
    } catch (e) {
      handlers.onError?.(e instanceof Error ? e : new Error('Unknown speech error'));
    } finally {
      this.isFlushing = false;
    }
  }
}

