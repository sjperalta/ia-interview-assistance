export function normalizeQuestion(input: string, maxLen = 200): string {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized.length > maxLen ? normalized.slice(0, maxLen) : normalized;
}

export function nonWhitespaceLength(input: string): number {
  return input.replace(/\s/g, '').length;
}

