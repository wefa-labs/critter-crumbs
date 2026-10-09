# Sound direction, October 2026

Afolabi's direction, 8 October 2026, verbatim: "The type of music and effects I would like is Roller coaster tycoon, Nintendo type vibes", and "we need to have a strong auditorial experience".

Afolabi's review of the first takes, 9 October, verbatim: "Roller coaster park music does match the mood of critter crumbs, it is engaging but it needs to be more grounded in the themes of critter crumbs. We are lacking the Nintendo feel. Feeding time is nice and kid like maybe a little to toddler like but it's nice and calm."

This brief records the settled sound set: the house style, the music and stings with the prompts that made them, a new voice for each Game Design §5.2 token, and what is still to check. It replaces Game Design §5.1's character and §5.5's quiet bed. The decisions are in `docs/decisions.md`.

**Built on 9 October 2026.** Game Design §5 now describes the sound as built, and `docs/research/audio-assets.md` records each file's take, processing and measurements. Where the build settled something this brief left open (the levels, the feast cue fading under its resolve, what the music does around a sting), Game Design §5 and the decision log are the record.

## What changes and what stays

**Changes:**
- the character: bright, bouncy, melodic and playful, in the manner of a cosy Japanese console game, and grounded in the burrow, its critters and the feast. The first round's fairground brief is retired;
- there is music now;
- the 6 kHz "nothing bright" filter goes;
- the levels rise.

**Stays:**
- every token in Game Design §5.2, and the DOM state each one accompanies;
- pitch as position on the C major pentatonic (§5.3). A rising ladder of notes as crumbs land suits the direction;
- sound starts only after the first gesture;
- the Sounds toggle, and damping under reduced motion;
- sound pauses while the tab is hidden.

**Not ours to use:** any existing game's music, melodies or sound effects. The prompts describe the feel. They never name a game, a studio or a composer, and the music service refuses prompts that do.

**Key:** all music is in C major, so the effects' pentatonic pitches sit inside it.

## The house style

Every music prompt begins with this paragraph:

> Instrumental. Whimsical Japanese console-game soundtrack style from the late 1990s and 2000s: a warm acoustic chamber ensemble of flute, clarinet and bassoon with pizzicato strings, marimba and vibraphone, upright bass and brushed drums; bouncy light swing, jazzy seventh chords, playful staccato phrasing and a memorable, singable melody; clean, polished, cheerful but never childish. The world: tiny elemental forest critters who live in a burrow under the roots of an old tree at the edge of an autumn meadow and share bread crumbs at a feast. Calm, warm and hopeful, like feeding animals in a garden. No fairground organ, no calliope, no nursery-rhyme feel, no electronic beats, no vocals.

## The settled set

Afolabi's picks, 9 October. "Round 2" takes were made with the house style; the two stings from round 1 were kept.

| ID | Name | Plays on | Length | Take | App file |
|---|---|---|---|---|---|
| M1 | The burrow | Launcher and home | 90 s loop | Round 2, take 2 | `audio/music/burrow.mp3` |
| M2 | The town square | Burrows, setup, gathering | 90 s loop | Round 2, take 1 | `audio/music/square.mp3` |
| M3 | Feeding time | Scattering | 90 s loop | Round 2, take 1 | `audio/music/feeding.mp3` |
| M4 | The feast | The feast sequence | 10 s | Round 2, take 2 | `audio/music/feast.mp3` |
| M4r | The feast, resolve | The settle | 3 s | Round 2, take 3 | `audio/music/feast-resolve.mp3` |
| M5 | Everyone is full | Results | 60 s loop | Round 2, take 1 | `audio/music/full.mp3` |
| J1 | Scattered | Your scatter is saved | 3 s | Round 2, take 1 | `audio/stings/scattered.mp3` |
| J2 | Statements open | The reveal | 3 s | Round 1, take 2 | `audio/stings/reveal.mp3` |
| J3 | Dusk | Scattering closes with the scatter screen open | 3 s | Round 1, take 2 | `audio/stings/dusk.mp3` |

The prompts, after the house style for M1 to J1:

- **M1:** Main title theme, made to loop seamlessly. 112 BPM swing in C major. Flute and clarinet carry the melody in unison over a bouncy bassoon and upright-bass line, with marimba and pizzicato answering each phrase; the second half adds a whistled counter-melody and light hand claps, and brief brass swells mark the phrase ends. A small hero's adventure theme for tiny critters: cheerful, curious and confident.
- **M2:** Daytime music for the burrow's town square, made to loop seamlessly. 96 BPM gentle swing shuffle in C major. Acoustic guitar comping, a walking upright bass, a vibraphone melody answered by clarinet, soft brushes and an occasional whistle. Sunny, neighbourly and relaxed.
- **M3:** Calm background music for choosing where to give crumbs, made to loop seamlessly. 92 BPM light bossa nova in C major. A vibraphone melody over nylon-string guitar, soft upright bass and brushed drums, with gentle marimba accents and plenty of space. Thoughtful and warm, grown-up rather than babyish; it must sit under on-screen reading without pulling focus.
- **M4:** A 10-second feast celebration cue: three seconds of tambourine, hand claps and a rising pizzicato-and-woodwind run over a building timpani roll, then a joyful full-ensemble burst with bright trumpets, woodwinds and xylophone, ending ringing on a C major chord. Celebratory and warm, triumphant in a small way.
- **M4r:** A 3-second victory fanfare: bright trumpets and xylophone over a timpani hit, landing on a C major chord with a short cymbal sparkle.
- **M5:** Results music after the feast, made to loop seamlessly. 84 BPM slow swing in C major. Music box and vibraphone share a gentle melody over soft acoustic guitar, upright bass and light brushes, with a clarinet answering. Full, sleepy and content: a happy evening.
- **J1:** A 3-second success jingle for saving a choice: a quick rising xylophone arpeggio, a flute trill and a bright muted-trumpet button on C major, with a tiny cymbal sparkle. Cheerful and satisfying.
- **J2** (round 1, no house style): A short magical reveal sting for a cosy game: a harp glissando and sparkling bells rising into a soft C major chord. Instrumental.
- **J3** (round 1, no house style): A short gentle evening sting for a cosy game: a slow descending celesta phrase over a soft held C major chord, sleepy and warm. Instrumental.

## Effects: a new voice for each token

"Synth" means the Web Audio voices, re-voiced brighter. The samples are the settled effect takes below.

| Token | Was | Becomes | How |
|---|---|---|---|
| `connect` | A wooden knock and a breath | A two-note welcome chime, G5 then C6 | Synth bells |
| `reroll` | Two plucks | A spin whirr ending in a pop and a chime | Sample: spin |
| `ui.tap` | A felt tap | A soft bubbly pop | Sample: pop |
| `crumb.add` | A tick, pitched by count | A bright glockenspiel "bip" on the same pentatonic step | Synth bell |
| `crumb.remove` | The tick, damped and bending down | A softer bip one step down | Synth bell |
| `pour.hold` | Tick grains and a rustle | Rising bell grains over a sparkle bed | Synth bells and sample: sparkle |
| `pour.reverse` | The pour, descending | The same, descending | Synth bells and sample: sparkle |
| `pile.wall` | A low thump on wood | A short cartoon boing | Sample: boing |
| `pile.empty` | Two descending plucks | A rising three-note "ta-da" | Synth bells |
| `statement.open` | A page-turn rustle | A storybook page flip | Sample: page |
| `scatter.confirm` | A pluck and a thump | J1 | Sting |
| `statements.reveal` | A rustle into a chord | J2 | Sting |
| `scatter.closed` (new) | Silent: deadline changes made no sound | J3, once, when scattering closes with the scatter screen open | Sting |
| `feast.open` | Breath and a drone | M4 | Music |
| `feast.feed` | A pour crescendo and a pluck | A critter nibbling, then a bip pitched by share | Sample: munch, and synth bell |
| `feast.settle` | A wooden chord and a thump | M4r and a small chorus of cheering critters | Music and sample: cheer |
| `error` | A muted knock | A soft, low cartoon "bwomp", never alarming | Synth |
| `ambience.bed` | Grass, wind and a marimba figure | Replaced by the music loops. The toggle becomes Music | Music |

| Effect | Take | App file |
|---|---|---|
| Munch | Round 2, take 2 | `audio/sfx/munch.mp3` |
| Cheer | Round 2, take 1 | `audio/sfx/cheer.mp3` |
| Boing | Round 1, take 1 | `audio/sfx/boing.mp3` |
| Pop | Round 1, take 1 | `audio/sfx/pop.mp3` |
| Spin | Round 1, take 1 | `audio/sfx/spin.mp3` |
| Page | Round 1, take 2 | `audio/sfx/page.mp3` |
| Sparkle (loop) | Round 1, take 2 | `audio/sfx/sparkle.mp3` |

## Where the sounds come from

Every settled file was generated on 9 October 2026 through the ElevenLabs API with Afolabi's key: music with Eleven Music (`music_v2_5`, instrumental), effects with Eleven sound effects (`eleven_text_to_sound_v2`). The implementation adds `docs/research/audio-assets.md`, recording each file's prompt, source take and processing. Kenney (CC0), the Sonniss GDC bundles and Freesound's CC0 files remain options if a future cue needs a recorded sound.

## Still to check

- **The plan's commercial terms**, before the production deploy. Eleven Music's terms (updated 26 May 2026) limit Free, Starter, Creator and Pro to individuals; an organisation such as WEFA LLC needs Scale or a higher tier. The commercial-rights table excludes "Studio Games", defined as monetized video games offered on several platforms. A web app used by burrows probably sits outside that; confirm the row for the plan the key belongs to. [Model terms](https://elevenlabs.io/eleven-music-model-specific-terms).
- **Copyright:** machine-generated music may not be protected by copyright, so others could reuse a track. This does not stop us using it.

## Technical notes for the implementation

- **Format:** MP3 everywhere, because every browser decodes it with `decodeAudioData`. Music and stings at 128 kbps stereo; effects at 96 kbps mono.
- **Loading:**
  - effects and stings load after the first gesture;
  - music loads per screen, after the first gesture;
  - loops repeat with a two-buffer equal-power crossfade (G8), so seams need not be perfect;
  - music pauses while the tab is hidden;
  - nothing musical is in the first load.
- **Levels:**
  - music sits about 8 dB under the effects;
  - it ducks 6 dB while a statement is open, and makes way for the feast;
  - M4 rides above everything;
  - the 6 kHz low-pass goes, and a limiter sits at the end of the chain.
- **Toggles:** Sounds (effects, stings, the feast cue) stays. Burrow ambience becomes Music, for the loops. Music is on by default and starts with the first tap; the choice is remembered (Afolabi, 8 October).

## The demo films

With the set settled:
1. Lay the music under the phone and desktop films at the beats listed in `docs/reviews/october-game/demo/README.md`.
2. Add the key effects at the same moments.
3. Mux AAC audio beside the H.264 video, and let the recorder's self-check accept an audio stream.

Playwright cannot capture the app's own Web Audio, so the films' soundtrack is laid in afterwards, matching what the app plays.
