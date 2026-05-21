# Timer-App: Aufgabenliste (Tasks)

## Projektrahmen
Basierend auf:
- **Specification**: 6 User Stories (P1/P2), Edge Cases, Acceptance Criteria
- **Plan**: Electron + TypeScript + Vitest + Playwright, modulare Architektur
- **MVP-Ziel**: ~1-2 Wochen

---

## Phase 1: Project Setup & Infrastructure (2 Tage)

### Task 1.1: Electron + TypeScript Boilerplate erstellen
**Story**: Als Developer möchte ich ein funktionierendes Electron+TS Projekt-Setup haben, damit ich sofort mit Code anfangen kann
**Priority**: P1 (Blocker)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] `npm init` mit package.json, TypeScript-Config, Electron dependency
- [ ] Main Process (`src/main/index.ts`) lädt Renderer
- [ ] Renderer (`src/renderer/index.html`) lädt App
- [ ] `npm run dev` startet Electron in Dev-Mode
- [ ] Hot-Reload funktioniert (für schnelle Iteration)

**Dependencies**: None

---

### Task 1.2: Testing-Framework Setup (Vitest + Playwright)
**Story**: Als Developer möchte ich Unit- und E2E-Tests schreiben können, damit die App zuverlässig läuft
**Priority**: P1 (Blocker)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] Vitest konfiguriert für Unit-Tests (`tests/unit/`)
- [ ] Playwright konfiguriert für E2E-Tests (`tests/e2e/`)
- [ ] `npm run test` läuft Unit-Tests
- [ ] `npm run test:e2e` läuft E2E-Tests
- [ ] Einfacher Test-Template existiert
- [ ] Code Coverage Tool konfiguriert

**Dependencies**: Task 1.1

---

### Task 1.3: ESLint + Prettier Setup
**Story**: Als Team möchte ich konsistenten Code-Style haben, damit Code Review einfacher ist
**Priority**: P2 (Nice-to-have)
**Estimated Effort**: 0.5 Tag

**Acceptance Criteria**:
- [ ] ESLint konfiguriert für TypeScript
- [ ] Prettier konfiguriert
- [ ] `npm run lint` funktioniert
- [ ] `npm run format` formatiert Code

**Dependencies**: Task 1.1

---

## Phase 2: Core Business Logic (3 Tage)

### Task 2.1: Timer Engine (Basis-Klasse)
**Story**: Als Developer möchte ich eine hochgenaue Timer-Klasse haben, damit die Timer-Logik zuverlässig läuft
**Priority**: P1 (Critical)
**Estimated Effort**: 1 Tag

**Acceptance Criteria**:
- [ ] `src/logic/timer.ts` implementiert
- [ ] Interface: `start()`, `pause()`, `resume()`, `reset()`, `getTimeRemaining()`
- [ ] Zeit-basierte Berechnung (Start-Zeit + Dauer, nicht Counter)
- [ ] Events: `onTick(callback)`, `onComplete(callback)`
- [ ] Unit-Tests: `tests/unit/timer.test.ts` mit >80% Coverage
- [ ] Genauigkeit ±1 Sekunde über 60 Min garantiert

**Acceptance Scenarios** (BDD):
1. **Given** Timer mit 5 Minuten, **When** Start gedrückt, **Then** zählt herunter
2. **Given** Timer bei 2:35, **When** Pause gedrückt, **Then** stoppt und zeigt 2:35
3. **Given** Timer pausiert, **When** Resume gedrückt, **Then** läuft weiter von 2:35
4. **Given** Timer bei 3:00, **When** Reset gedrückt, **Then** zeigt 0:00

**Dependencies**: Task 1.1, Task 1.2

---

### Task 2.2: Timer Manager (Multiple Timers)
**Story**: Als User möchte ich mehrere Timer gleichzeitig haben, damit ich Aufgaben parallel timen kann
**Priority**: P2 (für MVP: optional, aber geplant)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] `src/logic/timerManager.ts` implementiert
- [ ] Interface: `createTimer(id, duration)`, `deleteTimer(id)`, `getAll()`, `getById(id)`
- [ ] Map<id, Timer> Verwaltung
- [ ] Jeder Timer läuft unabhängig
- [ ] Unit-Tests: >80% Coverage
- [ ] Keine Race-Conditions bei parallelem Zugriff

**Dependencies**: Task 2.1

---

### Task 2.3: Alarm Controller (Sound + Visual)
**Story**: Als User möchte ich hören und sehen, wenn die Zeit abgelaufen ist, damit ich nicht vergesse, dass der Timer zuende ist
**Priority**: P1 (Critical)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] `src/logic/audioAlarm.ts` implementiert
- [ ] Interface: `playAlarm(mute: boolean)`, `stopAlarm()`
- [ ] Audio-Datei in `assets/alarm.wav` vorhanden
- [ ] Visuelles Signal: Fenster-Blink (via Electron API)
- [ ] Alarm läuft 3x und stoppt dann (oder bis User klickt)
- [ ] Mute-Option funktioniert
- [ ] Unit-Tests für Alarm-Logik

**Dependencies**: Task 1.1

---

### Task 2.4: Input-Validierung & Parsing
**Story**: Als Developer möchte ich robuste Input-Validierung, damit die App nicht crasht bei ungültigen Eingaben
**Priority**: P1 (Critical)
**Estimated Effort**: 0.5 Tag

**Acceptance Criteria**:
- [ ] `src/logic/inputParser.ts` oder Util-Funktion
- [ ] Parsing: "5:30" oder "5m 30s" → 330 Sekunden
- [ ] Validation: 0-999:59 Range
- [ ] Error-Messages: "Ungültige Zeit (Max 999:59)"
- [ ] Unit-Tests: Edge Cases (0:00, 999:59, invalid input)
- [ ] Typsicher (TypeScript)

**Dependencies**: Task 1.1, Task 1.2

---

## Phase 3: UI/Renderer Implementation (3 Tage)

### Task 3.1: HTML-Grundstruktur & CSS (Design)
**Story**: Als User möchte ich eine klare, gut lesbare Oberfläche, damit ich den Timer einfach bedienen kann
**Priority**: P1 (Critical)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] `src/renderer/index.html` erstellt
- [ ] `src/renderer/styles/main.css` mit Design
- [ ] Zeitanzeige: mindestens 32pt, gut lesbar
- [ ] Guter Kontrast (WCAG AA minimum)
- [ ] Responsive auf verschiedenen Fenstergrößen
- [ ] Accessible (semantic HTML, ARIA-Labels)
- [ ] Keyboard-fokussierbar

**Acceptance Design**:
```
┌─────────────────────────┐
│    Desktop Timer App    │
├─────────────────────────┤
│                         │
│      05:30              │  ← Große Zeitanzeige
│                         │
├─────────────────────────┤
│ [Input: 5:30]  [Enter]  │  ← Eingabe + Button
├─────────────────────────┤
│  [Start]  [Pause] [R]   │  ← Control Buttons
│  [Mute □]                │  ← Alarm Stumm-Option
└─────────────────────────┘
```

**Dependencies**: Task 1.1

---

### Task 3.2: Timer Display & Real-Time Updates
**Story**: Als User möchte ich sehen, wie die Zeit zählt, damit ich verfolgen kann, wie lange es noch dauert
**Priority**: P1 (Critical)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] `src/renderer/app.js` (oder `.tsx` bei React)
- [ ] DOM-Element für Zeitanzeige (z.B. `<div id="display">`)
- [ ] IPC-Kommunikation mit Main Process (Timer-Events)
- [ ] Display aktualisiert sich jede Sekunde
- [ ] Format: MM:SS (leading zeros)
- [ ] Keine unnötigen DOM-Updates (Performance)
- [ ] Unit-Tests für Time-Formatting

**Dependencies**: Task 2.1, Task 3.1

---

### Task 3.3: Input-Feld & Keyboard-Handling
**Story**: Als User möchte ich den Timer mit Enter oder Tasten bedienen, damit ich schnell arbeiten kann
**Priority**: P1 (Critical)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] Input-Feld mit Fokus-Management
- [ ] Enter-Taste startet Timer
- [ ] Leertaste pausiert/resumed
- [ ] R-Taste setzt zurück
- [ ] ESC macht [zu definieren: was genau?]
- [ ] Error-Meldungen werden angezeigt (inline oder Modal)
- [ ] Eingabe wird validiert BEFORE Timer startet
- [ ] Unit-Tests für alle Shortcuts

**Dependencies**: Task 2.4, Task 3.1, Task 3.2

---

### Task 3.4: Control Buttons (Start/Pause/Reset)
**Story**: Als User möchte ich Buttons haben, falls ich lieber klicke statt Tasten zu drücken
**Priority**: P2 (aber parallel möglich)
**Estimated Effort**: 0.5 Tag

**Acceptance Criteria**:
- [ ] Start-Button
- [ ] Pause-Button (wechselt zu Resume wenn pausiert)
- [ ] Reset-Button (R)
- [ ] Button-States: enabled/disabled passend zum Timer-State
- [ ] Onclick-Handler mit IPC zu Main Process
- [ ] Unit-Tests für Button-Logik

**Dependencies**: Task 3.1, Task 3.2, Task 3.3

---

### Task 3.5: Alarm Visual Feedback
**Story**: Als User möchte ich sehen, wenn der Alarm aktiv ist (Fenster blinkt etc.)
**Priority**: P1 (Critical)
**Estimated Effort**: 0.5 Tag

**Acceptance Criteria**:
- [ ] Fenster-Blink implementiert (via IPC zu Main Process)
- [ ] Visuelles Signal: CSS-Animation (z.B. background-color change)
- [ ] Alarm-Icon/Text in der UI zeigt Alarm-Status
- [ ] Stumm-Checkbox deaktiviert Audio, aber visuelles Signal bleibt (optional)
- [ ] Unit-Tests für Alarm-Trigger

**Dependencies**: Task 2.3, Task 3.2

---

### Task 3.6: Multiple Timers UI (Optional für MVP)
**Story**: Als Power-User möchte ich mehrere Timer sehen und verwalten
**Priority**: P2 (MVP-Optional)
**Estimated Effort**: 1 Tag

**Acceptance Criteria**:
- [ ] "+ New Timer"-Button
- [ ] Timer-Liste zeigt alle aktiven Timer
- [ ] Jeder Timer hat eigene Controls (Start, Pause, Reset)
- [ ] Timer können gelöscht werden
- [ ] Jeder Timer hat eigene Alarm-Notification
- [ ] Unit-Tests für UI-State Management

**Dependencies**: Task 2.2, Task 3.4

---

## Phase 4: Integration & Testing (2 Tage)

### Task 4.1: IPC Communication (Main ↔ Renderer)
**Story**: Als Developer möchte ich stabile Kommunikation zwischen Prozessen, damit Logik und UI synchron sind
**Priority**: P1 (Critical)
**Estimated Effort**: 1 Tag

**Acceptance Criteria**:
- [ ] IPC-Channels definieren (z.B. `timer:start`, `timer:tick`, `timer:complete`)
- [ ] Main Process → Renderer: Timer-Events (onTick, onComplete)
- [ ] Renderer → Main Process: User-Actions (start, pause, reset)
- [ ] Error-Handling für fehlgeschlagene IPC-Calls
- [ ] Unit-Tests für IPC-Flows
- [ ] Integration-Tests (E2E) für komplette Workflows

**Dependencies**: Task 2.1, Task 3.2

---

### Task 4.2: End-to-End Tests (Playwright)
**Story**: Als QA möchte ich E2E-Tests, damit ich sicher bin, dass alles funktioniert
**Priority**: P1 (Critical)
**Estimated Effort**: 1 Tag

**Acceptance Criteria**:
- [ ] E2E-Test: User stellt 5 Min ein, startet, Timer zählt ab
- [ ] E2E-Test: User pausiert und resumed
- [ ] E2E-Test: User reset während Countdown
- [ ] E2E-Test: Alarm triggert bei 0:00
- [ ] E2E-Test: Keyboard-Shortcuts funktionieren
- [ ] E2E-Test: Mehrere Timer parallel (falls implementiert)
- [ ] Alle Tests auf Linux, macOS, Windows laufen (oder mind. 1 Plattform)

**Dependencies**: Task 4.1, Task 3.5

---

### Task 4.3: Cross-Platform Testing
**Story**: Als Developer möchte ich sicher sein, dass die App auf allen 3 Plattformen läuft
**Priority**: P1 (für Release)
**Estimated Effort**: 0.5 Tage

**Acceptance Criteria**:
- [ ] Manuelle Tests auf Linux (oder VM)
- [ ] Manuelle Tests auf macOS (oder Skip, wenn nicht verfügbar)
- [ ] Manuelle Tests auf Windows (oder VM)
- [ ] Keyboard-Shortcuts funktionieren auf allen Plattformen
- [ ] Alarm-Sound läuft auf allen Plattformen
- [ ] Fenster-Blink funktioniert auf allen Plattformen
- [ ] Bugs werden gefixt oder dokumentiert

**Dependencies**: Task 4.2

---

## Phase 5: Packaging & Distribution (1 Tag)

### Task 5.1: Electron-Builder Setup (Installer)
**Story**: Als User möchte ich die App einfach installieren und nutzen, ohne Dev-Tools
**Priority**: P2 (für MVP-Release)
**Estimated Effort**: 1 Tag

**Acceptance Criteria**:
- [ ] `electron-builder` konfiguriert
- [ ] `npm run build` erstellt ausführbare Datei
- [ ] `npm run package` erstellt Installer (.exe für Windows, .dmg für macOS, .AppImage für Linux)
- [ ] Installer testet und funktioniert
- [ ] App kann deinstalliert werden
- [ ] Standalone ausführbar ohne Node/npm

**Dependencies**: All previous phases

---

### Task 5.2: Release & Documentation
**Story**: Als User möchte ich Dokumentation haben, damit ich weiß, wie die App funktioniert
**Priority**: P2 (für MVP-Release)
**Estimated Effort**: 0.5 Tag

**Acceptance Criteria**:
- [ ] README.md mit Beschreibung, Screenshots, Installation
- [ ] Keyboard-Shortcuts dokumentiert
- [ ] Known Issues dokumentiert
- [ ] CHANGELOG.md mit Versionsnoten
- [ ] License (MIT) hinzugefügt
- [ ] Release v0.1.0-alpha erstellt

**Dependencies**: Task 5.1

---

## Zusammenfassung (Dependency Graph)

```
Phase 1: Setup (2 Tage)
├── Task 1.1: Electron Boilerplate
├── Task 1.2: Testing Setup
└── Task 1.3: ESLint/Prettier

Phase 2: Core Logic (3 Tage)
├── Task 2.1: Timer Engine (depends on 1.1, 1.2)
├── Task 2.2: Timer Manager (depends on 2.1)
├── Task 2.3: Alarm Controller (depends on 1.1)
└── Task 2.4: Input Validation (depends on 1.1, 1.2)

Phase 3: UI (3 Tage)
├── Task 3.1: HTML/CSS (depends on 1.1)
├── Task 3.2: Display & Updates (depends on 2.1, 3.1)
├── Task 3.3: Input & Keyboard (depends on 2.4, 3.1, 3.2)
├── Task 3.4: Control Buttons (depends on 3.1, 3.2, 3.3)
├── Task 3.5: Alarm Visual (depends on 2.3, 3.2)
└── Task 3.6: Multiple Timers UI [Optional] (depends on 2.2, 3.4)

Phase 4: Integration & Testing (2 Tage)
├── Task 4.1: IPC Communication (depends on 2.1, 3.2)
├── Task 4.2: E2E Tests (depends on 4.1, 3.5)
└── Task 4.3: Cross-Platform (depends on 4.2)

Phase 5: Release (1 Tag)
├── Task 5.1: Packaging (depends on all)
└── Task 5.2: Documentation (depends on 5.1)
```

**Total Estimated Time**: 11 Tage (realistically 1-2 Wochen)

---

**MVP Definition**: Tasks 1.1-1.2, 2.1, 2.3-2.4, 3.1-3.5, 4.1-4.2 → ~8 Tage
**Nice-to-Have**: Task 2.2, 3.6, 5.1-5.2 (+ 3 Tage)

---

**Version**: 1.0.0 | **Created**: 2026-05-21 | **Status**: Ready for /speckit.implement