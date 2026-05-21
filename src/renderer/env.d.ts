interface Window {
  desktopTimer: {
    platform: string;
    startTimer(rawInput: string): Promise<import('../shared/types').TimerCommandResult>;
    pauseTimer(): Promise<import('../shared/types').TimerCommandResult>;
    resumeTimer(): Promise<import('../shared/types').TimerCommandResult>;
    resetTimer(): Promise<import('../shared/types').TimerCommandResult>;
    setMute(muted: boolean): Promise<import('../shared/types').TimerSnapshot>;
    setAlarmDurationSeconds(seconds: number): Promise<import('../shared/types').TimerSnapshot>;
    getState(): Promise<import('../shared/types').TimerSnapshot>;
    onStateChange(listener: (snapshot: import('../shared/types').TimerSnapshot) => void): () => void;
  };
}