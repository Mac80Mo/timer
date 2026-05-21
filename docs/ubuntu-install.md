# Ubuntu Installation

## AppImage herunterladen

Nach dem Build liegt das Ubuntu-Paket unter `release/Desktop Timer-0.1.0.AppImage`.

## Starten

```bash
chmod +x "Desktop Timer-0.1.0.AppImage"
./"Desktop Timer-0.1.0.AppImage"
```

## Optional: Desktop-Integration

Kopiere die AppImage-Datei z. B. nach `/opt/desktop-timer/` und benenne sie dort am besten in `desktop-timer.AppImage` um. Danach kannst du eine Desktop-Datei anlegen.

Noch einfacher geht es mit dem Installationsskript unter [scripts/install-ubuntu.sh](../scripts/install-ubuntu.sh).

Beispiel für eine `.desktop`-Datei:

```ini
[Desktop Entry]
Type=Application
Name=Desktop Timer
Exec=/opt/desktop-timer/desktop-timer.AppImage
Icon=timer
Terminal=false
Categories=Utility;
StartupNotify=true
```

## Hinweis

Für ein sauberes Desktop-Icon fehlt im Projekt aktuell noch ein App-Icon. Solange kein Icon vorhanden ist, verwendet Electron das Standard-Icon.
