import { describe, expect, it } from 'vitest';

import { parseTimerInput, toDurationSeconds } from '../../src/logic/inputParser';

describe('parseTimerInput', () => {
  it('parses clock format', () => {
    expect(parseTimerInput('05:30')).toBe(330);
    expect(parseTimerInput('9:05')).toBe(545);
  });

  it('parses human-readable format', () => {
    expect(parseTimerInput('5m 30s')).toBe(330);
    expect(parseTimerInput('2m')).toBe(120);
    expect(parseTimerInput('45s')).toBe(45);
    expect(parseTimerInput(' 5M   3S ')).toBe(303);
  });

  it('treats bare numbers as minutes', () => {
    expect(parseTimerInput('15')).toBe(900);
  });

  it('rejects invalid values', () => {
    expect(() => parseTimerInput('')).toThrow('Bitte eine Dauer eingeben.');
    expect(() => parseTimerInput('999:99')).toThrow('Ungueltige Zeit (Max 999:59).');
    expect(() => parseTimerInput('0:00')).toThrow('Die Dauer muss groesser als 0 sein.');
    expect(() => parseTimerInput('abc')).toThrow('Ungueltige Zeit. Nutze MM:SS oder 5m 30s.');
  });

  it('rejects non-integer duration parts in helper guard', () => {
    expect(() => toDurationSeconds(1.5, 20)).toThrow('Ungueltige Zeit.');
    expect(() => toDurationSeconds(1, 2.5)).toThrow('Ungueltige Zeit.');
  });
});