---
agent: speckit.plan
---

# Timer-App: Technischer Implementierungsplan

## Produktvision (Zusammenfassung)
Eine einfache, zuverlässige GUI Desktop-Timer-Anwendung für Linux, macOS und Windows. Hochgenau, intuitiv, vollständig per Tastatur bedienbar, mit Alarm und Unterstützung für mehrere Timer.

---

## Tech-Stack & Plattform

### Primäre Entscheidungen
- **Sprache**: TypeScript (Node.js / Electron)
- **GUI Framework**: Electron + React oder HTML/CSS/Vanilla JavaScript
- **Plattformen**: Linux, macOS, Windows
- **Paketmanager**: npm oder pnpm
- **Testing**: Vitest (Unit) + Playwright (Integration)
- **Code Quality**: ESLint, Prettier

### Begründung
- **Electron**: Funktioniert auf allen 3 Plattformen, native GUI, einfach zu verteilen
- **TypeScript**: Typsicherheit, weniger Fehler, gute IDE-Unterstützung
- **React oder Vanilla JS**: React = schneller für komplexe UIs; Vanilla = schlanker, weniger Dependencies (wähle basierend auf Komplexität)
- **Vitest**: Modern, schnell, TypeScript-Support
- **Playwright**: Für E2E-Tests der GUI, Cross-Platform

---

## Architektur-Übersicht

```
timer-app/
├── src/
│   ├── main/                    # Electron Main Process
│   │   └── index.ts
│   ├── renderer/                # Electron Renderer (UI)
│   │   ├── index.html
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── components/
│   │   └── app.tsx (oder app.js)
│   ├── logic/                   # Business Logic (Timer Engine)
│   │   ├── timer.ts             # Core Timer Class
│   │   ├── timerManager.ts      # Multiple Timers Manager
│   │   └── audioAlarm.ts        # Alarm Sound Controller
│   └── shared/
│       └── types.ts             # Shared TypeScript Types
├── tests/
│   ├── unit/                    # Unit Tests
│   │   └── timer.test.ts
│   └── e2e/                     # E2E Tests (Playwright)
│       └── timer.e2e.ts
├── package.json
├── tsconfig.json
├── vite.config.ts (optional)
├── vitest.config.ts
└── README.md
```

---

## Module & Verantwortlichkeiten

### 1. **Timer Engine** (`src/logic/timer.ts`)
- **Verantwortung**: Hochgenaue Timer-Logik
- **Interface**:
  - `start(durationSeconds: number)`
  - `pause()`
  - `resume()`
  - `reset()`
  - `getTimeRemaining(): number`
  - `onTick(callback: (remaining: number) => void)` — Event bei jeder Sekunde
  - `onComplete(callback: () => void)` — Event wenn Zeit abgelaufen
- **Implementierung**: 
  - Nutze `setInterval()` oder `requestAnimationFrame()` für Genauigkeit
  - Speichere Start-Zeit + Dauer statt Counter (verhindert Drift)
  - ±1 Sekunde Genauigkeit garantiert

### 2. **Timer Manager** (`src/logic/timerManager.ts`)
- **Verantwortung**: Verwaltet mehrere Timer gleichzeitig
- **Interface**:
  - `createTimer(id: string, durationSeconds: number): Timer`
  - `deleteTimer(id: string)`
  - `getAll(): Timer[]`
  - `getById(id: string): Timer | null`
- **Implementierung**:
  - Map<id, Timer> zur Verwaltung
  - Jeder Timer läuft unabhängig

### 3. **Alarm Controller** (`src/logic/audioAlarm.ts`)
- **Verantwortung**: Auditive und visuelle Benachrichtigungen
- **Interface**:
  - `playAlarm(mute: boolean)`
  - `stopAlarm()`
- **Implementierung**:
  - Web Audio API für Sound (oder einfache `.wav` File)
  - Visuelles Signal: Fenster-Blink über Electron API
  - 3x Wiederholung oder bis User klickt

### 4. **UI/Renderer** (`src/renderer/`)
- **Verantwortung**: Benutzeroberfläche
- **Komponenten**:
  - `<TimerDisplay>` — Zeigt MM:SS
  - `<TimerInput>` — Input-Feld mit Format-Validierung
  - `<ControlButtons>` — Start, Pause, Reset, + Add Timer
  - `<TimerList>` — Liste der Timer (bei mehreren)
  - `<MuteCheckbox>` — Alarm Stumm-Option
- **Event-Handling**:
  - Tastatur-Events (Enter, Space, R, ESC) → Timer-Logik
  - Button-Clicks → Timer-Logik
  - Updates von Timer-Events → UI-Render

### 5. **Electron Main Process** (`src/main/index.ts`)
- **Verantwortung**: Window Management, App-Lifecycle
- **Aufgaben**:
  - Fenster erstellen (fest 500x300px oder ähnlich)
  - IPC-Kommunikation zwischen Main/Renderer
  - Timer-Logik läuft im Main Process (nicht Renderer = bessere Performance)

---

## Data Flow & Events

```
User Input (Keyboard/Mouse)
    ↓
Renderer (UI)
    ↓
IPC Message → Main Process
    ↓
Timer Engine (Logic)
    ↓
Events: onTick, onComplete
    ↓
IPC Message → Renderer
    ↓
UI Update (re-render time)
```

---

## Key Technical Decisions

### 1. Timer-Genauigkeit
- **Problem**: `setInterval()` ist nicht genau genug
- **Lösung**: Speichere Start-Zeit + Dauer, berechne `timeRemaining = duration - (now - startTime)`
- **Code Skizze**:
  ```typescript
  const startTime = Date.now();
  const duration = 300; // 5 Min in Sekunden
  
  const getRemaining = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, Math.ceil(duration - elapsed));
    return remaining;
  };
  ```

### 2. UI-Rendering
- **Option A (React)**: State-Update bei jedem Tick → Re-render (einfach, aber overhead)
- **Option B (Vanilla JS)**: Direktes DOM-Update per `textContent` (schlanker, schneller)
- **Empfehlung**: **Option B** für diese kleine App (kein Redux, keine komplexen States nötig)

### 3. Alarm Sound
- **Einfach**: System-Sound abspielen (`.wav` file in `assets/`)
- **Web Audio API**: Für synthetische Töne oder Modulation
- **Empfehlung**: Einfache `.wav` mit `HTMLAudioElement` oder Electron `beep()`

### 4. Keyboard Shortcuts
- **Window-Level Shortcuts** im Main Process registrieren (funktioniert auch wenn Fenster nicht fokussiert)
- **Oder**: Input-Events im Renderer handling
- **Empfehlung**: Main Process (robuster)

---

## Dependencies

### Production
- `electron`: GUI Framework
- Optional: `react` (wenn UI komplex wird), sonst Vanilla HTML/CSS/JS

### Dev
- `typescript`
- `vitest` (Unit-Tests)
- `playwright` (E2E-Tests)
- `eslint`, `prettier`
- `electron-builder` (Packaging für Distribution)

---

## File Structure (Detailliert)

```
timer-app/
├── src/
│   ├── main/
│   │   └── index.ts           # Electron Main Entry
│   ├── renderer/
│   │   ├── index.html         # Main HTML
│   │   ├── app.js/app.tsx     # Main React/JS App
│   │   ├── components/
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── TimerInput.tsx
│   │   │   ├── ControlButtons.tsx
│   │   │   └── TimerList.tsx
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── utils/
│   │       └── formatTime.ts  # Utility: seconds → MM:SS
│   ├── logic/
│   │   ├── timer.ts
│   │   ├── timerManager.ts
│   │   ├── audioAlarm.ts
│   │   └── __tests__/
│   │       ├── timer.test.ts
│   │       └── timerManager.test.ts
│   ├── shared/
│   │   └── types.ts           # Shared interfaces
│   └── preload.ts (optional)   # Electron preload for security
├── tests/
│   ├── e2e/
│   │   └── timer.e2e.ts       # Playwright tests
│   └── fixtures/
│       └── timer.wav           # Test Alarm Sound
├── assets/
│   └── alarm.wav               # Default Alarm Sound
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── electron-builder.json       # Packaging config
└── README.md
```

---

## Development Workflow

1. **Development**: `npm run dev` → Startet Electron in Dev-Mode mit Hot-Reload
2. **Testing**: `npm run test` → Vitest für Unit-Tests
3. **E2E Testing**: `npm run test:e2e` → Playwright Tests
4. **Linting**: `npm run lint` → ESLint + Prettier
5. **Build**: `npm run build` → Kompiliert zu ausführbarem Executable
6. **Package**: `npm run package` → erstellt Installer für Linux/macOS/Windows

---

## Non-Functional Requirements im Plan

### Performance
- ✅ Timer-Genauigkeit durch Zeit-basierte Berechnung
- ✅ UI-Updates nur bei Änderungen (keine unnötigen Re-Renders)
- ✅ Kein Polling, Event-basiert

### Reliability
- ✅ Error Handling für ungültige Eingaben
- ✅ Graceful Degradation (wenn Alarm-Datei fehlt, trotzdem laufen)

### Testability
- ✅ Timer-Logik isoliert von UI (einfach zu testen)
- ✅ Unit-Tests für Timer-Mathematik
- ✅ E2E-Tests für User-Workflows

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Timer-Drift über lange Zeiten | Nutz Zeit-basierte Berechnung (nicht Counter) |
| GUI verzögert sich | Main Process für Timer-Logik, Renderer nur für UI |
| Keyboard-Events funktionieren nicht | Teste auf allen 3 Plattformen, nutze Electron APIs |
| Alarm-Sound nicht vorhanden | Fallback zu System-Beep |
| Memory-Leak bei mehreren Timern | Cleanup bei Timer-Löschung, EventListener entfernen |

---

## Next Steps

1. **Setup**: Electron + TypeScript Boilerplate
2. **Core Implementation**: Timer Engine (1-2 Tage)
3. **UI Implementation**: React/Vanilla JS (2-3 Tage)
4. **Testing**: Unit + E2E (1-2 Tage)
5. **Packaging**: Electron-Builder Setup (1 Tag)
6. **Launch**: Beta-Test auf allen 3 Plattformen

**Estimated MVP Time**: 1-2 Wochen

---

**Version**: 1.0.0 | **Created**: 2026-05-21 | **Status**: Ready for /speckit.tasks
