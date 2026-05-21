import type { TimerState } from '../logic/timer.js';

export interface TimerSnapshot {
  remainingSeconds: number;
  state: TimerState;
  muted: boolean;
  alarmDurationSeconds: number;
  error?: string;
}

export interface TimerCommandResult {
  ok: boolean;
  snapshot: TimerSnapshot;
  error?: string;
}