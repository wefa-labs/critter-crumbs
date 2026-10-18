# Critter Crumbs design review

Open [the review index](index.html) for the creature comparisons, scene changes, corrected mock screens and music auditions. Afolabi selected painted Garden Spirits, eight species, portraits first, and opt-in migration. [Claude's refinement brief](../claude-code-critter-refinement-2026-10-16.md) defines the next art pass. Versioned storage is prepared locally; new art and adoption remain pending review. The scene proportions, combined onboarding and fourth tutorial step are implemented locally.

The package keeps its audio under `music-loops/media/`, alongside source hashes and analysis manifests. It no longer depends on Claude's ignored scratch files. Background paintings and fonts use the existing repository assets, so keep the package in this checkout. The gallery opens in Still mode; turn Still off to inspect its prototype animation. The music candidates still need a listening decision.

With the pinned Bun 1.4.2 and Node 22.22.1 on PATH, run these from the repository root to rebuild:

```sh
node docs/explorations/critter-directions/build.mjs
node docs/explorations/scene-proportions/build.mjs
node docs/explorations/music-loops/build.mjs
```

The music rebuild also needs the installed ffmpeg executable and only the four shipped mixed MP3 tracks. It does not call a generation service. [Verification and current app captures](../../reviews/scene-onboarding/README.md) distinguish production-parity v1, development v2, checks that passed and environment limits.
