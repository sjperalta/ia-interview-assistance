import type { AnswerStyle } from '#root/features/settings/types/settings';
import { nonWhitespaceLength, normalizeQuestion } from '#root/utils/normalize-question';

export type GenerateAnswerInput = {
  question: string;
  style: AnswerStyle;
};

export type GenerateAnswerOutput = {
  bullets: string[];
  raw: string;
  latencyMs: number;
  model: string;
};

type DeepSeekChatCompletionResponse = {
  choices?: {
    message?: { content?: string };
  }[];
  model?: string;
};

function getDeepSeekKey(): string | null {
  // eslint-disable-next-line no-undef
  const key = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY as string | undefined;
  return key?.trim() ? key : null;
}

function normalizeBullets(raw: string): string[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const fromLines = lines
    .map((l) => l.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '').trim())
    .filter(Boolean);

  const bullets = (fromLines.length ? fromLines : [raw.trim()])
    .flatMap((l) => l.split(/\s*(?:\n|(?<=\.)\s+)(?=[A-Z0-9])/g))
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);

  return bullets;
}

const MIN_QUESTION_CHARS = 10;
const COOLDOWN_MS = 5000;

let lastCallAt = 0;
let lastQuestionNorm = '';

export async function generateInterviewAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
  const key = getDeepSeekKey();
  if (!key) throw new Error('Missing EXPO_PUBLIC_DEEPSEEK_API_KEY');

  const question = input.question.trim();
  if (!question) throw new Error('Empty question');

  const now = Date.now();
  if (nonWhitespaceLength(question) < MIN_QUESTION_CHARS) {
    throw new Error('Question too short (client)');
  }

  const qNorm = normalizeQuestion(question);
  if (qNorm === lastQuestionNorm) {
    throw new Error('Duplicate question suppressed');
  }
  if (now - lastCallAt < COOLDOWN_MS) {
    throw new Error('Cooldown active (client)');
  }

  const t0 = Date.now();
  const model = 'deepseek-chat';

  const styleHint =
    input.style === 'slightly_detailed'
      ? 'Slightly more detailed than usual, but still skimmable.'
      : 'Ultra concise. Optimized for fast reading.';

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are an interview copilot. Respond with bullet points only. Keep them high-signal and practical.',
      },
      {
        role: 'user',
        content: [
          styleHint,
          'Rules:',
          '- Max 3 bullet points.',
          "- No long paragraphs. No preamble. No headings. Don't mention the rules.",
          '',
          `Question: ${question}`,
        ].join('\n'),
      },
    ],
    temperature: 0.4,
  };

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const latencyMs = Date.now() - t0;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`DeepSeek error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as DeepSeekChatCompletionResponse;
  const raw = (json.choices?.[0]?.message?.content ?? '').trim();
  const bullets = normalizeBullets(raw);

  // Only commit cooldown/dedupe after a successful response so callers can retry
  // when the request fails (network/API error).
  lastCallAt = Date.now();
  lastQuestionNorm = qNorm;

  return {
    bullets,
    raw,
    latencyMs,
    model: json.model ?? model,
  };
}

