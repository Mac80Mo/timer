const HUMAN_FORMAT = /^(?:(\d+)m)?\s*(?:(\d+)s)?$/i;
const CLOCK_FORMAT = /^(\d{1,3}):(\d{1,2})$/;

export function parseTimerInput(rawInput: string): number {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    throw new Error('Bitte eine Dauer eingeben.');
  }

  const clockMatch = trimmed.match(CLOCK_FORMAT);
  if (clockMatch) {
    const minutes = Number.parseInt(clockMatch[1], 10);
    const seconds = Number.parseInt(clockMatch[2], 10);
    return toDurationSeconds(minutes, seconds);
  }

  const humanMatch = trimmed.match(HUMAN_FORMAT);
  if (humanMatch && (humanMatch[1] || humanMatch[2])) {
    const minutes = Number.parseInt(humanMatch[1] ?? '0', 10);
    const seconds = Number.parseInt(humanMatch[2] ?? '0', 10);
    return toDurationSeconds(minutes, seconds);
  }

  if (/^\d+$/.test(trimmed)) {
    return toDurationSeconds(Number.parseInt(trimmed, 10), 0);
  }

  throw new Error('Ungueltige Zeit. Nutze MM:SS oder 5m 30s.');
}

export function toDurationSeconds(minutes: number, seconds: number): number {
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || seconds < 0) {
    throw new Error('Ungueltige Zeit.');
  }

  if (seconds > 59 || minutes > 999) {
    throw new Error('Ungueltige Zeit (Max 999:59).');
  }

  const total = minutes * 60 + seconds;
  if (total <= 0) {
    throw new Error('Die Dauer muss groesser als 0 sein.');
  }

  return total;
}