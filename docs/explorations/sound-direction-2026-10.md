# Sound direction, October 2026

Afolabi's direction, 8 October 2026, verbatim: "The type of music and effects I would like is Roller coaster tycoon, Nintendo type vibes", and "we need to have a strong auditorial experience". It is recorded in `docs/decisions.md`.

This brief turns that direction into music cues with generation prompts, a new voice for each Game Design §5.2 token, the sample sources and the checks to make before anything ships. It replaces Game Design §5.1's character and §5.5's quiet bed. Game Design §5 is rewritten when the sound is implemented.

## What changes and what stays

**Changes:**
- the character: bright, bouncy, melodic and playful, a fairground crossed with a cosy console game;
- there is music now;
- the 6 kHz "nothing bright" filter goes;
- the levels rise.

**Stays:**
- every token in Game Design §5.2, and the DOM state each one accompanies;
- pitch as position on the C major pentatonic (§5.3). A rising ladder of notes as crumbs land suits the new direction;
- sound starts only after the first gesture;
- the Sounds toggle, and damping under reduced motion;
- sound pauses while the tab is hidden.

**Not ours to use:** any existing game's music, melodies or sound effects. The prompts describe the feel. They never name a game, a studio or a composer.

**Key:** all music is in C major, so the effects' pentatonic pitches sit inside it.

## Music

| ID | Plays on | Length | Loop | Tempo | Feel |
|---|---|---|---|---|---|
| M1 | Launcher and home | 90 s | Yes | 100, 3/4 | A carousel waltz at the park gates |
| M2 | Burrows, setup, gathering | 90 s | Yes | 92, 4/4 | A cosy town square in the morning |
| M3 | Scattering | 90 s | Yes | 96, 4/4 | Feeding time: light, curious, sparse enough to read over |
| M4 | The feast | 9 s plus a 2 s resolve | No | Free | The ride: a build, then a burst |
| M5 | Results, after the settle | 60 s | Yes | 84, 4/4 | Everyone is full: happy and calm |
| J1 | Scattered (saved) | 2 s | No | — | A small "you did it" flourish |
| J2 | Statements open | 3 s | No | — | A reveal sparkle |
| J3 | Scattering closed at dusk (optional, see Open) | 3 s | No | — | A sleepy evening phrase |

### Prompts

These are for an AI music tool such as Eleven Music.
- Generate three or four takes of each cue and choose by ear.
- Export the highest quality the tool offers.
- Keep the prompt, plan and date with each file you keep.

**M1, the park gates:**
> Instrumental video game title music, 90 seconds, made to loop seamlessly. A cheerful carousel waltz in 3/4 at 100 BPM in C major. Lead melody on a fairground band organ doubled by glockenspiel, oom-pah-pah tuba and bass drum, brushed snare, a short bright brass fanfare opening each phrase. Nostalgic 1990s theme-park game feel, playful and catchy, a melody you can hum. Bright, clean mix. No vocals, no lyrics, no sound effects. End on the dominant so it flows back to the start.

**M2, the town square:**
> Instrumental cosy village music for a life-sim game, 90 seconds, made to loop seamlessly. 4/4 at 92 BPM in C major. Ukulele strums and a marimba melody, pizzicato strings, soft upright bass, a light brush kit and a whistled counter-melody. Warm, sunny and gently bouncy, like a morning in a small town square. No vocals.

**M3, feeding time:**
> Instrumental background music for a calm, playful decision moment in a cosy video game, 90 seconds, made to loop seamlessly. 4/4 at 96 BPM in C major. Kalimba and glockenspiel motifs over a soft round bass and finger snaps, a sparse arrangement with plenty of space, curious and light. It must sit under on-screen reading without pulling focus. No vocals.

**M4, the ride:**
> Instrumental 9-second video game cue for a big celebration: a snare drumroll and a rising fairground organ run build for 7 seconds with brass stabs climbing in pitch, then a bright cymbal crash and a short triumphant resolve on a C major chord. Theme-park celebration, playful. No vocals.

**M4 resolve:**
> Instrumental 2-second triumphant resolve: brass and fairground organ land together on a bright C major chord with a cymbal swell. No vocals.

**M5, everyone is full:**
> Instrumental music for a happy, relaxed end-of-day screen in a cosy game, 60 seconds, made to loop seamlessly. 4/4 at 84 BPM in C major. A music-box melody over nylon-string guitar and soft strings, contented and warm, gently swaying. No vocals.

**J1, scattered:**
> A 2-second cheerful video game success jingle: a quick rising glockenspiel and brass flourish ending on a bright C major chord. Instrumental.

**J2, statements open:**
> A 3-second magical reveal sting for a cosy game: a harp glissando and sparkling bells rising into a soft C major chord. Instrumental.

**J3, dusk:**
> A 3-second gentle evening sting for a cosy game: a slow descending celesta phrase over a soft held C major chord, sleepy and warm. Instrumental.

## Effects: a new voice for each token

"Synth" means the existing Web Audio voices, re-tuned brighter. "Sample" means a file from the sources below.

| Token | Was | Becomes | How |
|---|---|---|---|
| `connect` | A wooden knock and a breath | A two-note welcome chime, G5 then C6, with a tiny sparkle | Synth |
| `reroll` | Two plucks | A short spin whirr ending in a pop and a chime | Sample and synth |
| `ui.tap` | A felt tap | A soft click-pop | Sample |
| `crumb.add` | A tick, pitched by count | A bright glockenspiel "bip" on the same pentatonic step, with a tiny pop | Synth |
| `crumb.remove` | The tick, damped and bending down | A softer "boop" one step down | Synth |
| `pour.hold` | Tick grains and a rustle | Fast rising bell grains over a sparkle bed, like coins pouring | Synth, with a sampled sparkle loop |
| `pour.reverse` | The pour, descending | The same, descending | Synth and sample |
| `pile.wall` | A low thump on wood | A short cartoon boing | Sample, or a synth spring |
| `pile.empty` | Two descending plucks | A three-note "ta-da" chime | Synth |
| `statement.open` | A page-turn rustle | A paper "fwip" and a soft chime | Sample and synth |
| `scatter.confirm` | A pluck and a thump | J1 | Music sting |
| `statements.reveal` | A rustle into a chord | J2 | Music sting |
| `feast.open` | Breath and a drone | M4's build | Music |
| `feast.feed` | A pour crescendo and a pluck | A crunchy munch, then a pop pitched by share | Sample and synth |
| `feast.settle` | A wooden chord and a thump | M4's resolve and a small crowd cheer | Music and sample |
| `error` | A muted knock | A soft cartoon "bwomp", never alarming | Synth |
| `ambience.bed` | Grass, wind and a marimba figure | Replaced by music (M1–M5). The toggle becomes Music | Music |

## Where samples come from

| Source | Licence | Use it for |
|---|---|---|
| [Kenney](https://kenney.nl/assets/category:Audio): UI Audio, Interface Sounds, Impact Sounds, Casino Audio | CC0; credit optional | Clicks, pops, boings, spins |
| [Sonniss GDC bundles](https://sonniss.com/gameaudiogdc) | Royalty-free, commercial, no credit. No standalone resale and no machine-learning training | A crowd cheer, fairground atmosphere |
| [Freesound](https://freesound.org), CC0 filter only | Per file. Never use NC or ND files | Munches, crunches, paper |
| ElevenLabs Sound Effects | Paid plans need no credit; the free plan requires it | Custom munches and boings, if libraries fall short |

Each file kept gets a record: its source URL, licence, the date fetched and any edit made.

## Checks before generating music

- **Eleven Music's terms**, updated 26 May 2026:
  - Free, Starter, Creator and Pro are for individuals. An organisation such as WEFA LLC needs Scale (under 10 people) or a higher tier.
  - The commercial-rights table excludes "Studio Games", defined as monetized video games offered on several platforms. A web app used by burrows probably sits outside that, but confirm the row for the plan you choose before generating final tracks.
  - Owning a track does not allow reselling it on its own.
  - [Model terms](https://elevenlabs.io/eleven-music-model-specific-terms).
- **Other tools with paid commercial use** (Stable Audio, Suno): read their current terms the same way.
- **Copyright:** machine-generated music may not be protected by copyright, so others could reuse a track. This does not stop us using it.

## Technical notes for the implementation

- **Format:** one format everywhere, AAC in `.m4a`. Music at 128 kbps; samples at 96 kbps, mono.
- **Loading:**
  - music loads per screen, after the first gesture;
  - it loops with the existing two-buffer crossfade (G8), so seams need not be perfect;
  - it pauses while the tab is hidden;
  - the installable app's service worker caches it;
  - nothing musical is in the first load. A 90-second track is about 1.4 MB.
- **Levels:**
  - music sits about 8 dB under the effects;
  - it ducks 6 dB while a statement is open;
  - M4 rides above everything;
  - the effects master rises from −12 dB peak;
  - the 6 kHz low-pass goes, and a limiter stays at the end of the chain.
- **Toggles:** Sounds (effects) stays. Burrow ambience becomes Music. Music is on by default and starts with the first tap; the choice is remembered (Afolabi, 8 October).

## The demo films

Once M1, M3, M4, M5 and the stings exist:
1. Lay them under the phone and desktop films at the beats listed in `docs/reviews/october-game/demo/README.md`.
2. Add the key effects as samples at the same moments.
3. Mux AAC audio at 160 kbps beside the H.264 video, and let the recorder's self-check accept an audio stream.

Playwright cannot capture the app's own Web Audio, so the films' soundtrack is laid in afterwards, matching what the app plays.

## Open for Afolabi

1. Whether scattering closing at dusk gets J3. Today it is silent on purpose: deadline changes never make a sound.
2. Which tool and plan make the music, and who runs the generations from the prompts above.
