export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

type TickListener = (remainingSeconds: number) => void;
type CompleteListener = () => void;

const TICK_INTERVAL_MS = 250;

export class Timer {
  private durationMs = 0;
  private remainingMs = 0;
  private startedAtMs: number | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private state: TimerState = 'idle';
  private lastEmittedSeconds = 0;
  private readonly tickListeners = new Set<TickListener>();
  private readonly completeListeners = new Set<CompleteListener>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  start(durationSeconds: number): void {
    if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
      throw new Error('Timer duration must be a positive integer.');
    }

    this.clearInterval();
    this.durationMs = durationSeconds * 1000;
    this.remainingMs = this.durationMs;
    this.startedAtMs = this.now();
    this.state = 'running';
    this.lastEmittedSeconds = durationSeconds;
    this.emitTick(durationSeconds);
    this.startInterval();
  }

  pause(): void {
    if (this.state !== 'running') {
      return;
    }

    this.remainingMs = this.computeRemainingMs();
    this.startedAtMs = null;
    this.state = 'paused';
    this.clearInterval();
  }

  resume(): void {
    if (this.state !== 'paused' || this.remainingMs <= 0) {
      return;
    }

    this.startedAtMs = this.now();
    this.state = 'running';
    this.lastEmittedSeconds = this.getTimeRemaining();
    this.startInterval();
  }

  reset(): void {
    this.clearInterval();
    this.durationMs = 0;
    this.remainingMs = 0;
    this.startedAtMs = null;
    this.state = 'idle';
    this.lastEmittedSeconds = 0;
    this.emitTick(0);
  }

  getState(): TimerState {
    if (this.state === 'running' && this.computeRemainingMs() <= 0) {
      return 'completed';
    }

    return this.state;
  }

  getTimeRemaining(): number {
    if (this.state === 'running') {
      return Math.ceil(this.computeRemainingMs() / 1000);
    }

    return Math.ceil(this.remainingMs / 1000);
  }

  onTick(listener: TickListener): () => void {
    this.tickListeners.add(listener);
    return () => {
      this.tickListeners.delete(listener);
    };
  }

  onComplete(listener: CompleteListener): () => void {
    this.completeListeners.add(listener);
    return () => {
      this.completeListeners.delete(listener);
    };
  }

  private startInterval(): void {
    this.clearInterval();
    this.intervalId = setInterval(() => {
      const remainingSeconds = Math.ceil(this.computeRemainingMs() / 1000);

      if (remainingSeconds !== this.lastEmittedSeconds) {
        this.lastEmittedSeconds = remainingSeconds;
        this.emitTick(remainingSeconds);
      }

      if (remainingSeconds <= 0) {
        this.finish();
      }
    }, TICK_INTERVAL_MS);
  }

  private finish(): void {
    this.clearInterval();
    this.remainingMs = 0;
    this.startedAtMs = null;
    this.state = 'completed';
    this.lastEmittedSeconds = 0;
    this.emitTick(0);

    for (const listener of this.completeListeners) {
      listener();
    }
  }

  private computeRemainingMs(): number {
    if (this.startedAtMs === null) {
      return this.remainingMs;
    }

    const elapsedMs = this.now() - this.startedAtMs;
    return Math.max(0, this.remainingMs - elapsedMs);
  }

  private emitTick(remainingSeconds: number): void {
    for (const listener of this.tickListeners) {
      listener(remainingSeconds);
    }
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}