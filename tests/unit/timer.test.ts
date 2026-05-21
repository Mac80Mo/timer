import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { Timer } from '../../src/logic/timer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts and counts down to completion', () => {
    const timer = new Timer();
    const ticks: number[] = [];
    const onComplete = vi.fn();

    timer.onTick((remaining) => {
      ticks.push(remaining);
    });
    timer.onComplete(onComplete);

    timer.start(3);

    vi.advanceTimersByTime(1000);
    expect(timer.getTimeRemaining()).toBe(2);

    vi.advanceTimersByTime(2000);
    expect(timer.getTimeRemaining()).toBe(0);
    expect(timer.getState()).toBe('completed');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(ticks).toContain(3);
    expect(ticks).toContain(2);
    expect(ticks.at(-1)).toBe(0);
  });

  it('pauses and resumes without losing the remaining duration', () => {
    const timer = new Timer();

    timer.start(10);
    vi.advanceTimersByTime(3200);
    timer.pause();

    const pausedRemaining = timer.getTimeRemaining();
    expect(pausedRemaining).toBe(7);

    vi.advanceTimersByTime(5000);
    expect(timer.getTimeRemaining()).toBe(pausedRemaining);

    timer.resume();
    vi.advanceTimersByTime(2000);
    expect(timer.getTimeRemaining()).toBe(5);
  });

  it('resets back to idle state', () => {
    const timer = new Timer();

    timer.start(5);
    vi.advanceTimersByTime(1000);
    timer.reset();

    expect(timer.getTimeRemaining()).toBe(0);
    expect(timer.getState()).toBe('idle');
  });

  it('rejects invalid durations', () => {
    const timer = new Timer();

    expect(() => timer.start(0)).toThrow('Timer duration must be a positive integer.');
    expect(() => timer.start(-3)).toThrow('Timer duration must be a positive integer.');
    expect(() => timer.start(2.5)).toThrow('Timer duration must be a positive integer.');
  });

  it('ignores pause and resume when state preconditions are not met', () => {
    const timer = new Timer();

    timer.pause();
    expect(timer.getState()).toBe('idle');

    timer.resume();
    expect(timer.getState()).toBe('idle');
  });

  it('supports removing tick and completion listeners', () => {
    const timer = new Timer();
    const onTick = vi.fn();
    const onComplete = vi.fn();

    const offTick = timer.onTick(onTick);
    const offComplete = timer.onComplete(onComplete);

    offTick();
    offComplete();

    timer.start(1);
    vi.advanceTimersByTime(1100);

    expect(onTick).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reports completed in getState when elapsed time reaches zero before next interval tick', () => {
    const timer = new Timer();

    timer.start(1);
    vi.setSystemTime(new Date('2026-05-21T10:00:01.100Z'));

    expect(timer.getState()).toBe('completed');
  });

  it('returns cached remaining ms when computeRemainingMs is called in paused state', () => {
    const timer = new Timer();

    timer.start(10);
    vi.advanceTimersByTime(1250);
    timer.pause();

    const remainingMs = (timer as unknown as { computeRemainingMs: () => number }).computeRemainingMs();
    expect(remainingMs).toBe(8750);
  });
});