#!/usr/bin/env bash
# Inlines the portrait assets into the deck.
#
# The published artifact runs under a CSP that blocks external images, so the
# four portraits ship as base64 data: URIs. Edit critter-crumbs.src.html, run
# this, publish critter-crumbs.html.
set -euo pipefail
cd "$(dirname "$0")"

out=critter-crumbs.html
cp critter-crumbs.src.html "$out"

for name in earth water fire air scene-dusk scene-day scene-feast; do
  b64=$(base64 < "assets/$name.webp" | tr -d '\n')
  token="__IMG_$(echo "$name" | tr '[:lower:]-' '[:upper:]_')__"
  python3 - "$out" "$token" "data:image/webp;base64,$b64" <<'PY'
import io, sys
path, token, value = sys.argv[1], sys.argv[2], sys.argv[3]
s = io.open(path, encoding="utf-8").read()
n = s.count(token)
if n == 0:
    sys.exit("no occurrences of " + token)
io.open(path, "w", encoding="utf-8").write(s.replace(token, value))
print("%s -> %d occurrence(s)" % (token, n))
PY
done

if grep -q '__IMG_' "$out"; then
  echo "unreplaced placeholders remain:" >&2
  grep -o '__IMG_[A-Z]*__' "$out" | sort -u >&2
  exit 1
fi

printf 'built %s (%s)\n' "$out" "$(du -h "$out" | cut -f1)"
