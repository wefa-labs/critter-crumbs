#!/bin/sh
# Paints takes of a plate with the image tool in OpenAI's Codex CLI, one run a take, each from the scene's own painting
# and its block-in (plans.sh). Works in .scratch/floor-plates, which git ignores: the takes land in out/, the words
# sent in prompts/, what Codex said in logs/. Each run sends the painting and the block-in to OpenAI.
# Usage: sh paint.sh window:phone:a dusk:desktop:a     (a job is scene:device:take; add :plain to leave the block-in out)
here="$(cd "$(dirname "$0")" && pwd)"; root="$(git rev-parse --show-toplevel)"; work="$root/.scratch/floor-plates"
mkdir -p "$work/refs" "$work/out" "$work/logs" && cd "$work" || exit 1
for scene in window dusk; do [ -f "refs/$scene.png" ] || magick "$root/packages/app/public/scenes/$scene.webp" "refs/$scene.png" || exit 1; done
[ -f guides/window-phone.png ] || sh "$here/plans.sh" > /dev/null || exit 1
for job in "$@"; do
  line=$(node "$here/prompts.mjs" "$work" "$job") || exit 1
  name=$(printf '%s' "$line" | cut -f1)
  images=""
  for image in $(printf '%s' "$line" | cut -f2); do images="$images -i $image"; done
  # shellcheck disable=SC2086
  codex exec -C "$work" -s workspace-write -c model_reasoning_effort='"low"' $images -o "logs/$name.last.txt" - < "prompts/$name.txt" > "logs/$name.log" 2>&1
  printf '%s: exit %s, %s\n' "$name" "$?" "$(tr '\n' ' ' < "logs/$name.last.txt" 2>/dev/null | cut -c1-200)"
done
