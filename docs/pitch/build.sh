#!/usr/bin/env bash
# Inlines the portrait assets into the deck.
#
# The published artifact runs under a CSP that blocks external images, so the
# four portraits ship as base64 data: URIs. Edit critter-crumbs.src.html and
# run this. It writes two files:
#
#   critter-crumbs.html           the whole deck as a standalone document: open
#                                 it from disk, send it, or print it (pdf.js)
#   critter-crumbs.artifact.html  the same deck without the document shell,
#                                 which the artifact host supplies; publish
#                                 this one (it is not committed)
#
# For the PDF, follow with: node pdf.js
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

# the artifact host wraps the page in its own doctype, head and body, so the
# published copy must not carry a second set
python3 - "$out" critter-crumbs.artifact.html <<'PY'
import io, re, sys
src, dst = sys.argv[1], sys.argv[2]
s = io.open(src, encoding="utf-8").read()
s, a = re.subn(r'\A<!doctype html>\n<html[^>]*>\n<head>\n(?:<meta [^>]*>\n)*', '', s)
s, b = re.subn(r'</style>\n</head>\n<body>\n', '</style>\n', s, count=1)
s, c = re.subn(r'</script>\n</body>\n</html>\n?\Z', '</script>\n', s)
if (a, b, c) != (1, 1, 1):
    sys.exit("could not strip the document shell: %r" % ((a, b, c),))
if not s.startswith("<title>"):
    sys.exit("the artifact copy must open with its <title>")
io.open(dst, "w", encoding="utf-8").write(s)
PY
printf 'built %s\n' critter-crumbs.artifact.html
