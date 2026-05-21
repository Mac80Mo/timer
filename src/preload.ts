import { contextBridge, ipcRenderer } from 'electron';

import type { TimerCommandResult, TimerSnapshot } from './shared/types';

contextBridge.exposeInMainWorld('desktopTimer', {
  platform: process.platform,
  startTimer: (rawInput: string): Promise<TimerCommandResult> => ipcRenderer.invoke('timer:start', rawInput),
  pauseTimer: (): Promise<TimerCommandResult> => ipcRenderer.invoke('timer:pause'),
  resumeTimer: (): Promise<TimerCommandResult> => ipcRenderer.invoke('timer:resume'),
  resetTimer: (): Promise<TimerCommandResult> => ipcRenderer.invoke('timer:reset'),
  setMute: (muted: boolean): Promise<TimerSnapshot> => ipcRenderer.invoke('timer:set-mute', muted),
  setAlarmDurationSeconds: (seconds: number): Promise<TimerSnapshot> => ipcRenderer.invoke('timer:set-alarm-duration', seconds),
  getState: (): Promise<TimerSnapshot> => ipcRenderer.invoke('timer:get-state'),
  onStateChange: (listener: (snapshot: TimerSnapshot) => void): (() => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, snapshot: TimerSnapshot) => {
      listener(snapshot);
    };
    ipcRenderer.on('timer:state', wrapped);
    return () => {
      ipcRenderer.removeListener('timer:state', wrapped);
    };
  },
});
