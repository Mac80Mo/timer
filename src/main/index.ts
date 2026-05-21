import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';

import { parseTimerInput } from '../logic/inputParser';
import { Timer } from '../logic/timer';
import type { TimerCommandResult, TimerSnapshot } from '../shared/types';

const rendererDevUrl = process.env.VITE_DEV_SERVER_URL;
const timer = new Timer();
let mainWindow: BrowserWindow | null = null;
let muted = false;
let alarmDurationSeconds = 8;
let flashIntervalId: ReturnType<typeof setInterval> | null = null;
let alarmTimeoutIds: ReturnType<typeof setTimeout>[] = [];

const alarmRepeatIntervalMs = 650;

function createSnapshot(error?: string): TimerSnapshot {
  return {
    remainingSeconds: timer.getTimeRemaining(),
    state: timer.getState(),
    muted,
    alarmDurationSeconds,
    error,
  };
}

function broadcastState(error?: string): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send('timer:state', createSnapshot(error));
}

function stopFlashing(window: BrowserWindow): void {
  if (flashIntervalId !== null) {
    clearInterval(flashIntervalId);
    flashIntervalId = null;
  }
  window.flashFrame(false);
}

function stopAlarm(): void {
  for (const timeoutId of alarmTimeoutIds) {
    clearTimeout(timeoutId);
  }
  alarmTimeoutIds = [];
}

function triggerCompletionSignal(window: BrowserWindow): void {
  stopAlarm();
  stopFlashing(window);
  const alarmEndsAt = Date.now() + alarmDurationSeconds * 1000;
  if (!muted) {
    for (let delay = 0; Date.now() + delay < alarmEndsAt; delay += alarmRepeatIntervalMs) {
      alarmTimeoutIds.push(setTimeout(() => shell.beep(), delay));
    }
  }
  let flashes = 0;
  flashIntervalId = setInterval(() => {
    window.flashFrame(flashes % 2 === 0);
    flashes += 1;
    if (flashes >= 6) {
      stopFlashing(window);
    }
  }, 240);
}

function handleTimerAction(action: () => void): TimerCommandResult {
  try {
    action();
    broadcastState();
    return { ok: true, snapshot: createSnapshot() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler.';
    broadcastState(message);
    return { ok: false, snapshot: createSnapshot(message), error: message };
  }
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 540,
    backgroundColor: '#f2efe8',
    title: 'Desktop Timer',
    icon: join(__dirname, '../../../assets/icon.png'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });
  if (rendererDevUrl) {
    void window.loadURL(rendererDevUrl);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    void window.loadFile(join(__dirname, '../../renderer/index.html'));
  }
  window.on('focus', () => {
    stopFlashing(window);
  });
  return window;
}

timer.onTick(() => {
  broadcastState();
});

timer.onComplete(() => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    triggerCompletionSignal(mainWindow);
  }
});

ipcMain.handle('timer:start', (_event, rawInput: string) => {
  return handleTimerAction(() => {
    const seconds = parseTimerInput(rawInput);
    timer.start(seconds);
  });
});

ipcMain.handle('timer:pause', () => {
  return handleTimerAction(() => {
    timer.pause();
  });
});

ipcMain.handle('timer:resume', () => {
  return handleTimerAction(() => {
    timer.resume();
  });
});

ipcMain.handle('timer:reset', () => {
  return handleTimerAction(() => {
    timer.reset();
    stopAlarm();
    if (mainWindow && !mainWindow.isDestroyed()) {
      stopFlashing(mainWindow);
    }
  });
});

ipcMain.handle('timer:set-mute', (_event, nextMuted: boolean) => {
  muted = nextMuted;
  if (muted) {
    stopAlarm();
  }
  broadcastState();
  return createSnapshot();
});

ipcMain.handle('timer:set-alarm-duration', (_event, nextDurationSeconds: number) => {
  if (!Number.isInteger(nextDurationSeconds) || nextDurationSeconds < 3 || nextDurationSeconds > 20) {
    return createSnapshot('Alarmdauer muss zwischen 3 und 20 Sekunden liegen.');
  }
  alarmDurationSeconds = nextDurationSeconds;
  broadcastState();
  return createSnapshot();
});

ipcMain.handle('timer:get-state', () => createSnapshot());

app.setName('Desktop Timer');

app.whenReady().then(() => {
  mainWindow = createWindow();
  broadcastState();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      broadcastState();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
