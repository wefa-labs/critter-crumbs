#!/bin/sh
# Turns a painted take into the plate the app serves: WebP at quality 84, nothing else changed.
# Usage: sh to-webp.sh <scene> <device> <take>     then set the plate's `wallFoot` in packages/app/public/scenes/manifest.json
root="$(git rev-parse --show-toplevel)"; source="$root/.scratch/floor-plates/out/$1-$2-$3.png"; target="$root/packages/app/public/scenes/$1-plate-$2.webp"
cwebp -quiet -q 84 -m 6 "$source" -o "$target" || exit 1
printf '%s: take %s, %s, %s bytes\n' "${target#"$root"/}" "$3" "$(magick identify -format '%wx%h' "$target")" "$(wc -c < "$target" | tr -d ' ')"
