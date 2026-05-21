# Timer-App Constitution

Ein Desktop-Timer mit hoher Zuverlässigkeit, klarem Aufbau und durchgehend gutem Code-Handwerk.

## Core Principles

### I. Modularer, aufgeräumter Code
- Dateien haben klare, einzelne Verantwortlichkeit
- Module sind klein, testbar und wiederverwendbar
- Keine großen „Alles-ist-drin"-Dateien
- Klare Schnittstellen zwischen Komponenten
- Import/Export-Struktur ist sofort verständlich

### II. Test-First (NON-NEGOTIABLE)
- Jede fachliche Änderung braucht Tests
- TDD-Zyklus: Test schreiben → Fehlschlag sehen → Code → Erfolg → Refactor
- Unit-Tests für alle Business-Logik
- Integration-Tests für kritische Abläufe (Timer-Genauigkeit, Button-Interaktionen)
- Code ohne Tests wird nicht gemerged

### III. Fehlerbehandlung & User-Experience
- Saubere Fehlerbehandlung mit verständlichen, hilfreichen Meldungen
- Keine technischen Stack-Traces für User
- Fehler werden graceful gehandhabt, App stürzt nicht ab
- Validierung aller Eingaben (defensive Programming)

### IV. Desktop-First UI (Linux, macOS, Windows)
- UI ist für Desktop-Nutzung optimiert:
  - Volle Tastaturbedienung möglich (Shortcuts, Tab-Navigation)
  - Klare Kontraste für gute Lesbarkeit
  - Gut lesbare Typografie (ausreichend Größe, Abstand)
  - Responsive auf verschiedenen Bildschirmgrößen
- Plattformziel: zuverlässig auf Linux, macOS und Windows
- Keine Mobile-Optimierung nötig

### V. Performance & Timer-Genauigkeit
- Timer-Logik: hochgenau, keine Drifts über längere Zeiträume
- UI-Rendering: keine unnötigen Re-Renders (sauberes State-Management)
- Responsive bleiben auch bei längerlaufenden Operationen
- Ressourcenschonend (CPU, Speicher)

### VI. Sicherheit & Datenschutz
- Keine sensiblen Daten werden in Logs geschrieben
- Defensive Eingabevalidierung (keine Code-Injection möglich)
- Benutzer-Daten werden lokal gespeichert (falls nötig), nie hochgeladen
- Sichere Defaults

## Development Workflow

### Code Review
- Alle Änderungen durchlaufen Review vor dem Merge
- Reviewer-Checkliste: Tests? Prinzipien befolgt? Code verständlich?
- Feedback muss actionable sein

### Testing Gates
- Alle Tests müssen grün sein (100% Pass-Rate erforderlich)
- Code Coverage für neue Funktionen: mindestens 80%
- Integration-Tests für kritische Features

### Deployment
- Nur getesteter, reviewter Code geht ins Release
- Versions-Tagging folgt Semantic Versioning (MAJOR.MINOR.PATCH)

## Governance

**Constitution supersedes all other practices** — Diese Prinzipien gelten immer und übertrumpfen andere Richtlinien.

- Jede PR muss diese Prinzipien befolgen
- Abweichungen brauchen dokumentierte Begründung und Zustimmung
- Bei Fragen gilt: Lieber konservativ (sicher/testbar) statt liberal (schnell/riskant)
- Constitution-Änderungen brauchen explizite Dokumentation und Abstimmung

**Version**: 1.0.0 | **Ratified**: 2026-05-21 | **Last Amended**: 2026-05-21
