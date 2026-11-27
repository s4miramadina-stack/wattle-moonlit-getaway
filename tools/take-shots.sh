#!/usr/bin/env bash
# Takes the screenshots listed in shots.json: serves game/ locally, opens each ?shot= scene in
# headless Chrome at 1280x720, and saves it as a JPEG in screenshots/. Needs python3 + Pillow.
#   CHROME=/path/to/chrome tools/take-shots.sh
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-google-chrome}"
PORT="${PORT:-8093}"
node serve.ts --port "$PORT" >/tmp/wattle-serve.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1
mkdir -p screenshots /tmp/wattle-shots
python3 - "$CHROME" "$PORT" <<'PY'
import json, subprocess, sys, tempfile
from PIL import Image
chrome, port = sys.argv[1], sys.argv[2]
for s in json.load(open('shots.json')):
    png = f"/tmp/wattle-shots/{s['name']}.png"
    url = f"http://localhost:{port}/{s['query']}"
    profile = tempfile.mkdtemp(prefix='wattle-chrome-')
    subprocess.run([chrome, '--headless=new', f'--user-data-dir={profile}', '--disk-cache-size=1', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
                    '--window-size=1280,720', '--virtual-time-budget=4000', f'--screenshot={png}', url],
                   check=True, capture_output=True)
    img = Image.open(png).convert('RGB')
    out = f"screenshots/{s['name']}"
    img.save(out, 'JPEG', quality=86, optimize=True)
    print(out, img.size)
PY
