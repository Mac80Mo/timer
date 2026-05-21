import type { TimerSnapshot } from '../shared/types';
import { parseTimerInput } from '../logic/inputParser';
import { Timer } from '../logic/timer';

type TimerApi = Window['desktopTimer'];

type BrowserTimerApi = TimerApi & {
	playAlarmPreview: () => Promise<boolean>;
	getAudioStatus: () => string;
};

const ALARM_DURATION_STORAGE_KEY = 'desktop-timer-alarm-duration';
const DEFAULT_ALARM_DURATION_SECONDS = 8;
const MIN_ALARM_DURATION_SECONDS = 3;
const MAX_ALARM_DURATION_SECONDS = 20;

function createBrowserTimerApi(): BrowserTimerApi {
	const timer = new Timer();
	let muted = false;
	let alarmDurationSeconds = DEFAULT_ALARM_DURATION_SECONDS;
	let audioContext: AudioContext | null = null;
	let pendingAlarmTimeouts: number[] = [];
	let audioStatus = 'Audio noch nicht aktiviert.';
	const listeners = new Set<(snapshot: TimerSnapshot) => void>();

	const stopAlarm = (): void => {
		for (const timeoutId of pendingAlarmTimeouts) {
			window.clearTimeout(timeoutId);
		}
		pendingAlarmTimeouts = [];
	};

	const ensureAudioContext = async (): Promise<AudioContext | null> => {
		const AudioContextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioContextCtor) {
			audioStatus = 'Dieser Browser unterstuetzt keinen Web-Audio-Alarm.';
			return null;
		}

		if (!audioContext) {
			audioContext = new AudioContextCtor();
		}

		try {
			if (audioContext.state === 'suspended') {
				await audioContext.resume();
			}
		} catch {
			audioStatus = 'Browser blockiert Audio. Bitte Alarm testen klicken.';
			return null;
		}

		audioStatus = audioContext.state === 'running'
			? 'Audio bereit.'
			: 'Audio konnte nicht aktiviert werden.';

		return audioContext;
	};

	const playBeep = async (): Promise<boolean> => {
		const context = await ensureAudioContext();
		if (!context) {
			return false;
		}

		const oscillator = context.createOscillator();
		const gainNode = context.createGain();
		const startAt = context.currentTime;

		oscillator.type = 'square';
		oscillator.frequency.setValueAtTime(988, startAt);
		gainNode.gain.setValueAtTime(0.0001, startAt);
		gainNode.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
		gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.32);

		oscillator.connect(gainNode);
		gainNode.connect(context.destination);

		oscillator.start(startAt);
		oscillator.stop(startAt + 0.32);
		audioStatus = 'Alarmton wurde abgespielt.';
		return true;
	};

	const scheduleAlarm = (): void => {
		stopAlarm();
		if (muted) {
			audioStatus = 'Alarm ist stummgeschaltet.';
			return;
		}

		const repeats = Math.max(1, Math.ceil((alarmDurationSeconds * 1000) / 650));
		pendingAlarmTimeouts = Array.from({ length: repeats }, (_value, index) => index * 650).map((delay) => {
			return window.setTimeout(() => {
				void playBeep();
			}, delay);
		});
	};

	const snapshot = (error?: string): TimerSnapshot => ({
		remainingSeconds: timer.getTimeRemaining(),
		state: timer.getState(),
		muted,
		alarmDurationSeconds,
		error,
	});

	const notify = (error?: string): TimerSnapshot => {
		const nextSnapshot = snapshot(error);
		for (const listener of listeners) {
			listener(nextSnapshot);
		}
		return nextSnapshot;
	};

	timer.onTick(() => {
		notify();
	});

	timer.onComplete(() => {
		scheduleAlarm();
		notify();
	});

	const runAction = async (action: () => void) => {
		try {
			action();
			return { ok: true, snapshot: notify() };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unbekannter Fehler.';
			return { ok: false, snapshot: notify(message), error: message };
		}
	};

	return {
		platform: 'browser',
		startTimer: async (rawInput: string) => {
			await ensureAudioContext();
			return runAction(() => timer.start(parseTimerInput(rawInput)));
		},
		pauseTimer: () => runAction(() => timer.pause()),
		resumeTimer: () => runAction(() => timer.resume()),
		resetTimer: () => runAction(() => {
			stopAlarm();
			timer.reset();
		}),
		setMute: async (nextMuted: boolean) => {
			muted = nextMuted;
			if (muted) {
				stopAlarm();
				audioStatus = 'Alarm ist stummgeschaltet.';
			}
			return notify();
		},
		setAlarmDurationSeconds: async (nextDurationSeconds: number) => {
			if (!Number.isInteger(nextDurationSeconds) || nextDurationSeconds < MIN_ALARM_DURATION_SECONDS || nextDurationSeconds > MAX_ALARM_DURATION_SECONDS) {
				return notify('Alarmdauer muss zwischen 3 und 20 Sekunden liegen.');
			}

			alarmDurationSeconds = nextDurationSeconds;
			window.localStorage.setItem(ALARM_DURATION_STORAGE_KEY, String(nextDurationSeconds));
			return notify();
		},
		getState: async () => snapshot(),
		playAlarmPreview: async () => {
			stopAlarm();
			const attempts = await Promise.all(Array.from({ length: Math.max(1, Math.ceil((alarmDurationSeconds * 1000) / 650)) }, () => playBeep()));
			return attempts.some(Boolean);
		},
		getAudioStatus: () => audioStatus,
		onStateChange: (listener: (snapshot: TimerSnapshot) => void) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};
}

const timerApi = window.desktopTimer ?? createBrowserTimerApi();
const browserTimerApi = 'playAlarmPreview' in timerApi ? (timerApi as BrowserTimerApi) : null;

function requireNode<T>(node: T | null, message: string): T {
	if (!node) {
		throw new Error(message);
	}

	return node;
}

const displayNode = requireNode(document.querySelector<HTMLDivElement>('#display'), 'Display fehlt.');
const formNode = requireNode(document.querySelector<HTMLFormElement>('#timer-form'), 'Formular fehlt.');
const inputNode = requireNode(document.querySelector<HTMLInputElement>('#duration-input'), 'Input fehlt.');
const themeToggle = requireNode(document.querySelector<HTMLInputElement>('#theme-toggle'), 'Theme-Toggle fehlt.');
const pauseButton = requireNode(document.querySelector<HTMLButtonElement>('#pause-button'), 'Pause-Button fehlt.');
const resetButton = requireNode(document.querySelector<HTMLButtonElement>('#reset-button'), 'Reset-Button fehlt.');
const testAlarmButton = requireNode(document.querySelector<HTMLButtonElement>('#test-alarm-button'), 'Test-Alarm-Button fehlt.');
const muteCheckbox = requireNode(document.querySelector<HTMLInputElement>('#mute-checkbox'), 'Mute-Checkbox fehlt.');
const alarmDurationInput = requireNode(document.querySelector<HTMLInputElement>('#alarm-duration-input'), 'Alarmdauer-Regler fehlt.');
const alarmDurationValue = requireNode(document.querySelector<HTMLSpanElement>('#alarm-duration-value'), 'Alarmdauer-Wert fehlt.');
const audioStatusNode = requireNode(document.querySelector<HTMLParagraphElement>('#audio-status'), 'Audio-Status fehlt.');
const alarmBanner = requireNode(document.querySelector<HTMLElement>('#alarm-banner'), 'Alarm-Banner fehlt.');
const alarmMessage = requireNode(document.querySelector<HTMLParagraphElement>('#alarm-message'), 'Alarm-Text fehlt.');
const dismissAlarmButton = requireNode(document.querySelector<HTMLButtonElement>('#dismiss-alarm-button'), 'Alarm-Button fehlt.');
const errorNode = requireNode(document.querySelector<HTMLParagraphElement>('#error-message'), 'Fehlerausgabe fehlt.');
const heroCard = requireNode(document.querySelector<HTMLElement>('.hero-card'), 'Kartenlayout fehlt.');

const platformNode = document.createElement('p');
platformNode.className = 'platform-note';
platformNode.textContent = `Laufzeitplattform: ${timerApi.platform}`;
heroCard.append(platformNode);

let currentSnapshot: TimerSnapshot = {
	remainingSeconds: 0,
	state: 'idle',
	muted: false,
	alarmDurationSeconds: DEFAULT_ALARM_DURATION_SECONDS,
};
let alarmDismissed = false;

const THEME_STORAGE_KEY = 'desktop-timer-theme';

function applyTheme(theme: 'dark' | 'light'): void {
	document.documentElement.dataset.theme = theme;
	themeToggle.checked = theme === 'light';
	window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function initializeTheme(): void {
	const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
	applyTheme(storedTheme === 'light' ? 'light' : 'dark');
}

function applyAlarmDuration(seconds: number): void {
	alarmDurationInput.value = String(seconds);
	alarmDurationValue.textContent = String(seconds);
	window.localStorage.setItem(ALARM_DURATION_STORAGE_KEY, String(seconds));
}

function initializeAlarmDuration(): void {
	const storedDuration = Number.parseInt(window.localStorage.getItem(ALARM_DURATION_STORAGE_KEY) ?? '', 10);
	const duration = Number.isInteger(storedDuration) && storedDuration >= MIN_ALARM_DURATION_SECONDS && storedDuration <= MAX_ALARM_DURATION_SECONDS
		? storedDuration
		: DEFAULT_ALARM_DURATION_SECONDS;
	applyAlarmDuration(duration);
	void timerApi.setAlarmDurationSeconds(duration).then((result) => {
		render(result);
	});
}

function formatTime(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60)
		.toString()
		.padStart(2, '0');
	const seconds = Math.floor(totalSeconds % 60)
		.toString()
		.padStart(2, '0');
	return `${minutes}:${seconds}`;
}

function render(snapshot: TimerSnapshot): void {
	currentSnapshot = snapshot;
	if (snapshot.state !== 'completed') {
		alarmDismissed = false;
	}
	displayNode.textContent = formatTime(snapshot.remainingSeconds);
	errorNode.textContent = snapshot.error ?? '';
	heroCard.classList.toggle('alarm-active', snapshot.state === 'completed');
	pauseButton.textContent = snapshot.state === 'paused' ? 'Fortsetzen' : 'Pause';
	pauseButton.disabled = snapshot.state === 'idle' || snapshot.state === 'completed';
	resetButton.disabled = snapshot.state === 'idle' && snapshot.remainingSeconds === 0;
	muteCheckbox.checked = snapshot.muted;
	alarmDurationValue.textContent = String(snapshot.alarmDurationSeconds);
	if (alarmDurationInput.value !== String(snapshot.alarmDurationSeconds)) {
		alarmDurationInput.value = String(snapshot.alarmDurationSeconds);
	}
	alarmBanner.hidden = snapshot.state !== 'completed' || alarmDismissed;
	alarmMessage.textContent = snapshot.muted
		? 'Zeit abgelaufen. Ton ist stummgeschaltet.'
		: 'Zeit abgelaufen. Alarm ist aktiv.';
	audioStatusNode.textContent = browserTimerApi?.getAudioStatus() ?? '';
}

async function startTimer(): Promise<void> {
	const result = await timerApi.startTimer(inputNode.value);
	render(result.snapshot);
}

async function togglePause(): Promise<void> {
	const action = currentSnapshot.state === 'paused' ? 'resumeTimer' : 'pauseTimer';
	const result = await timerApi[action]();
	render(result.snapshot);
}

formNode.addEventListener('submit', (event) => {
	event.preventDefault();
	void startTimer();
});

pauseButton.addEventListener('click', () => {
	void togglePause();
});

resetButton.addEventListener('click', () => {
	void timerApi.resetTimer().then((result) => {
		render(result.snapshot);
	});
});

themeToggle.addEventListener('change', () => {
	applyTheme(themeToggle.checked ? 'light' : 'dark');
});

testAlarmButton.addEventListener('click', () => {
	if (!browserTimerApi) {
		audioStatusNode.textContent = 'Alarmtest ist nur im Browser-Fallback verfuegbar.';
		return;
	}

	void browserTimerApi.playAlarmPreview().then(() => {
		audioStatusNode.textContent = browserTimerApi.getAudioStatus();
	});
});

alarmDurationInput.addEventListener('input', () => {
	const nextDuration = Number.parseInt(alarmDurationInput.value, 10);
	if (!Number.isInteger(nextDuration)) {
		return;
	}

	applyAlarmDuration(nextDuration);
	void timerApi.setAlarmDurationSeconds(nextDuration).then((result) => {
		render(result);
	});
});

dismissAlarmButton.addEventListener('click', () => {
	alarmDismissed = true;
	alarmBanner.hidden = true;
});

muteCheckbox.addEventListener('change', () => {
	void timerApi.setMute(muteCheckbox.checked).then(render);
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		errorNode.textContent = '';
		if (currentSnapshot.state === 'completed') {
			alarmDismissed = true;
			alarmBanner.hidden = true;
		}
		return;
	}

	if (event.key.toLowerCase() === 'r') {
		event.preventDefault();
		void timerApi.resetTimer().then((result) => {
			render(result.snapshot);
		});
		return;
	}

	if (event.key === ' ' && document.activeElement !== inputNode) {
		event.preventDefault();
		if (currentSnapshot.state === 'running' || currentSnapshot.state === 'paused') {
			void togglePause();
		}
	}
});

const unsubscribe = timerApi.onStateChange(render);
window.addEventListener('beforeunload', unsubscribe);

initializeTheme();
initializeAlarmDuration();
void timerApi.getState().then(render);

export { formatTime };