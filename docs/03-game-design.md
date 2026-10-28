# Critter Crumbs — Game Design

**Document 3 of 4** · Status: draft for review · 2026-09-02 · §5 rewritten 2026-10-09 for the settled sound set
Upstream: `01-prd.md` (rules §5, flows §7), `02-design-system.md` (the six words §2, tokens §3, lighting presets §4.2, critter state §5.4, the heap §7.4, screen-reader pairing §12.6). Downstream: `04-technical-spec.md`.

**Licence scope, 2026-10-28.** The functional game, simulation and audio playback software is MIT. WEFA reserves the generator, artwork implementations, art, audio recordings and branding identified in [LICENSE-WEFA](../LICENSE-WEFA), including copies embedded in prototypes and demonstrations. See the [licence overview](../LICENSE); third-party terms remain in force.

**How to read this document.** Written for coding agents, with a human reviewing.

- Every number here is a starting value to build to, then tune in the rehearsal. Ship the number; do not invent a different one. If tuning changes it, change it here.
- **Decision (G#)** marks a call made in this document that the brief and the earlier documents left open. Collected in §10.
- **Open (GQ#)** marks something the reviewer must confirm. Collected in §10.
- The Design System owns colour, materials, lights, and the critter's identity; this document owns how the critter *moves*, how input *feels*, how the two designed moments *play*, and every *sound*. The Technical Spec owns how it is built, on the simulation model in §7.
- The brief routed this document through Game Studio in ChatGPT. That was not reachable from this session; §12 carries a review prompt so that pass can still happen and be folded back in.

---

## 1. How it feels

Critter Crumbs is a tool people use twice a year to move real money. It is not a game to be good at. There is no mastery curve, no score, no streak, no reward loop, nothing to unlock. The play is entirely in the *feel* of a handful of small, real-seeming actions, and in one big moment at the end.

Six principles, each with a rule the implementation can be checked against:

| Principle | Rule |
|---|---|
| **Feeding, not filling in** | You never type a number to get started; you give crumbs, and a critter reacts to each one. The number field exists for the person who wants exactly 33, and it also produces a reaction (§2.6). |
| **Every input gets a physical reply** | A press produces visible motion and a sound on the *same frame* it is received (≤ 16 ms), never after a round trip. Nothing waits for the network to feel real; saving is a separate, later, quiet confirmation. |
| **Weight without spectacle** | Critters have mass: squash on impact, settle with a small overshoot, breathe at rest. Amplitudes are small (§3). Nothing blinks, flashes, or bounces to get attention. |
| **Quiet, then one big moment** | Every effect is about a second or less, the three stings three seconds, and all of them sit under the feast; the music sits under everything (§5.4). Idle motion is barely there. The feast can be loud, long and warm because nothing else was (§4.2). |
| **No sad critters** | A critter that received few crumbs is calm, not sad. Growth is compressed, expression ranges from calm to delighted, never below calm (§3.4, **G4**). Recognition should never be humiliation. |
| **The truth is in the DOM** | Motion and sound never carry meaning alone. Every cue in this document names the DOM state it accompanies (Design System §12.6). Turn all of this off and the tool still works. |

What the app should feel like in the hand, in one paragraph: you pick up your phone in a group chat lull, open the link, and the critters are asleep in a warm dusk. You read your friends' statements one at a time. Then you feed: a tap gives a crumb with a bright little bip and the critter squashes and chews; you hold, and the bips run together into a pour that climbs in pitch while the heap under your thumb visibly dwindles. When it is empty there is a small rising ta-da. You press *Scatter these* and are told, quietly, that you can change it until Friday. Days later you open the link again and the feast plays: everyone wakes together, crumbs fly, critters chew and grow, the light turns golden, they all give one small hop, and the numbers are right there.

## 2. Input: tap and hold

### 2.1 The curve

All values assume 100 crumbs issued. **G1** — rates scale with the number issued so a pile always takes about the same time to pour: `POUR_SCALE = clamp(issued / 100, 0.5, 5)`; the minimum keeps a 10-crumb feast from feeling glacial, the maximum keeps a 1,000-crumb pour from becoming noise.

| Constant | Value | Meaning |
|---|---|---|
| `TAP_GIVE` | on press | **G2** — a crumb is given on `pointerdown`, not release. The reply is immediate and the hold, if it comes, continues from a crumb already given. |
| `HOLD_DELAY_MS` | 300 | Still pressed at 300 ms → pouring begins |
| `POUR_RATE_MIN` | 8 crumbs/s × scale | Rate at the start of the pour |
| `POUR_RATE_MAX` | 40 crumbs/s × scale | Cap |
| `POUR_RAMP_S` | 1.5 | Linear ramp from min to max; rate(t) = min + (max − min) × clamp(t / 1.5, 0, 1) |
| `RELEASE` | 0 ms | Release, pointer cancel, or leaving the control stops the pour instantly. No crumb is given on release. |
| `ACCUMULATOR` | fractional | Each frame adds `rate × dt` to an accumulator; a crumb is emitted for every whole unit. Sub-frame accurate; never more than `rate × dt + 1` crumbs in one frame. |
| `WALL` | stop | Reaching zero remaining (or zero on this critter for minus) stops the pour and plays `pile.wall` once. Pressing again at the wall replays `pile.wall`; it never errors. |

Worked timing for a full 100-crumb pour from a standing start: 0.3 s delay, then 8 → 40/s over 1.5 s (36 crumbs), then 40/s for the remaining 64 crumbs (1.6 s). About **3.4 s** thumb-down to empty. Emptying a pile should feel decisive, not laborious, and still slow enough to stop where you meant to.

### 2.2 Minus is the same gesture

The minus control runs the identical curve in reverse. Crumbs return to the heap (the DOM hop reverses, the 3D crumb flies out of the mouth back toward the heap side of the stage), the count highlight tints the same, and the pitch steps *down* (§5.3). Overshooting is guaranteed when everything must be spent; taking back must feel as good as giving, so minus has no extra confirmation, no delay, and no different sound character, only direction.

### 2.3 Keyboard

`Enter` or `Space` on `+`/`−`: keydown (not a repeat) is the press, keyup is the release. The same curve applies, so holding a key pours. Native key auto-repeat is ignored (`event.repeat`), so the OS repeat rate never sets the pour rate.

### 2.4 The stage as a target

Tapping the critter's stage is a press on `+` for that critter (Design System §6.3). Holding on the stage pours. The 3D crumb flies from the tap point; for the control buttons it flies from the heap side of the stage.

### 2.5 Reply timing

| Moment | Visual reply | Sound | Latency budget |
|---|---|---|---|
| Press | Count increments; `bump` on the critter (§3.2); DOM hop leaves the heap; heap loses a glyph if a threshold is crossed | `crumb.add` | Same frame; sound scheduled ≤ 20 ms ahead |
| Pour starts (300 ms) | Count highlight tints; the crumb stream begins; the critter chews (§3.2) | Discrete bips crossfade into `pour.hold` after the third crumb | ≤ 1 frame after the timer |
| During pour | Count updates every frame; stream density follows the rate | `pour.hold` pitch climbs with the count | — |
| Release | Stream stops; one final DOM hop; chew settles to idle over 260 ms | `pour.hold` fades out in 60 ms; one `crumb.add` at the current pitch | Same frame |
| Wall | Heap jiggles once (2° rotation, 120 ms); the control shows its `aria-disabled` state | `pile.wall` | Same frame |
| Pile empty | The heap shows its three faint outlines; the *All scattered* chip appears | `pile.empty` | Same frame |

### 2.6 Typed amounts

Committing a number field animates the count from the old value to the new over `min(320 ms, 8 ms × |delta|)` with the digits rolling, plays `pour.hold` as a short run of bells stepping to the new count (§5.3), and gives the critter one `bump` at the end. A typed 33 should feel like a short pour, not like nothing happened, and never like 33 taps.

## 3. The critter's body

The Design System gives every critter an identity and a state vector (`asleep`, `fed`, `mood`, `bump`, `isOwn`). This section defines how the state vector moves. All motion is on group transforms and a handful of part transforms; there is no skeleton.

| Rig channel | What moves | Range |
|---|---|---|
| `group.scale` (x, y, z) | Whole critter: breath, bump, growth | 0.90 – 1.40 |
| `group.rotation.z` | Lean/wobble | ± 3° |
| `group.rotation.x` | Posture (upright when pleased) | −3° – 0° |
| `head.rotation.z` | Head tilt: rest value from identity, returns toward 0 when pleased | identity ± 8° |
| `ear.rotation.z` (each) | Rest from identity; lift when pleased, droop when asleep | rest −25° … rest +15° |
| `eye.scale.y` (each) | Lids: 1 open, 0.12 closed; squint for happiness | 0.12 – 1 |
| `pupil.position` | Toward the last crumb's origin, then back to centre | ± 30 % of eye radius |
| `cheeks.visible / scale` | Appear at `fed` ≥ 0.5 (Design System) or mood ≥ 0.5 | 0 – 1 |
| `mouth` | **G5** — a small arc under the snout, Burrow at 60 % opacity; curvature follows mood; hidden below mood 0.35. An addition to Design System §5.3 (one torus segment, ≤ 40 triangles), needed because eyes and ears alone cannot read as "pleased" at grid size. In 2D, a stroked arc. | curvature 0 – 1 |

### 3.1 Idle

| State | Breath (`scale.y`) | Wobble (`rotation.z`) | Blink | Other |
|---|---|---|---|---|
| Awake, idle | ± 1.2 % at 0.4 Hz | ± 1.5° at 0.2 Hz | Every 3–6 s (uniform per critter), 120 ms close-open | Pupils drift ± 5 % every 4–9 s |
| Asleep | ± 1.5 % at 0.25 Hz | none | lids closed | Ears drooped 25°; a small head nod (−4°, 600 ms) every ~8 s; the `sleep` glyph in the DOM label |
| Pleased (mood ≥ 0.75) | ± 1.5 % at 0.5 Hz | ± 2° at 0.3 Hz | as awake | A small hop (`scale` 1.04/0.97 then `position.y` +3 % over 260 ms) every 6–10 s |

Every critter has its own phase offset (`idlePhase` from identity) so a grid never moves in unison. Amplitudes are deliberately at the edge of perception: the test is that a still screenshot and a live grid look the same, and the live grid feels alive.

### 3.2 Bump and chew (receiving crumbs)

The **bump** is the reply to a single crumb. Volume-preserving squash and stretch on the group, keyframed, no physics:

| Time | `scale` (x, y, z) | Notes |
|---|---|---|
| 0 ms | 1.08, 0.92, 1.08 | Impact: the crumb arrives at the mouth |
| 90 ms | 0.97, 1.04, 0.97 | Rebound |
| 180 ms | 1.01, 0.995, 1.01 | Settle |
| 260 ms | 1, 1, 1 | Rest (multiplied into the current growth scale) |

With it: the pupils look toward the crumb's origin for 120 ms, lids widen 10 % for 120 ms, then the eyes return. A second bump within 260 ms restarts the curve from the current pose rather than stacking.

During a pour, bumps would stack into a blur, so the critter **chews** instead: `scale.y` oscillates ± 3 % at a quarter of the crumb rate (2 Hz at 8/s up to 8 Hz cap), ears wiggle ± 3° at the same rate, cheeks puff to 1.2× while chewing, mouth curvature rises 0.2. On release, the chew decays to idle over 260 ms with one final bump.

### 3.3 Wake

600 ms from asleep to awake, used at the statement reveal, at the feast, and by the own critter when its owner opens the results.

| Time | What |
|---|---|
| 0 – 120 ms | Lids open (`eye.scale.y` 0.12 → 1, ease-out) |
| 60 – 500 ms | Ears lift from the drooped pose to rest with a spring (stiffness 180, damping 12: one overshoot of ~8°, settled by 500 ms) |
| 120 – 520 ms | One stretch: `scale` 0.95/1.08/0.95 at 120 ms → 1/1/1 at 520 ms, ease-in-out |
| 200 – 600 ms | Head tilt returns from nod to its identity rest |

### 3.4 Growth and expression at the feast

The input is a critter's share `s` of all crumbs scattered (PRD tally, R4), and `N`, the number of critters in the feast. Growth is judged against fair share, not absolute share, so a four-option budget and an eight-person feast feel the same:

```
r    = s × N                      // 1.0 = exactly a fair share
fed  = clamp(r / 2.5, 0, 1) ^ 0.75  // 2.5× fair share or more = fully fed
scale = 1 + 0.35 × fed             // never above 1.35, never below 1
mood  = received > 0 ? max(0.25, fed) : 0   // G4: a crumb received means at least "content"
```

Worked values (rounded here; tests retain the full precision of the formula): everyone equal → `fed` 0.502973, scale 1.176041, all pleased and the same size. An option with 60 % of a four-way split → `fed` 0.969847, scale 1.339447. One person with 5 % in a group of ten → `fed` 0.299070, scale 1.104674, still content. Nobody is ever tiny next to a giant. The formula and frozen GROWTH constants are unchanged.

| `mood` | Name | Eyes | Ears | Mouth | Cheeks | Posture | Idle |
|---|---|---|---|---|---|---|---|
| 0 | Calm | Open | Rest | Hidden | Identity only | Identity tilt | Awake idle |
| 0.25 | Content | Squint 10 % | +5° | Hidden | Identity only | Tilt × 0.8 | Awake idle |
| 0.5 | Pleased | Squint 20 % | +10° | Small arc (0.4) | Visible | Tilt × 0.5, `rotation.x` −1° | Awake idle |
| 0.75 | Happy | Squint 30 % | +12° | Arc 0.7 | Full | Tilt × 0.3, −2° | Pleased idle |
| 1.0 | Delighted | Crescents (squint 45 %) | +15°, wiggle ± 3° every 4 s | Arc 1.0 | Full, 1.1× | Tilt 0, −3° | Pleased idle with hops |

Between rows, interpolate linearly. In Simple view the same table applies through CSS: scale, lid path swap, cheek visibility, a stroked mouth arc.

### 3.5 Reduced motion and Still critters

Both remove idle motion entirely (no breath, no wobble, no blink, no hops), replace `bump` with a 120 ms opacity pulse on the count, remove the chew and the crumb stream, and make growth an instant state change under a 320 ms crossfade. The wake becomes a 200 ms crossfade between the asleep and awake poses. These rules are at least as strict as Design System §3.6 requires, and they apply to the 3D scene and the 2D portrait alike.

## 4. The two designed moments

### 4.1 Statements reveal — scattering opens

The first visit after the gathering deadline. The point is that everyone's writing appears *at once*, and that the burrow visibly wakes up. It is a moment, not a state change, and its sound is one short sting, because the feast must remain the only big one.

| Time | Canvas | DOM | Sound |
|---|---|---|---|
| 0 ms | Critters asleep under `dusk` | The reveal card (`reveal.*`) and the grid, statements still collapsed | — |
| 0 – 600 ms | Lights crossfade `dusk` → `day` | — | `statements.reveal` at 0 ms |
| 200 ms + 80 ms × index | Each critter wakes (§3.3), in grid order | Its statement line fades in (`--cc-dur-2`) | — |
| ~1.2 s | All awake, idle | *Start reading* has focus | — |

Reduced motion: lights and statements crossfade in 200 ms; no stagger; no wake motion.

Feeding time, the scattering music, comes in as the sting's last second dies away (§5.5).

### 4.2 The feast

The one big moment. It plays the first time anyone opens the feast after the scattering deadline, once the client has fetched the key and tallied (PRD R14). *Skip to results* is present from the first frame. The results table is already in the DOM below the grid; the sequence is a reading of it, not a gate in front of it.

**Order.** **G3** — critters are fed in grid order, not by rank, and the finale is shared. A countdown from least to most would make the animation a leaderboard, and this is a recognition tool; the table below the grid carries the ranking for anyone who wants it. The build-up comes from the wave itself and the finale, not from saving the biggest for last.

**The feast heap.** A large version of the heap (Design System §7.4) sits above the grid for the duration, showing every scattered crumb (24 glyphs regardless of count; the number beside it is the real total). Crumbs fly from it to each critter as DOM hops (**G6** — the feast's crumbs are DOM hops, not canvas particles, so 3D and Simple view share one sequence and the canvas budget is untouched).

| Beat | Time | Canvas | DOM | Sound |
|---|---|---|---|---|
| **Laid out** | 0.0 s | Critters asleep, `dusk` | The feast heap fills in over 400 ms (glyphs pop in, 20 ms apart); the total counts up beside it | `feast.open` begins: the feast cue, about three seconds of build and then the burst |
| **Everyone wakes** | 0.4 – 1.2 s | All critters wake together (§3.3), up to 40 ms stagger in grid order, compressed to fit every 600 ms wake inside this window — a ripple, not a queue | — | — |
| **The wave** | 1.2 s + 0.45 s × index | Critter *i* chews (§3.2) for 900 ms as its crumbs arrive, then grows to its `fed` scale with one overshoot (+6 % at 600 ms, settled at 900 ms) and lands its expression (§3.4). Lights ease `dusk` → `feast` across the wave | 12–24 hops fly from the feast heap to stage *i* over 600 ms, count ∝ share (min 4 for anyone with crumbs, 0 for none); the cell's count rolls up to its total | `feast.feed` for critter *i*: a nibble, then a bell pitched by its share; feeds overlap, so the bells layer into a rising texture over the cue |
| **Settle** | wave end + 0.2 s | Every critter gives one small hop together (`scale` 1.05/0.96 → 1, 300 ms); lights ease `feast` → `day` over 800 ms; idle resumes | The feast heap empties to its outlines; the results heading receives focus; *Replay the feast* appears | `feast.settle`: the fanfare lands and the feast cue fades under it; the critters cheer |
| **Readable** | settle + 0.8 s (lighting finishes) | Settled pose; idle resumes | Totals and shares visible in the table; nothing else moves | The fanfare's tail, then Everyone is full if *Music* is on (§5.5) |

The results and heading focus are available at Settle; Readable marks completion of its 800 ms lighting transition. This preserves the independent 6.0–6.6 second headless acceptance window. Hop counts scale to the largest received amount: `max(4, round(24 × received / largestReceived))`, with no hops for zero. Equal shares therefore receive equal 24-hop streams; the existing 4/24 bounds and 600 ms stream remain unchanged.

Duration: 8 critters ≈ 1.2 + 7 × 0.45 + 0.9 + 0.2 + 0.8 ≈ **6.3 s**; 4 options ≈ 4.5 s. Cap the whole sequence at 8 s by tightening the stagger for larger feasts. The result is readable at the settle, which satisfies the PRD's three-second rule with margin.

**Variants.**

| Case | What plays |
|---|---|
| Replay | From *Everyone wakes*; the table stays; the heap refills first (400 ms); the feast cue plays again |
| Reduced motion / Still critters | No wave: one 320 ms crossfade from asleep-dusk to the settled state, lights to `day`; `feast.settle` only, at −6 dB |
| Simple view | The same beats with the Design System §7.3 portraits: chew is a 3 % `scale.y` pulse, growth a CSS scale; the hops are identical |
| Nobody scattered | *Laid out* and *Everyone wakes* play; no wave; the settle hop is skipped; `feast.settle` plays softly; the DOM says `results.nobody` |
| One scatterer | The full sequence; the table says `results.one` |
| A tie | Nothing special in the sequence; `results.tie` in the table |
| Skip | Jumps to *Readable* with a 200 ms crossfade; sound stops in 100 ms |

### 4.3 What makes it satisfying rather than merely functional

- **Anticipation you can see.** Dusk, sleeping critters, and a heap that fills before anyone moves. The waiting screen before the key arrives uses the same dusk, so the feast is a release from a state you have been looking at.
- **Fairness before proportion.** Everyone wakes together before anyone is fed. The first thing the sequence says is "we are all here."
- **Proportion you can feel, not measure.** Chewing length, hop count, pitch, and growth all follow share, so a large share is unmistakable without any critter being made small.
- **A finale that resolves.** The shared hop and the fanfare end the sequence on the whole group, then the light goes to day and the numbers are simply there.
- **Replay as a gift, not a gate.** The results never wait for the animation; the replay exists because people will want to see it again, especially the person who did the hard work this cycle.
- **What is deliberately absent:** confetti, a spotlight on the top critter, a leaderboard animation, ranking order, sad faces, tension-building pauses, and any pacing borrowed from loot boxes. Restraint elsewhere is what makes this land, and restraint here is what keeps it a tool.

## 5. Sound

### 5.1 Character

Afolabi's direction of 8 October 2026: "Roller coaster tycoon, Nintendo type vibes", and "a strong auditorial experience". The sound is **bright, bouncy, melodic and playful**, in the manner of a cosy Japanese console game, and grounded in the burrow, its critters and the feast. This replaces the first brief (warm, soft, matte, wooden, organic, quiet), which still governs materials and light (Design System §2). The settled set, its house style and its prompts are in `docs/explorations/sound-direction-2026-10.md`; the files, their processing and their measurements are in `docs/research/audio-assets.md`.

There are three kinds of sound:

| Kind | What | Where it plays |
|---|---|---|
| **Music** | Four looping tracks, one for each part of the app (§5.5) | The music bus, under the *Music* toggle |
| **Recordings** | Seven effects, three stings, and the feast cue with its resolve | The effects bus, under the *Sounds* toggle |
| **Synth voices** | Bells for the crumbs and the chimes, and a stand-in for each recorded cue until its file has loaded | The effects bus, under the *Sounds* toggle |

All the music is in C major, so the crumbs' pentatonic pitches (§5.3) sit inside it. Nothing of anyone else's is used: every file was generated from a written brief that names no game, studio or composer.

The synth voices are made with the Web Audio API:

| Voice | Recipe | Used by |
|---|---|---|
| **Bell** | A struck bar: a sine at the note with partials at 2.76 and 5.4 times it that die away sooner; attack 2 ms, exponential decay up to 220 ms | `crumb.add`, `crumb.remove`, the grains of `pour.hold`, `connect`, `pile.empty`, the bell in `feast.feed`, and the stand-ins for the stings, the spin and the fanfare |
| **Tick** | Sine, 620 → 380 Hz over 30 ms, scaled to the note; attack 2 ms, decay 70 ms; plus a 12 ms noise burst through a band-pass at 2.5 kHz | The tiny pop on top of `crumb.add`; the stand-in for `ui.tap` |
| **Thump** | Sine bending down a fifth over 60 ms; attack 3 ms, decay 110 ms | `error`; the stand-ins for `pile.wall` and `feast.settle` |
| **Breath** | White noise through a band-pass sweeping 900 Hz to 2.4 kHz, amplitude-modulated at 12–18 Hz | The stand-ins for `statement.open`, `feast.open` and the sparkle bed |
| **Drone** | Two sines an octave apart at 65 and 130 Hz with a slow tremolo | The stand-in for `feast.open` |

The chain: voices → compressor (threshold −18 dB, ratio 3 : 1, attack 5 ms, release 120 ms) → effects gain (the *Sounds* toggle). Recordings join at the effects gain, past the compressor, so each lands at the level it is given. Music → duck gain → music gain. Effects and music → limiter (threshold −3 dB, ratio 20 : 1, attack 3 ms, release 250 ms) → destination. Nothing is low-passed. Every synth trigger varies a little: ± 25 cents on ticks and thumps, ± 10 cents on bells, ± 8 % gain, ± 10 ms timing. Recordings play as recorded.

### 5.2 Token table

A level is the peak the cue reaches, relative to full scale, with both toggles on. A recording's length is its file's; the cues that are always synth are under 400 ms.

| Token | Fires when | DOM state it accompanies (DS §12.6) | Sound | Source | Length | Level |
|---|---|---|---|---|---|---|
| `connect` | Connect succeeds | `ConnectButton` → connected | A two-note welcome chime, G5 then C6 | Synth bells | 240 ms | −14 dB |
| `reroll` | Re-roll pressed | New portrait; `critter.reroll.announce` | A spin whirr ending in a pop and a chime | Recording: spin | 1.2 s | −14 dB |
| `ui.tap` | A state-changing button pressed (*Open the feast*, *Scatter These*, *Leave burrow*, *Extend*), never on navigation | Button `active` | A soft bubbly pop | Recording: pop | 0.8 s | −20 dB |
| `crumb.add` | A crumb given (press) | Count +1; the hop | A bright glockenspiel bip on this critter's pentatonic step (§5.3) | Synth bell | 160 ms | −14 dB |
| `crumb.remove` | A crumb taken back | Count −1; reversed hop | A softer bip, one step below the current | Synth bell | 150 ms | −16 dB |
| `pour.hold` | Pouring (from the 3rd crumb of a hold); a typed amount | Count highlight; crumb stream / pulse | Rising bell grains over a sparkle bed (§5.3) | Synth bells; recording: sparkle, looped | Continuous | −14 dB |
| `pour.reverse` | Pouring in reverse; a typed amount downward | Same, minus | The same, descending | Synth bells; recording: sparkle | Continuous | −16 dB |
| `pile.wall` | A press at the wall (nothing left, or nothing here to take) | Control `aria-disabled`; heap jiggle | A short cartoon boing | Recording: boing | 0.6 s | −16 dB |
| `pile.empty` | Remaining reaches 0 | *All scattered* chip | A rising three-note "ta-da", C5 E5 G5 | Synth bells | 360 ms | −12 dB |
| `statement.open` | A statement opens | The statement shown | A storybook page flip | Recording: page | 0.6 s | −10 dB |
| `scatter.confirm` | The scatter is saved (after the signature) | The done line, `scatter.done.*` | **J1 Scattered:** a xylophone arpeggio, a flute trill and a muted-trumpet button | Sting | 3.0 s | −10 dB |
| `statements.reveal` | Scattering opens, first visit | The reveal sheet; `reveal.announce` | **J2 Statements open:** a harp glissando and bells into a soft chord | Sting | 3.0 s | −10 dB |
| `scatter.closed` | Scattering closes with the scatter screen open | The screen at dusk, the circle asleep, the controls dimmed; the `scatter.closed` line | **J3 Dusk:** a slow descending celesta phrase | Sting | 3.0 s | −14 dB |
| `feast.open` | The feast begins, and each replay | The feast heap fills; lights `dusk` | **M4 The feast:** three seconds of build, then the full-ensemble burst | Feast cue | 9.6 s | −8 dB |
| `feast.feed` | Each critter's feeding beat | Its hops; its count rolling up | A critter nibbling, then a bell pitched by its share (pentatonic degree 1–10) | Recording: munch; synth bell | 1.4 s | −8 dB |
| `feast.settle` | The shared hop | Results heading focused; `feast.announce` | **M4r:** the fanfare lands and the feast cue fades under it; a chorus of critters cheers a moment later | Feast resolve; recording: cheer | 3.0 s | −8 dB |
| `error` | A blocking error (`role="alert"`) | The error notice | A soft, low "bwomp", never alarming | Synth thump | 200 ms | −16 dB |

The music loops are not tokens; §5.5 covers them.

Notes on the table:

- **Until a recording has loaded,** its cue plays a synth version: bells in the sting's place, a tick for the pop, a thump for the boing. A recording that fails to load is asked for again the next time its cue plays.
- **Levels are peaks, so they are not loudness.** The page flip and the nibble are mostly short clicks and need a high peak to be heard at all; `docs/research/audio-assets.md` gives each recording's loudness at its level.
- **A synth cue of several notes shares its level between them,** so it peaks under it.
- **A save refused because scattering has closed** plays the Dusk sting, not `error`: the screen closes exactly as it does when the deadline passes under it, and no error notice is shown.

Silent on purpose: closing a statement, navigation, hover, every deadline change except scattering closing under the open scatter screen, saving in progress, offline banners, the own critter's sleep, and the wake motion at the reveal (its sound is `statements.reveal`). Someone who arrives after scattering has closed hears no sting.

### 5.3 The hold: crossfade, and pitch as position

A hold must sound like an unbroken pour, never a machine gun.

1. The first three crumbs of a hold play `crumb.add` normally.
2. From the third crumb, `pour.hold` fades in over 150 ms while discrete bips stop. `pour.hold` is a grain scheduler: it places bell grains at the current crumb rate; above 12 grains/s the grains drop 6 dB and the sparkle bed rises under them, so the ear hears a pour rather than counting. The bed is a 1.7 s recording looped with a crossfade (G8), 10 dB under the grains; until it has loaded, a breath of noise takes its place.
3. On release, `pour.hold` fades out in 60 ms and one `crumb.add` plays at the current pitch — the sound "lands" where the count did.

**Pitch rises with that critter's total** so you can hear roughly where you are without looking. **G7** — the pitch is quantised to a major pentatonic (C D E G A) over two octaves from C4, one step per 5 % of the issued crumbs, capped at the tenth step (50 % of the pile and above). A critter at 12 crumbs of 100 sounds at step 2; at 30, step 6; the biggest scatter in a feast is always the highest voice. Minus steps down the same scale. Under reduced motion the pour is replaced by discrete soft bips capped at 8/s, still pitched.

A typed amount (§2.6) is a short run of up to four bells, 80 ms apart, stepping up to the pitch where the count lands, or down to it when crumbs are taken back.

### 5.4 Levels and mix

| | Level | Note |
|---|---|---|
| Effects and stings | −20 to −10 dB peak (§5.2) | Each recording lands at its level |
| Feast tokens | −8 dB peak each | The only loud thing in the app. Its sounds overlap, so a whole feast for eight peaks near −3 dB, where the limiter holds it |
| Music | −15 dB on files at −16 LUFS: about −31 LUFS | About 8 dB under the stings and the feast cue |
| Music under an open statement | A further −6 dB | On the phone, while the statement is open. The desktop panel always shows a statement, so there the music does not duck |
| Reduced motion / Still critters | Effects −6 dB | Damped, never disabled; only the user's toggle disables. The music is unchanged |
| Limiter | −3 dB, 20 : 1 | Ends the chain |

These levels were set from measurement (`docs/research/audio-assets.md`), not yet by ear on the burrow's phones. They are starting values, like every number here: F3 and F10 in §10 are where they are tuned.

### 5.5 Music

Music replaces the single quiet bed first specified here. Four loops, each a file at 128 kbps:

| Track | Plays on |
|---|---|
| **M1 The burrow** | The launcher, the first steps and home; a feast as someone outside the burrow sees it |
| **M2 The town square** | A burrow, creating one, feast setup, a draft, gathering; a cancelled or void feast |
| **M3 Feeding time** | Scattering: the reveal, reading, scattering, saving |
| *Quiet* | From scattering closing until the feast has played: dusk, the wait for the key, and the feast itself, whose cue is its music |
| **M5 Everyone is full** | After the feast: the results, who gave what, a public result |

- **Nothing before the first gesture.** No sound file is in the first load. The music starts with the first tap, as browsers require, if *Music* is on.
- **One track at a time.** A track is fetched and decoded when a screen first wants it, and let go when another takes over: a decoded track is about 30 MB. A screen that keeps the same track plays on without a break.
- **Fades.** In over 1.5 s, out over 1 s.
- **G8** — a track loops as overlapping passes of the same buffer with a 2 s equal-power crossfade, so the file need not be seam-perfect.
- **Stings come first.** A track about to start waits for a sting or the feast cue still sounding, and comes in as its last second dies away: Feeding time after the reveal's sting, Everyone is full after the fanfare (§4.2, *Readable*).
- **Under an open statement** it steps back 6 dB (§5.4).
- **While the tab is hidden** all sound stops; the music returns over 1 s.

### 5.6 Toggles and defaults

| Setting | Default | Persisted as | Effect |
|---|---|---|---|
| **Sounds** | on | `cc.sound.effects` = `"1"` | Every §5.2 token: effects, stings and the feast cue |
| **Music** | on | `cc.sound.music` = `"1"` | The loops of §5.5 |
| **Still critters** | off | `cc.motion.still` = `"0"` | §3.5 motion rules and the −6 dB damping |
| **Simple view** | off | `cc.view.simple` = `"0"` | Design System §11 |
| **Dark mode** | the device’s | `cc.view.dark` = `"1"` or `"0"`; unset while it follows the device | Design System D26 |

Persistence is per browser (`localStorage`), read before the first render so nothing plays or moves that the person turned off last time. The OS `prefers-reduced-motion` preference applies on top of these and cannot be overridden by them; *Still critters* exists so the choice is also visible in the app. The earlier `cc.sound.ambience` key is no longer read: its toggle never played anything.

The toggles live in Settings, which opens once someone has connected. Before that, on the launcher, the first steps and a visitor’s header, *Music* is a button at the top right (Design System D28). It shows music as on only once it can be heard: music is on by default, but nothing plays before the first press, so a first press on the button starts the music and leaves the setting on, and only a press while sound is playing switches it off.

### 5.7 Implementation notes for the Technical Spec

- One `AudioContext`, created and resumed on the first user gesture (iOS requires it inside the gesture handler). Nothing is created, fetched or scheduled before that. Which event counts as the gesture depends on the device, so the app listens for all four: a mouse press, a touch as the finger lifts (a touch landing does not count), a click, a key.
- The effects, stings and feast cue (0.46 MB) load after the first gesture. Each music loop (0.9 to 1.4 MB) loads when a screen first wants it. All are MP3, decoded with `decodeAudioData`.
- A small voice pool (16 voices) with lookahead scheduling of 20 ms against `AudioContext.currentTime`. The pour scheduler runs on a 25 ms timer and the music's loop scheduler on a 1 s timer, never on `requestAnimationFrame`, so a dropped frame never stutters the sound. One recording plays at most four deep, because a large feast feeds faster than a nibble lasts.
- A browser's compressor node starts shut: its detector begins at zero, so it ducks the first few hundred milliseconds of the first sound it is ever given. The mix therefore opens itself with 150 ms of inaudible signal when it is made.
- The compressor node also adds make-up gain of its own. The limiter's is undone by a trim after it, so a sound under the threshold leaves at the level it came in.
- Leaving a screen stops its effects; a recording still ringing fades over 250 ms and is never cut dead. The music carries on across screens. Two exceptions: a recording stopped before it has begun never sounds at all (a result that opens already skipped), and when the tab is hidden everything ends at once, because a suspended context would keep a fade and play it on return.
- Three layers of test. The plans, the engine's choices and the music player run headless against a recording stand-in for the Web Audio nodes. Every cue, in its synth version and with its recordings, the pour and a whole feast render in the browser's own `OfflineAudioContext` and are asserted against §5.2's lengths and levels (`tests/e2e/audio.spec.ts`). Which recording plays when is followed through one member's feast (`tests/e2e/sound.spec.ts`). The browser's rule about which gesture may start sound cannot be tested this way: a browser under automation starts audio with no gesture at all, so that part is a check for real phones.
- No audio library.

## 6. Performance budget for the 3D scene

The floor is a mid-range phone, and the app must be pleasant there, not merely functional.

| Budget | Value | Notes |
|---|---|---|
| Device floor | A 2021–2022 mid-range Android (Snapdragon 6-series class) and iPhone 11 | Tested on real devices in the rehearsal, not emulators |
| Frame rate | 60 fps on desktop; ≥ 30 fps floor on the device floor with 10 critters and a pour running | Measured during a pour, not at idle |
| Frame time at idle | ≤ 8 ms GPU on the device floor | Idle motion is small enough to render on demand |
| Triangles | ≤ 3,000 per critter; ≤ 30,000 in the scene | Design System §5.3; 10 critters |
| Draw calls | ≤ 4 per critter after merging parts per material (base, accent, eyes, blob); ≤ 40 in the scene, plus one for the crumb instances | Merge at generation time |
| Lights | 3: hemisphere, directional, ambient; no shadow maps | Design System §4.2; blob sprites for shadows |
| Post-processing | None | No bloom, no SSAO, no outline pass |
| Textures | One 128 × 128 radial blob | No other textures anywhere |
| Pixel ratio | Capped at 2 on desktop, 1.5 on the device floor; antialias on | Set once from `devicePixelRatio` and a coarse device class |
| Crumb particles | Instanced; ≤ 64 alive; a 380 ms flight at 40/s leaves ~16 in the air | One `InstancedMesh` |
| DOM animation | ≤ 60 animated nodes at once (hops); the feast staggers hops so this holds for 10 critters | Hops are transform-only and `will-change: transform` |
| Render loop | Continuous while critters are visible and awake; on demand (invalidate) when every visible critter is asleep or Still critters is on; paused when the tab is hidden or the grid is scrolled fully out of view | R3F `frameloop` switched at runtime |
| 3D chunk | ≤ 250 KB gzipped (three + R3F + the drei pieces actually imported), lazy-loaded behind the portraits | Design System D6; never loaded on the arrival or read screens |
| Time to 3D | ≤ 3 s on a 4G connection from the grid appearing, portraits visible the whole time | The crossfade hides the wait |
| GPU memory | ≤ 60 MB | Geometry is tiny; this is headroom for the browser |

**Degradation ladder** (automatic, per session, announced once as `fallback.midSession` only at the last step):

1. Sustained frame time > 33 ms for 2 s → pixel ratio to 1.0 and idle motion off.
2. Still > 50 ms for a further 3 s → antialias off, crumb stream capped at 8 instances.
3. Still > 50 ms for a further 5 s, or a lost context that is not restored in 2 s → Simple view for the session (Design System §11).

## 7. Simulation model: Koota

The critter simulation is an entity–component–system core built on **Koota** (pmndrs), the React Three Fiber organisation's ECS-based real-time state library. **G10** — chosen over an in-house world because it gives queries, change tracking, relations and React bindings for a few kilobytes, from the same maintainers as the renderer. Under the minimal-dependency rule it is justified as the one piece of state infrastructure the real-time layer needs; the Technical Spec records its measured size in the dependency table.

The shape, in one sentence: state that changes per frame or per crumb lives in a Koota world outside React; systems are plain functions run in a fixed order by one ticker with injected time; the 3D scene and the Simple view are two renderers reading the same traits; the DOM subscribes through `koota/react` hooks and reaches the world only through actions.

### 7.1 What lives in the world, and what does not

| In the world (a trait) | Not in the world (ordinary app state; Technical Spec) |
|---|---|
| Anything that changes per frame or per crumb: rig channels, counts while scattering, the pile, pours, flying crumbs, the feast run, sound events | Anything that changes per network round trip: burrow, members, feast metadata, statements, ballots, the trusted clock's phase |
| The tally *result* as `Received` traits, set once when the feast is computed | The tally itself — a pure function over decrypted ballots |
| A read-only mirror of `Phase` and `Settings` so systems can branch | The source of truth for both |

### 7.2 Entities and traits

Schema traits are Koota's structure-of-arrays kind; callback traits hold objects. Names are the ones the code must use.

| Entity | Traits | Notes |
|---|---|---|
| **Critter** (one per critter in the feast) | `Identity` (address, variant, seed, generated parameters), `Name` `{ display }`, `Owner` `{ address }` (absent for an option), `IsOwn` (tag), `Asleep` (tag), `Count` `{ given }`, `Received` `{ crumbs, share, fed, mood }`, `Rig` (§3 channels: `scaleX/Y/Z, leanZ, postureX, headTilt, earL, earR, lids, mouth, cheeks, pupilX, pupilY`), `Bump` `{ t }` (transient), `Chewing` `{ rate }` (while pouring), `Mesh` (callback trait holding the Three.js `Group`; present only while the 3D module is active), `Portrait` (callback trait holding the SVG element; present while the 2D renderer is active) | `Rig` holds the *current* pose; targets are computed each tick by the expression system, never stored |
| **Heap** (one; the viewer's pile) | `Pile` `{ issued, remaining }`, `Pouring` `{ direction, startedAt, acc }` (transient, while a pour runs) + relation `PouringInto(critter)` (`exclusive: true`) | The heap is an entity rather than a world trait so the DOM can subscribe with `useTrait(heap, Pile)` |
| **Crumb** (3D flight only) | `Flight` `{ t, x, y, z }` + relation `FlyingTo(critter)` (`autoDestroy: 'source'`) | Never more than 64 alive (§6); the instanced mesh reads these |
| **FeastRun** (one, while the feast plays) | `Feast` `{ beat, startedAt, index, skipped }` | The director's only state |
| **Event** (transient) | `SoundEvent` `{ token, pitchStep, level }` or `Hop` `{ from, to, reverse }` | Spawned by systems, consumed and destroyed by the sound system or the DOM subscriber in the same tick; a sweep at the end of the tick destroys any that were not consumed |
| **World traits** (singletons) | `Clock` `{ now, dt }`, `Phase` `{ name, gatheringEndsAt, scatteringEndsAt }`, `Settings` `{ effects, music, still, simple, reducedMotion }`, `Viewer` `{ address }` | Written by the ticker and by the app; read by systems. The Technical Spec verifies whether `useTrait` accepts the world for these; if not, they move to a dedicated `App` entity |

### 7.3 Systems, in tick order

Koota has no scheduler; the order below is a plain array run by one `tick(now)` function. Systems never read `performance.now()` or `Date.now()` — only `Clock`. That single rule is what makes every test in §7.5 possible.

| # | System | Reads | Writes | Does |
|---|---|---|---|---|
| 1 | `clock` | the `now` passed to `tick` | `Clock` | Sets `now`, `dt` (clamped to 50 ms) |
| 2 | `input` | the action queue | `Count`, `Pile`, `Pouring`, `Bump`, events | Turns presses into a crumb given on press (§2.1), starts and stops pours, commits typed amounts (§2.6) |
| 3 | `pour` | `Pouring`, `Clock`, `Pile`, `Count` | `Count`, `Pile`, `Chewing`, events | The curve of §2.1 with the fractional accumulator; stops at the wall; emits `crumb.add` / `pour.hold` events and `Hop`s |
| 4 | `pile` | `Pile` | events | Emits `pile.empty` once when remaining reaches 0; `pile.wall` on a press at the wall |
| 5 | `feast` | `Feast`, `Clock`, `Received`, `Settings` | `Asleep`, `Feast`, events, `Hop`s | The director of §4.2: advances beats by the clock; wakes; feeds in grid order; the settle; skip and reduced-motion paths |
| 6 | `expression` | `Received`, `Chewing`, `Bump`, `Asleep`, `Clock` | rig targets (local) | The mapping of §3.4 plus chew and bump modulation; produces a target pose per critter for this tick |
| 7 | `rig` | targets, `Rig`, `Identity.idlePhase`, `Settings` | `Rig` | Integrates the pose: idle breath, wobble and blink (§3.1), the bump curve (§3.2), the wake spring (§3.3), growth overshoot; under `still` or `reducedMotion`, crossfades only (§3.5) |
| 8 | `flight` | `Flight`, `Clock` | `Flight` | Moves crumbs along their 380 ms arcs; destroys them on arrival and emits the `Bump` |
| 9 | `sound` | `SoundEvent`s, `Settings`, `Pile`, `Count` | the audio graph | Schedules the voices of §5 with 20 ms lookahead; owns the pour crossfade state; destroys consumed events; when effects are off it still consumes and destroys |
| 10 | `render3d` (only while the 3D module is active) | `Rig`, `Mesh`, `Flight` | Three.js transforms | Writes `Rig` into each `Group` and the crumb instances; spawns and disposes meshes from `world.onAdd(Identity)` / `onRemove` |
| 11 | `render2d` | `Rig`, `Portrait` | CSS custom properties on the portrait SVG | The Simple view, and the stage before 3D is ready; reads the same `Rig` |
| 12 | `sweep` | events | — | Destroys any unconsumed `SoundEvent` or `Hop` |

The DOM never runs inside the tick. It subscribes: `useQuery(Identity)` for the grid, `useTrait(critter, Count)` for a count, `useTrait(heap, Pile)` for the bar, `world.onAdd(Hop, …)` in an effect to play the DOM hop. It reaches the world only through actions from `createActions`: `giveCrumb(critter)`, `takeCrumb(critter)`, `startPour(critter, direction)`, `stopPour()`, `setCount(critter, n)`, `beginFeast(results)`, `skipFeast()`, `replayFeast()`, `setSettings(patch)`.

### 7.4 The ticker

One loop, three hosts, one function:

| Host | How `tick(now)` is called |
|---|---|
| 3D active | From R3F's `useFrame` with the frame's timestamp, before the render3d system writes transforms |
| Simple view, or 3D not yet loaded | A `requestAnimationFrame` loop owned by the 2D renderer |
| Tests | Directly, with synthetic timestamps: `for (t = 0; t <= 8000; t += 16) tick(t)` |

The loop runs continuously while any visible critter is awake and not still, on demand otherwise, and not at all while the tab is hidden (§6). Handing the loop from the 2D renderer to R3F when the 3D module arrives is one function reference changing; the world does not notice.

### 7.5 Determinism and tests

Given the same actions and the same sequence of `now` values, the world after N ticks is identical on every platform: the systems are pure over traits, the generator is seeded, and no system reads a wall clock. The Technical Spec turns these into headless tests with no DOM and no WebGL:

- A held press empties 100 crumbs in 3.3–3.5 s of synthetic time and stops within one crumb of a release.
- The wall stops a pour and emits exactly one `pile.wall` per press.
- The feast for eight critters reaches *Readable* between 6.0 and 6.6 s; with `reducedMotion`, in one crossfade; *skip* reaches it within 200 ms.
- A scripted session emits the expected sequence of `SoundEvent` tokens and pitch steps (§5.3), and never emits one while effects are on and no visual state changed.
- Growth and mood for a given tally match §3.4's worked values exactly.

## 8. Motion outside the canvas

The DOM's durations are the Design System's motion tokens (§3.6). The three that matter to feel:

| Moment | Token | Detail |
|---|---|---|
| The hop | `--cc-dur-2` (200 ms), `--cc-ease-hop` | Quadratic arc from the heap to the count, apex 70 px above the higher endpoint; the glyph rotates 200° in flight and fades in the last 20 % |
| A statement expanding | `--cc-dur-3` (320 ms), `--cc-ease-in-out` | Height animates from the one-line summary; the chevron rotates 180° |
| The done line after *Scatter these* | `--cc-dur-4` (600 ms) | The pile bar's controls crossfade out and the line fades in; nothing slides, nothing pops |

Buttons press down 1 px (`translateY`), never scale. Hover states exist only for pointer devices. Nothing in the DOM animates on load except the two designed moments.

## 9. Haptics

**G9** — no haptics in v0. `navigator.vibrate` is Android-only and coarse; a vibration on every crumb would be a machine gun in the hand, and a vibration on the pile emptying alone is not worth the platform inconsistency. Revisit with embedded wallets in v1 if the app gets a native wrapper.

## 10. Feel checklist for the rehearsal

Run on the real deployment with the real people, on their own phones. Each line is pass/fail.

| # | Check |
|---|---|
| F1 | A tap replies on the same frame: the count changes and the critter bumps before the finger lifts |
| F2 | A 100-crumb pour from a standing start empties in 3–4 s and can be stopped within ± 2 crumbs of where you meant |
| F3 | The pour sounds like a pour, not a machine gun, on iOS Safari and Android Chrome |
| F4 | Minus feels as good as plus: no delay, no extra step, no different character |
| F5 | The heap is legible as a progress bar from arm's length; empty is unmistakable |
| F6 | Idle critters look alive on video and still in a screenshot |
| F7 | No critter ever looks sad at the results |
| F8 | The feast plays under 8 s for the council's feast, the numbers are readable at the settle, and *Skip to results* works from the first frame |
| F9 | With *Still critters* on, nothing moves except crossfades, and the feast is a single crossfade |
| F10 | With *Sounds* off, nothing is confusing; with *Music* on, it sits under the screen without pulling focus, and anyone who wants it off finds the toggle |
| F11 | 30 fps or better on the slowest phone in the burrow with a pour running |
| F12 | Nobody notices the moment 3D replaced the portraits |

## 11. Decisions and open questions

### Decisions made here

| # | Decision | Why |
|---|---|---|
| G1 | Pour rates scale with the number of crumbs issued, `clamp(issued / 100, 0.5, 5)` | A pile always takes about the same time to empty; 10 and 1,000 both stay usable |
| G2 | The tap's crumb is given on press, not release | Immediate reply; a hold continues from a crumb already given |
| G3 | The feast feeds in grid order with a shared wake and a shared finale, never by rank | The animation is not a leaderboard; the table carries the ranking |
| G4 | Expression never goes below calm; any crumb received means at least content | Recognition is never humiliation |
| G5 | A small mouth arc is added to the critter (Design System §5.3 addition, ≤ 40 triangles) | Eyes and ears alone cannot read as pleased at grid size |
| G6 | The feast's crumbs are DOM hops from a large feast heap, not canvas particles | One sequence for 3D and Simple view; the canvas budget is untouched |
| G7 | Pour pitch is quantised to a major pentatonic, one step per 5 % of the issue, capped at 50 % | Pours sound musical rather than like a siren; the highest voice is the biggest scatter |
| G8 | A loop (the music, and the sparkle bed under a pour) plays as overlapping passes of one buffer with an equal-power crossfade: 2 s, or a quarter of a short loop | The file need not be seam-perfect; no clicks at the loop point |
| G9 | No haptics in v0 | Android-only and coarse; not worth the inconsistency |
| G10 | The simulation core is an ECS built on Koota (pmndrs), with the 3D scene and the Simple view as two renderers over the same traits and a ticker with injected time (§7) | Queries, change tracking, relations and React bindings from the renderer's own maintainers for a few kilobytes; deterministic, headless-testable feel; one simulation for both views |

### Open — confirm before implementation

| # | Question |
|---|---|
| GQ1 | Answered 8 October 2026: the single ambient bed is replaced by music, generated from a written brief (§5.5, `docs/decisions.md`). |
| GQ2 | Whether an options feast should feed by rank rather than grid order. G3 says no for both feast types; a budget split might want the "winner" last. |
| GQ3 | The device floor (§6). If any council member's phone is older than the floor, the rehearsal should include it and the ladder must be tested there. |

## 12. Review prompt for Game Studio

The brief asks for this document to pass through Game Studio in ChatGPT. Paste the following, then attach or paste §1–§6 of this document. Bring the answer back as a table and it can be folded into a revision.

> You are reviewing the game-feel specification for Critter Crumbs, a small 3D web tool a group of adults uses twice a year to decide how money is shared: everyone gets the same handful of crumbs and feeds them to critters (people or budget options); it stays private until a "feast" reveals every allocation at once. It must feel charming, not childish; quiet, with one big moment; and it must never make a person's critter look sad. The visual palette is fixed to six words: warm, soft, matte, wooden, organic, quiet; the sound is bright, bouncy and melodic, like a cosy console game. No confetti, no leaderboards, no reward loops.
>
> Review the attached specification and answer only with a table of proposed changes: section, current value, proposed value, one-line reason. Focus on (1) the tap-and-hold pour curve numbers, (2) the squash-and-stretch and expression mapping, (3) the feast sequence pacing and order, (4) the sound token table and the pour crossfade, and (5) anything that would make the feast satisfying that the spec is missing. Respect the six words, the sound direction and the "no sad critters" rule; do not propose new features, scoring, or progression.

## 13. What the Technical Spec owns from here

The Koota world module (§7): traits, the system array and `tick`, the actions, and the two renderers, with Koota recorded in the dependency table with its measured size; constants in one module (`feel.ts`) exactly as named in §2–§4, imported by the systems and the sound tokens; the `OfflineAudioContext` tests for §5.2; the degradation ladder (§6) and the render-loop switching; the mouth primitive added to the generator with a `GEN_VERSION` bump before the rehearsal (G5); the headless tests of §7.5 (the injected clock makes the feast testable at any speed); and the rehearsal checklist (§10) as an acceptance list in the build order.
