# Music loops: where each repeat joins

16 October 2026 · Exploration for the visual and sound brief (`../claude-code-visual-brief-2026-10-15.md`, part 3). Nothing in the app, its audio files or its specs changed.

**The finding.** All four loops repeat at the wrong place. Today each pass starts two seconds before the previous one ends, at whatever point the file happens to stop. The next pass's beat grid is 100 to 186 ms off the playing pass's grid, its first downbeat lands on beat 2 or 3, and two of the four tracks drop sharply in level as the next pass begins (The burrow by 8.0 dB, Everyone is full by 6.9 dB), more than the music ever changes on its own.

**The proposal.** Loop each track between two downbeats a whole number of bars apart, chosen where the music before and after both points matches, and join them with a short fade that ends just before the downbeat. The first pass still plays from the start of the file, so each intro is heard once. The loop points lie inside the files the app already ships. No audio file changes, so levels and headroom stay as they are. Codex implements the playback.

**What this is not.** I can't listen. Every number below is measured from the decoded audio, and every "probably sounds like" is a prediction from those measurements. Whether a proposed seam is inaudible, or merely musical, is yours to judge on the audition page.

## How to listen

Open [`audition.html`](audition.html) from this checkout in a browser. For each track it has today's loop, the proposed loop and an alternative, each played as four passes (three seams), with buttons that start six seconds before a seam, plus 16-second close-ups of every candidate seam. The audio files are preserved beside the page under `media/auditions/` and `media/seams/`. They no longer depend on Claude’s ignored scratch directory. `media/provenance.json` identifies each source and review file by SHA-256. To rebuild them from the shipped tracks, run `node docs/explorations/music-loops/build.mjs` with the pinned toolchain and ffmpeg. See [Method](#method) for the analysis. Nothing plays until you press play.

## Today's seams, measured

"Grid" is how far the next pass's beats sit from the playing pass's beats while the two overlap. "Level" compares the 3 s after the blend with the 3 s before it. "Largest natural step" is the biggest 3-second level change at any bar line inside the track itself.

| Track | Where the file ends and starts | Grid | Next downbeat lands on | Level | Largest natural step | Harmony, last 2 s → first 2 s |
|---|---|---|---|---|---|---|
| M1 The burrow | Ends in the full second half (−17.6 dBFS); starts with its quiet 8-bar intro, before the melody enters (−27.7 dBFS) | +186 ms | beat 2 | **−8.0 dB** | 6.6 dB (a rise) | E D C F → E G C B (chroma similarity 0.83) |
| M2 The town square | Uncut: the take stops mid-phrase at 90.04 s, during beat 4 of bar 36; starts at bar 1 | −100 ms | beat 2 | −2.5 dB | 1.5 dB | C B♭ G A → C B G A (0.79): B♭ against B while they overlap |
| M3 Feeding time | Cut at 86.6 s, mid-phrase in the returning theme; starts with its 4-bar intro | −182 ms | beat 3 | +0.4 dB | 2.5 dB | A♭ A G E → G D B A♭ (0.66, the lowest of the four) |
| M5 Everyone is full | Ends in the full closing phrase; starts with 166 ms of near-silence, then its quiet intro (−21 to −32 dBFS) | +181 ms | beat 2 | **−6.9 dB** | 7.8 dB rise; 3.4 dB is its largest drop | C B G E → C E B G (0.78) |

**Predicted from the measurements, not heard:** on every track, two beat grids play together for two seconds, so drums and plucked notes should sound doubled (flams of 0.1 to 0.2 s). The next pass then restarts the phrase from bar 1 while the old pass is mid-bar. The burrow and Everyone is full should also sound like the music suddenly falls quiet. Town square adds a B♭ against a B for the length of the blend. None of the four has silence at the join that would cause a gap. The equal-power curves keep the level steady during the blend, as designed; the problems are what gets blended and where the next pass lands.

## The proposed loops

Bars count from each track's first downbeat on the beat grid fitted to the file (tempo by straight-line fit through the tracked beats). Frames are sample frames of the shipped file decoded at 44,100 Hz. Chromium, WebKit and ffmpeg decode every shipped loop to identical frame counts and alignment, so these indices hold in both browser engines tested.

| Track | Tempo | Loop | Loop start | Loop end | Loop length | Fade before the downbeat |
|---|---|---|---|---|---|---|
| M1 The burrow | 112.0 BPM | bars 17–32 (16 bars) | 34.3210 s · frame 1,513,558 | 68.6024 s · frame 3,025,367 | 34.2814 s · 1,511,809 frames | 60 ms · 2,646 frames |
| M2 The town square | 96.0 BPM | bars 9–32 (24 bars) | 20.3507 s · frame 897,468 | 80.3575 s · frame 3,543,767 | 60.0068 s · 2,646,299 frames | 60 ms · 2,646 frames |
| M3 Feeding time | 92.0 BPM | bars 7–27 (21 bars) | 15.6696 s · frame 691,029 | 70.4542 s · frame 3,107,031 | 54.7846 s · 2,416,002 frames | 30 ms · 1,323 frames |
| M5 Everyone is full | 83.5 BPM | bars 5–16 (12 bars) | 11.6661 s · frame 514,474 | 46.1429 s · frame 2,034,903 | 34.4768 s · 1,520,429 frames | 120 ms · 5,292 frames |

What each loop plays, and what it gives up:

| Track | First pass | Then repeats | Never heard after the change | Why these bars |
|---|---|---|---|---|
| M1 The burrow | Intro, first A, second A, first B (0 to 68.6 s) | Second A, first B | The second B section and the last half second of the file | The jump replaces the B-to-B join (a fill, then the downbeat) with B-to-A at the same harmony: what follows both points matches (harmony 1.00) and what precedes them is close (0.93). The level stays flat (+0.8 dB). The quiet intro and first A never come back, which removes today's 8 dB drop. |
| M2 The town square | Bars 1–32 (0 to 80.4 s) | Bars 9–32 | Bars 33–36, where the take stops mid-phrase | Both points are the start of an 8-bar section; harmony before (0.93) and after (0.95) both match. It is a return to an earlier section, not a literal repeat (waveform similarity 0.33): the track is through-composed. |
| M3 Feeding time | Intro through the start of the returning theme (0 to 70.5 s) | Bars 7–27 | The rest of the returning theme, which is the same music | The opening theme comes back 21 bars later as the same recording: before and after both points match (harmony 1.00, waveform similarity 0.64), and the scan for literal repeats finds them only in this track. This is the one splice that should be inaudible. |
| M5 Everyone is full | Intro, A, B (0 to 46.1 s) | A, B | The closing phrase | The jump lands on the A theme's entry, which is also what the track plays at bar 17 (harmony after 0.90). The half second before the entry is near-silent in the file (18.8 dB below the half second before the jump), so the fade is longer, 120 ms, to let the outgoing sustain go rather than cut it. |

Measured on the rendered auditions, at each of the three seams:

| Track | Grid at the seam | Next downbeat lands on | Level, 3 s after against 3 s before | Sharpest change in the fade window |
|---|---|---|---|---|
| M1 The burrow | −7 ms | beat 1 | +0.8 dB | 0.40 × the music's own 99.9th percentile |
| M2 The town square | −6 ms | beat 1 | −1.2 dB (natural steps up to 1.5 dB) | 1.2 to 1.4 × (a transient in the music falls inside the window; the waveform is continuous across the cut) |
| M3 Feeding time | +2 ms | beat 1 | +0.3 dB | 0.02 × |
| M5 Everyone is full | −8 ms | beat 1 | −3.0 dB (its own largest natural drop is 3.4 dB) | 1.3 to 1.5 × (as for Town square) |

A grid error under 10 ms is the size of the music's own timing jitter (4 to 7 ms rms between beats). The fade is an equal-gain raised cosine (the two gains always sum to one), placed in the 30 to 120 ms before the downbeat's attack, so the attack itself comes entirely from the new pass.

### Alternatives on the audition page

| Track | Alternative | What differs |
|---|---|---|
| M1 The burrow | Bars 21–36 (42.8851 s, frame 1,891,234 → 77.1706 s, frame 3,403,223; 60 ms) | Joins mid-section: bar 5 of the second B section to bar 5 of the second A. Harmony before matches better (0.98), after slightly less (0.88). It keeps half of the second B. |
| M2 The town square | Bars 7–30 (15.3397 s, frame 676,479 → 75.3594 s, frame 3,323,351; 60 ms) | Joins two bars before a section boundary instead of at it. Harmony before 0.84. |
| M3 Feeding time | Bars 5–25 (10.4346 s, frame 460,168 → 65.2355 s, frame 2,876,887; 30 ms) | Joins at the theme's first bar instead of inside it. Level +1.6 dB at the join; grid +19 ms. |
| M5 Everyone is full | Bars 6–17 (14.5263 s, frame 640,612 → 49.0251 s, frame 2,162,007; 120 ms) | One bar later on both sides. Harmony before matches better (0.87), after worse (0.64). |

The close-ups also hold every other candidate that was measured, including longer loops (The burrow bars 17–40, 9–40 and 9–32) that scored worse on harmony or level.

## Listening sheet

For you to fill in. Leave a row blank if it doesn't matter to you.

| Track | Today: what you hear at the join | Proposed: does the join disappear? | Alternative: better or worse? | Your pick |
|---|---|---|---|---|
| M1 The burrow | | | | |
| M2 The town square | | | | |
| M3 Feeding time | | | | |
| M5 Everyone is full | | | | |

## For Codex: per-track playback

This is the behaviour to build, once you have chosen. Codex owns the scheduling, cleanup, visibility handling and tests.

- **Metadata.** Each loop gets `{ start, end, fade }` in frames at 44,100 Hz, from the tables above (or the alternative you pick). Convert to seconds for scheduling: the `AudioContext` may run at 48 kHz, and `decodeAudioData` resamples the buffer to the context's rate, so buffer frame indices only match at 44.1 kHz.
- **Scheduling.** Pass 0 starts at offset 0 and fades out over `[end − fade, end]`. Pass k + 1 starts at the moment pass k reaches `end − fade`, at buffer offset `start − fade`, fading in over the same window. Both fades are equal-gain (a raised cosine: `cos²` out, `sin²` in), not equal-power: the two signals are aligned and correlated, so equal-power would bump the level. The loop period is `(end − start) / 44100` seconds. The existing look-ahead pump in `audio/playback.ts` can carry these offsets.
- **What stays.** The 1.5 s fade in and 1 s fade out when a screen changes track; waiting for a sting or the feast cue before a loop starts; ducking under an open statement; stopping when the tab is hidden. These are crossfades between different moments and stay as they are. The pour's sparkle bed (1.7 s) keeps Game Design G8's quarter-length crossfade: it is a texture, not a phrase.
- **To decide.** When music returns after a hidden tab, should it restart the file (and its intro) or resume inside the loop?
- **Tests worth having.** The plan's arithmetic (start, period, fade windows) as pure functions; an `OfflineAudioContext` render that checks the summed gain across a seam stays at 1 and that the second pass's downbeat sample lines up with `end`.
- **Docs to update with it.** Game Design G8 and §5.5 (the 2 s rule becomes per-track loop points), `docs/research/audio-assets.md` (loop points per file), and a line in `docs/decisions.md`.

## Source material

| What | Where | State |
|---|---|---|
| Shipped loops | `packages/app/public/audio/music/{burrow,square,feeding,full}.mp3` | 128 kbps MP3, 44.1 kHz, −16 LUFS. Inspected and decoded. |
| Original takes | `.claude/worktrees/critter-crumbs-design-review-c8fc66/.scratch/audio/takes/M1r2-2.mp3`, `M2r2-1.mp3`, `M3r2-1.mp3`, `M5r2-1.mp3` (ignored by git, outside this worktree) | 192 kbps MP3 from Eleven Music, 90.04 s (M5: 60.03 s). SHA-256 `b55aae8f…`, `e7085005…`, `ae5529c3…`, `c8dc2e4e…`. Inspected and decoded. |
| Stems, multitracks, lossless masters | — | No stems or lossless masters were located in the inspected project material; its generation record returned mixed MP3 only. |

The shipped files carry the takes' audio 219 frames (5.0 ms) later than the takes themselves, and 1.8 to 3.0 dB quieter. A future re-export from the takes would need to shift these loop points by −219 frames.

Because only mixed, encoded audio exists, a loop can only rearrange whole bars that were recorded. It cannot remove one instrument's tail or rewrite a phrase. For Town square and Everyone is full, which never repeat literally, the best available join is a musical return to an earlier section. A literally seamless join for those two would need new takes or stems, and new generation is not authorised here.

## Method

Everything runs on Node 22 with no dependencies beyond ffmpeg, from the worktree root.

```bash
mise exec node@22.22.1 -- node docs/explorations/music-loops/tools/evaluate.mjs .scratch/music-loops/pcm .scratch/music-loops/seams --json .scratch/music-loops/evaluate.json
```

The steps, in order (each file's first comment says what it measures):

1. Decode each shipped file and take to raw float PCM with ffmpeg into `.scratch/music-loops/pcm/` (`<track>.shipped.f32`, `<track>.take.f32`).
2. `tools/survey.mjs` measures tempo, beats, edge levels and today's seam.
3. `tools/structure.mjs` and `tools/sections.mjs` draw self-similarity matrices and per-bar levels, and find section boundaries.
4. `tools/repeats.mjs` scans every bar-lag for literal waveform repeats (only Feeding time has them, at 21 bars).
5. `tools/splices.mjs` ranks downbeat pairs automatically. `tools/evaluate.mjs` measures the hand-picked candidates and writes the close-ups.
6. `tools/seam-pictures.mjs` draws three-row spectrograms of each join (original around the end, original around the start, the join).
7. `tools/render.mjs` writes the four-pass auditions and `manifest.json`. `tools/verify.mjs` measures each seam of the rendered files. `tools/audition-page.mjs` writes `audition.html`.

The browser decode check ran the shipped files through `decodeAudioData` in an `OfflineAudioContext` at 44.1 kHz in Playwright's Chromium and WebKit; nothing was played.
