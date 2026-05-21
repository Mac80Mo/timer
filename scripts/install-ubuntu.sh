#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
app_image_source="$repo_root/release/Desktop Timer-0.1.0.AppImage"
install_dir="$HOME/.local/share/desktop-timer"
app_image_target="$install_dir/desktop-timer.AppImage"
desktop_dir="$HOME/.local/share/applications"
desktop_file="$desktop_dir/desktop-timer.desktop"

if [[ ! -f "$app_image_source" ]]; then
  echo "AppImage nicht gefunden: $app_image_source"
  echo "Bitte zuerst im Repo ausführen: npm run package:linux"
  exit 1
fi

wrapper_script="$install_dir/desktop-timer-launch.sh"

mkdir -p "$install_dir" "$desktop_dir"
cp "$app_image_source" "$app_image_target"
chmod +x "$app_image_target"
cp "$repo_root/assets/icon.png" "$install_dir/timer.png"

cat > "$wrapper_script" <<'WRAPPER'
#!/usr/bin/env bash
exec /home/marcus/.local/share/desktop-timer/desktop-timer.AppImage --no-sandbox --ozone-platform=wayland "$@"
WRAPPER
chmod +x "$wrapper_script"

cat > "$desktop_file" <<EOF
[Desktop Entry]
Type=Application
Name=Desktop Timer
Comment=Desktop timer application
Exec=/bin/bash -- $wrapper_script
Icon=$install_dir/timer.png
Terminal=false
Categories=Utility;
StartupNotify=false
StartupWMClass=Desktop Timer
EOF

update-desktop-database "$desktop_dir" >/dev/null 2>&1 || true

echo "Desktop Timer installiert: $app_image_target"
echo "Launcher erstellt: $desktop_file"