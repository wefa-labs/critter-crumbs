# Sound assets

The sixteen sound files under `packages/app/public/audio/`: where each came from, how it was processed, and what it measures. Afolabi chose the takes on 9 October 2026 (`docs/explorations/sound-direction-2026-10.md`); Game Design §5 says how they are used. Together they are 5.59 MB: the effects, stings and feast cue are 0.46 MB and load after the first gesture; each music loop is 0.9 to 1.4 MB and loads when a screen first wants it.

## Provenance

Every file was generated on 9 October 2026 through the ElevenLabs API with Afolabi's key. No existing recording, melody or sample library is used. Prompts never name a game, a studio or a composer.

- **Music, stings and the feast cue:** Eleven Music, model `music_v2_5`, instrumental. The prompts are in the sound brief. Round 2 prompts begin with the house style paragraph; the two round 1 stings do not.
- **Effects:** Eleven sound effects, model `eleven_text_to_sound_v2`, with the prompts below.

**Still to confirm before the production deploy:** the commercial-use row of the plan the key belongs to. Eleven Music's terms limit some plans to individuals and exclude "Studio Games" ([model terms](https://elevenlabs.io/eleven-music-model-specific-terms)). This is a human step; nothing in the code depends on it.

The original takes and the scripts that made and processed them are kept outside the repository, in the working tree's ignored `.scratch/audio/` (`generate.mjs`, `check.mjs`, `level.mjs`, `loops.mjs`, `ship.mjs`). The processing is written out below so it can be repeated without them.

| File | Cue | Take | Prompt |
|---|---|---|---|
| `music/burrow.mp3` | M1 The burrow | Round 2, take 2 | Brief, M1 |
| `music/square.mp3` | M2 The town square | Round 2, take 1 | Brief, M2 |
| `music/feeding.mp3` | M3 Feeding time | Round 2, take 1 | Brief, M3 |
| `music/full.mp3` | M5 Everyone is full | Round 2, take 1 | Brief, M5 |
| `music/feast.mp3` | M4 The feast | Round 2, take 2 | Brief, M4 |
| `music/feast-resolve.mp3` | M4r The feast, resolve | Round 2, take 3 | Brief, M4r |
| `stings/scattered.mp3` | J1 Scattered | Round 2, take 1 | Brief, J1 |
| `stings/reveal.mp3` | J2 Statements open | Round 1, take 2 | Brief, J2 |
| `stings/dusk.mp3` | J3 Dusk | Round 1, take 2 | Brief, J3 |
| `sfx/munch.mp3` | Munch | Round 2, take 2 | "A tiny cute forest creature nibbling a bread crumb: three quick soft crunchy nibbles and a happy little squeak at the end. Cartoon game sound, close and clean, no music." |
| `sfx/cheer.mp3` | Cheer | Round 2, take 1 | "A chorus of tiny high-pitched forest creatures cheering yay together, with little claps and a happy squeal. Cartoon game sound, short and bright, no music." |
| `sfx/boing.mp3` | Boing | Round 1, take 1 | "A short soft cartoon spring boing, playful and gentle, not loud." |
| `sfx/pop.mp3` | Pop | Round 1, take 1 | "A short, clearly audible, soft bubbly pop like a cartoon bubble bursting, for tapping a button in a cute game. Clean, friendly, close." |
| `sfx/spin.mp3` | Spin | Round 1, take 1 | "A short playful spinning whirr ending in a pop and a bright chime, like a toy capsule machine in a cute game." |
| `sfx/page.mp3` | Page | Round 1, take 2 | "A quick paper flip fwip with a soft high chime, like a storybook page turning in a cosy game." |
| `sfx/sparkle.mp3` | Sparkle (loop) | Round 1, take 2 | "A gentle continuous shimmer of tiny bells and sparkles, like stars or coins pouring, bright and soft." Generated as a 4-second loop. |

## Processing

Done with ffmpeg 9 (`libmp3lame`). Every file is resampled to 44.1 kHz and written without tags or metadata.

| Kind | Files | Steps |
|---|---|---|
| Music loops | `burrow`, `square`, `feeding`, `full` | Cut at the end of the full-bodied music, before the take's closing fade: `burrow` at 86.3 s, `feeding` at 86.6 s, `full` at 57.5 s; `square` is uncut. Gain to −16 LUFS integrated (EBU R128). Limiter at −1.5 dBFS. 128 kbps stereo. |
| Stings and the feast cue | `scattered`, `reveal`, `dusk`, `feast`, `feast-resolve` | Leading silence under −50 dB removed, so each starts on its first sound (the feast cue had 0.46 s of it). Then as the loops: −16 LUFS, limiter at −1.5 dBFS, 128 kbps stereo. |
| Effects | `munch`, `cheer`, `boing`, `pop`, `spin`, `page` | Leading silence removed. Peak to −3 dBFS, because MP3 encoding adds up to about 2 dB to a short transient. Limiter at −3 dBFS. 96 kbps mono. |
| Sparkle | `sparkle` | The steady 1.7 s between 2.2 s and 3.9 s of the take. Levelled as the effects. The app loops it with a crossfade (Game Design G8), so its seam was not edited. |

The loops are not edited to join at a bar line. Game Design G8 crossfades each pass into the next over two seconds, so the join is a blend, not a cut.

## Measurements

Measured on the shipped files with ffmpeg's `ebur128` filter. "Peak" is the true peak; `packages/app/src/audio/assets.ts` carries it so that a cue's level is the peak it reaches. "Loudest moment" is the highest momentary loudness (400 ms).

| File | Length | Bytes | Integrated | Peak | Loudest moment |
|---|---|---|---|---|---|
| `music/burrow.mp3` | 86.30 s | 1,381,772 | −16.5 LUFS | −1.9 dBFS | −11.7 LUFS |
| `music/square.mp3` | 90.04 s | 1,441,540 | −16.4 LUFS | −3.6 dBFS | −11.8 LUFS |
| `music/feeding.mp3` | 86.60 s | 1,386,787 | −16.4 LUFS | −3.8 dBFS | −12.2 LUFS |
| `music/full.mp3` | 57.50 s | 921,181 | −16.4 LUFS | −3.0 dBFS | −11.8 LUFS |
| `music/feast.mp3` | 9.58 s | 154,226 | −16.6 LUFS | −1.6 dBFS | −11.6 LUFS |
| `music/feast-resolve.mp3` | 3.01 s | 49,318 | −16.5 LUFS | −1.7 dBFS | −11.5 LUFS |
| `stings/scattered.mp3` | 3.01 s | 49,318 | −16.4 LUFS | −2.9 dBFS | −14.9 LUFS |
| `stings/reveal.mp3` | 2.97 s | 48,482 | −16.4 LUFS | −3.3 dBFS | −13.0 LUFS |
| `stings/dusk.mp3` | 3.01 s | 49,318 | −16.7 LUFS | −2.7 dBFS | −11.7 LUFS |
| `sfx/munch.mp3` | 1.36 s | 17,240 | −26.6 LUFS | −2.0 dBFS | −24.5 LUFS |
| `sfx/cheer.mp3` | 2.48 s | 30,406 | −12.2 LUFS | −1.1 dBFS | −9.0 LUFS |
| `sfx/boing.mp3` | 0.60 s | 7,836 | −19.1 LUFS | −1.0 dBFS | −15.7 LUFS |
| `sfx/pop.mp3` | 0.80 s | 10,344 | −17.5 LUFS | −2.2 dBFS | −16.9 LUFS |
| `sfx/spin.mp3` | 1.20 s | 15,046 | −17.4 LUFS | −0.1 dBFS | −14.3 LUFS |
| `sfx/page.mp3` | 0.60 s | 7,836 | −26.2 LUFS | −0.5 dBFS | −23.9 LUFS |
| `sfx/sparkle.mp3` | 1.70 s | 21,315 | −11.2 LUFS | −0.6 dBFS | −10.3 LUFS |

The feast cue builds for about 3.2 s, bursts, and plays its final hit at about 6.5 to 7.2 s; the last two seconds are its ring-out. The feast's settle comes between 1.4 s and 7.2 s after it starts, depending on how many critters are fed, so the app lands the resolve on the settle and fades the cue under it (Game Design §4.2).

## In the mix

A cue's level is a peak, so two recordings at the same level are not equally loud: a nibble or a page flip is mostly short clicks, a cheer or a sting is dense. This table gives each recording's loudest moment at the level its cue plays it (`soundTokens` in `packages/app/src/audio/plan.ts`). It is why the page flip and the nibble carry high peaks.

| Recording | Cue | Level (peak) | Loudest moment at that level |
|---|---|---|---|
| Feast resolve | `feast.settle` | −8 dB | −17.8 LUFS |
| The feast | `feast.open` | −8 dB | −18.0 LUFS |
| Statements open | `statements.reveal` | −10 dB | −19.7 LUFS |
| Cheer | `feast.settle`, 6 dB under the fanfare | −14 dB | −21.9 LUFS |
| Scattered | `scatter.confirm` | −10 dB | −22.0 LUFS |
| Dusk | `scatter.closed` | −14 dB | −23.0 LUFS |
| Spin | `reroll` | −14 dB | −28.2 LUFS |
| Munch | `feast.feed` | −8 dB | −30.5 LUFS |
| Boing | `pile.wall` | −16 dB | −30.7 LUFS |
| Page | `statement.open` | −10 dB | −33.4 LUFS |
| Sparkle | the bed under `pour.hold`, 10 dB under the grains | −24 dB | −33.7 LUFS |
| Pop | `ui.tap` | −20 dB | −34.7 LUFS |
| Music loops | the music bus at −15 dB | −17 to −19 dB | about −31 LUFS integrated, −27 LUFS at their loudest |
| Music under an open statement | a further −6 dB | −23 to −25 dB | about −37 LUFS integrated |

These levels were set from measurement. Nobody has yet balanced them by ear on a phone; the rehearsal's feel checks F3 and F10 are where that happens. To change one, edit `soundTokens` (an effect or sting), `MUSIC_MIX` in `packages/app/src/audio/music-plan.ts` (the music), or a `dbOffset` in `plan.ts` (a second recording within a cue), then run the sound workshop.

## Checked in the browser

`/__preview/audio` in development (the sound workshop) renders every cue through the app's own engine and mix in an `OfflineAudioContext`, and `tests/e2e/audio.spec.ts` asserts the result. Chromium, 9 October 2026, peaks in dB against each cue's level:

| Cue | Synth version | With its recordings | Level |
|---|---|---|---|
| `connect` | −20.33 | | −14 |
| `reroll` | −20.38 | −14.03 | −14 |
| `ui.tap` | −21.14 | −19.96 | −20 |
| `crumb.add` | −16.72 | | −14 |
| `crumb.remove` | −22.98 | | −16 |
| `pile.wall` | −16.68 | −16.03 | −16 |
| `pile.empty` | −21.07 | | −12 |
| `statement.open` | −24.03 | −10.00 | −10 |
| `scatter.confirm` | −18.90 | −10.03 | −10 |
| `statements.reveal` | −19.08 | −10.04 | −10 |
| `scatter.closed` | −23.14 | −14.01 | −14 |
| `feast.open` | −11.73 | −8.01 | −8 |
| `feast.feed`, worst of ten shares | −13.56 | −8.07 | −8 |
| `feast.settle` | −14.90 | −8.06 | −8 |
| `error` | −16.55 | | −16 |
| `pour.hold`, 3.5 s | −16.52 | −16.52 over the sparkle bed | −14 |
| `pour.reverse`, 3.5 s | −22.60 | −21.28 over the sparkle bed | −16 |
| A whole feast for eight | | −2.74 | under −1 |

Every recording lands within 0.1 dB of its level. A synth cue of several notes shares its level between them, so its peak sits well under it. The whole feast peaks 5 dB above any single cue because its sounds overlap; the limiter at −3 dB holds it.

The same page plays any cue or track through the live mix, with both toggles on, for listening.

The same check passes in WebKit 26.5, the engine behind Safari, with every recording within 0.15 dB of the Chromium figures. That was one run of the workshop page in a WebKit build left in Playwright's cache by another project; the repository's own Playwright has no WebKit installed, so it is not part of the suite.

Not checked here: real phones. Two things only a phone can show are whether the first tap starts the sound (a browser under automation ignores the gesture rule) and the balance by ear.
