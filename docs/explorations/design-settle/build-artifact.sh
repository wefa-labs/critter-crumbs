#!/bin/sh
# Stage the design-settle page as a publishable Artifact in the directory named by the first
# argument: the page without its document shell (the Artifact host adds one), the modules, and
# copies of the app files the page reads, with an assets.js that points at those copies.
# Publish <out>/design-settle.html with every file under <out>/design-settle/ as a supporting file.
set -eu
out=${1:?usage: build-artifact.sh <output directory>}
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../../.." && pwd)
mkdir -p "$out/design-settle/app" "$out/design-settle/images"

sed -e '/^<!doctype html>$/d' -e '/^<html lang="en">$/d' -e '/^<head>$/d' -e '/^<\/head>$/d' \
    -e '/^<body>$/d' -e '/^<\/body>$/d' -e '/^<\/html>$/d' -e '/^<meta /d' \
    "$here/../design-settle.html" > "$out/design-settle.html"
for module in copy generator mesh mixer portrait screens tokens; do cp "$here/$module.js" "$out/design-settle/"; done
styles="$root/packages/app/src/styles"
cp "$styles/app.css" "$styles/tokens.css" "$styles/portraits.css" "$out/design-settle/app/"
# The SIL Open Font License asks that its notice travel with every copy of the font.
cp "$root/packages/app/public/fonts/young-serif-latin.woff2" "$root/packages/app/public/licenses/young-serif-OFL.txt" "$out/design-settle/app/"
cp "$root/packages/app/public/images/arrival.webp" "$out/design-settle/images/"
for picture in scene-feast scene-dusk earth water fire air; do cp "$root/docs/pitch/assets/$picture.webp" "$out/design-settle/images/"; done

cat > "$out/design-settle/assets.js" <<'EOF'
// The published copy: the app's files sit beside the page (written by build-artifact.sh).
const here = path => new URL(path, import.meta.url).href;
export const ASSETS = {
  appCss: here('app/app.css'),
  portraitsCss: here('app/portraits.css'),
  youngSerif: here('app/young-serif-latin.woff2'),
  arrival: { entrance: here('images/arrival.webp'), window: here('images/scene-feast.webp'), dusk: here('images/scene-dusk.webp') },
  art: Object.fromEntries(['earth', 'water', 'fire', 'air'].map(element => [element, here(`images/${element}.webp`)])),
};
EOF
echo "$out"
