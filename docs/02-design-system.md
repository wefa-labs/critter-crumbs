# Critter Crumbs — Design System

**Document 2 of 4** · Status: draft for review · 2026-09-01
Upstream: `01-prd.md` (vocabulary §3, rules §5, flows §7). Downstream: `03-game-design.md`, `04-technical-spec.md`.

**How to read this document.** Written for coding agents, with a human reviewing.

- Token values are normative. Change a token, not a component.
- **Decision (D#)** marks a design decision made here that the brief left open. Implement as written unless overruled; collected in §14.
- **Open (DQ#)** marks something the reviewer must confirm; collected in §14.
- Numbers for motion curves, growth, and every sound token belong to the Game Design document. Rendering architecture, bundle splitting, and the canvas–DOM sync mechanism belong to the Technical Spec; this document states the contract they must satisfy.
- All UI copy in this document is canonical (§10). Add strings there, never inline in components.

---

## 1. Direction

**The world.** A burrow: warm earth, sunlight coming in from the entrance, small soft creatures, bread crumbs. Everything visual and audible should be describable with the same six words (§2). This is a tool adults use to move real money, so the charm is in materials and motion, never in cuteness of copy or cartoon UI.

**Palette.** Six named colours carry the identity: **Oat** ground, **Burrow** ink, **Honey** crumbs, **Moss** for done and alive, **Clay** only for errors, **Dusk** only for sleep. Honey is reserved for crumbs, except the gold primary action adopted on 2026-10-06 (D14). The primary action uses ink text and an ink outline.

**Type.** The device’s system sans throughout, with bold headings and one 12, 14, 16, 20 and 28 px scale (D14). No font download.

**Layout.** Mobile-first, one column of content with a grid of critters standing on a shared ground; the pile of crumbs sits under the thumb. Desktop widens the grid and moves the pile to a side rail. Nothing is a shrunken desktop app.

**Signature.** The pile is not a progress bar. It is a **heap** — an actual mound of crumb glyphs in the sticky bar that visibly dwindles as you scatter, with a crumb hopping from the heap to the critter on every tap. It is drawn in SVG in the DOM, so it costs nothing, works in the 2D fallback, and is the one thing people remember.

**Deliberately avoided.** The default "warm cream page, high-contrast serif, terracotta accent" look. Our ground is sand-coloured with a directional light, the display face is low-contrast and soft, terracotta appears only on errors, and the working accents are honey and moss. If a screen starts to look like a generic warm landing page, the honey is being used for something that is not a crumb.

## 2. Shared palette words — materials, light, and sound

The Game Design document must use exactly these words when describing sound. They are the contract that makes the 3D layer and the audio feel like one world.

| Word | In materials and light | In sound |
|---|---|---|
| **Warm** | Oat, honey, and clay hues; key light at ~3200 K (`#FFE2B8`); no cool tints except Dusk for sleep | Low-mids emphasised; nothing bright above ~6 kHz; no metallic partials |
| **Soft** | Roughness ≥ 0.9 on every body surface; only the eyes carry a catchlight; blob shadows, no hard-edged shadows | Attacks of 5–20 ms, no clicks; rounded envelopes; nothing digital |
| **Matte** | No environment reflections, no bloom, no post-processing; key-to-fill ratio around 3:1 | Dry — a short, small room; no shimmer reverb, no long tails |
| **Wooden** | Ground and props in Burrow and Bark tones; every radius rounded, nothing sharp | Marimba and woodblock-like tones; plucked strings; soft thumps |
| **Organic** | Hash-driven asymmetry in every critter; a slow idle wobble; nothing perfectly still or perfectly regular | Micro-variation on every trigger (the Game Design document sets the amounts: ± 25 cents on ticks, ± 10 cents on plucks, ± 8 % gain, ± 10 ms timing); no two crumbs identical |
| **Quiet** | Small motion amplitudes; nothing blinks; the feast is the only big movement | Everything except the feast under 200 ms and low in the mix; restraint is what makes the feast land |

## 3. Tokens

Tokens are CSS custom properties on `:root`, prefixed `--cc-`. The same values are mirrored in a `tokens.ts` module for the canvas layer (§4) and the 2D critter renderer (§5.7); one source, generated in the build (mechanism: Technical Spec). Single light theme in v0 (**D1**, §14).

### 3.1 Colour

All values are sRGB hex. Contrast ratios are against Oat unless stated; see §12.2 for the full matrix.

| Token | Value | Use | Contrast on Oat |
|---|---|---|---|
| `--cc-oat` | `#F1E7D6` | Page ground. The DOM background behind the transparent canvas | — |
| `--cc-surface` | `#FBF6EC` | Cards, sheets, statement panels | — |
| `--cc-sunken` | `#E6D9C3` | Recessed areas: the pile bar, number fields, table header | — |
| `--cc-burrow` | `#2A211A` | Primary text; primary button fill; focus ring | 12.9 : 1 |
| `--cc-soil` | `#5A4B3C` | Secondary text; labels | 6.8 : 1 |
| `--cc-bark` | `#6F6055` | Tertiary text: captions, counters, timestamps. Never on `--cc-sunken` (4.3 : 1 there) | 4.9 : 1 |
| `--cc-line` | `#D6C7AD` | Hairlines and dividers (decorative only) | 1.4 : 1 |
| `--cc-line-strong` | `#857463` | Input borders, switch tracks, anything whose edge carries meaning | 3.7 : 1 |
| `--cc-honey` | `#D89A2E` | Crumbs, the heap, crumb glyphs. Decorative fill only; never text, never a button | 2.0 : 1 |
| `--cc-crust` | `#A86B14` | Crumb outlines; the heap's stroke; any honey element whose edge must read | 3.6 : 1 (non-text) |
| `--cc-honey-tint` | `#F5E6C4` | Highlight background behind a crumb count while pouring | — |
| `--cc-moss` | `#6B7F4A` | "Scattered" and "alive" fills; switch on-state | 3.6 : 1 (non-text) |
| `--cc-moss-ink` | `#43552B` | Text on `--cc-moss-tint`; success text on Oat | 6.7 : 1 |
| `--cc-moss-tint` | `#DDE5CC` | Success chip background | — |
| `--cc-clay` | `#C2563C` | Error fills and icons | 3.9 : 1 (non-text) |
| `--cc-clay-ink` | `#973A26` | Error text | 5.8 : 1 |
| `--cc-clay-tint` | `#F3D9D0` | Error banner background | — |
| `--cc-dusk` | `#7C7A94` | Asleep badge, the "z" glyphs, dusk lighting tint. Decorative | — |
| `--cc-focus` | `var(--cc-burrow)` | Focus ring colour (§12.5) | 12.9 : 1 |

Semantic aliases (components use these, not the raw names):

| Alias | Value |
|---|---|
| `--cc-text` / `--cc-text-2` / `--cc-text-3` | burrow / soil / bark |
| `--cc-bg` / `--cc-bg-raised` / `--cc-bg-sunken` | oat / surface / sunken |
| `--cc-action` / `--cc-action-text` | burrow / oat |
| `--cc-ok` / `--cc-ok-text` / `--cc-ok-bg` | moss / moss-ink / moss-tint |
| `--cc-error` / `--cc-error-text` / `--cc-error-bg` | clay / clay-ink / clay-tint |
| `--cc-crumb` / `--cc-crumb-edge` | honey / crust |

Rules:

- Text is always Burrow, Soil, Bark, Moss-ink, or Clay-ink. Nothing else is ever text.
- Honey and Crust appear only on crumbs and the heap (**D5**). The "crumb" is the only thing in the app that is gold.
- `@media (prefers-contrast: more)`: `--cc-line` → `--cc-line-strong`, `--cc-bark` → `--cc-soil`, and the heap's stroke width doubles.
- `color-scheme: light` is declared on `:root` so native controls and scrollbars match (**D1**).

### 3.2 Type

| Role | Family | Weight | Where |
|---|---|---|---|
| Display | `"Young Serif", "Iowan Old Style", "Palatino", Georgia, serif` | 400 (the face has one weight) | Burrow name, feast title, section titles, critter names in the grid, the big numbers at the feast |
| Body / UI | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` | 400 / 600 | Everything else, including statements |
| Data | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | 400 | Addresses, attestation UIDs, the CSV preview |

**D2** — one self-hosted font file (Young Serif, Latin subset, WOFF2, ~30 KB), `font-display: swap`, with `font-size-adjust: from-font` on display elements so the serif fallback occupies the same space while it loads (no layout shift). The body face is the device's own: zero payload, best hinting on every phone, and it keeps the chrome quiet under the display face. Young Serif is chosen for its soft, carved, low-contrast letterforms — the "wooden" word made into type. It is swappable through one token (`--cc-font-display`); confirm the choice, **DQ1**.

Scale (rem; base 16 px; `cqi` is the content container's inline size):

| Token | Size | Line height | Use |
|---|---|---|---|
| `--cc-text-xs` | 0.75rem (12) | 1.4 | Counters, timestamps, table captions |
| `--cc-text-sm` | 0.875rem (14) | 1.45 | Secondary UI, helper text, chips |
| `--cc-text-md` | 1rem (16) | 1.5 | Default UI, form controls, buttons |
| `--cc-text-lg` | 1.125rem (18) | 1.6 | Statement text in the read pass |
| `--cc-text-xl` | 1.375rem (22) | 1.2 | Section titles (display face) |
| `--cc-text-2xl` | `clamp(1.75rem, 5cqi, 2.5rem)` | 1.1 | Feast and burrow titles (display) |
| `--cc-text-3xl` | `clamp(2.5rem, 9cqi, 4rem)` | 1.0 | The big number at the feast (display) |

Rules:

- Statement measure: `max-inline-size: 62ch` at `--cc-text-lg`. Headings use `text-wrap: balance`; statement paragraphs use `text-wrap: pretty` (progressive enhancement).
- Every count, total, and share uses `font-variant-numeric: tabular-nums` so numbers don't jitter while pouring.
- Never all-caps for emphasis, never justified text, never text below 12 px.
- Fluid sizes stay within 2.5× of their minimum (zoom safety).

### 3.3 Spacing

`--cc-space-1` … `--cc-space-10` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px (declared in rem). Component internals use 1–4; layout gaps use 4–7; section rhythm uses 7–10.

### 3.4 Radius

| Token | Value | Use |
|---|---|---|
| `--cc-radius-sm` | 8 px | Inputs, chips, table cells' selection |
| `--cc-radius-md` | 14 px | Buttons, cards |
| `--cc-radius-lg` | 22 px | Sheets, the pile bar's top corners, statement cards |
| `--cc-radius-pill` | 999 px | Toggles, count badges, the participation line's chips |

Nothing in the DOM has a square corner. This is the "wooden" word again: everything is worn smooth.

### 3.5 Elevation and borders

Shadows are tinted with Burrow, never black.

| Token | Value | Use |
|---|---|---|
| `--cc-shadow-1` | `0 1px 2px rgb(42 33 26 / .10), 0 2px 6px rgb(42 33 26 / .06)` | Cards at rest |
| `--cc-shadow-2` | `0 6px 16px rgb(42 33 26 / .14)` | Raised: an expanded statement, a hovered card on desktop |
| `--cc-shadow-3` | `0 16px 40px rgb(42 33 26 / .22)` | Sheets and dialogs |
| `--cc-shadow-up` | `0 -4px 16px rgb(42 33 26 / .10)` | The sticky pile bar |
| `--cc-border` | `1px solid var(--cc-line)` | Decorative separation |
| `--cc-border-strong` | `1.5px solid var(--cc-line-strong)` | Inputs, anything that must meet 3 : 1 |

The DOM ground carries one light: a soft radial glow at the top-left of the page (`--cc-ground-glow: radial-gradient(120% 60% at 15% -10%, #FBF4E6 0%, transparent 60%)`) over Oat. The 3D key light comes from the same direction (§4.2), and DOM shadows fall bottom-right. One light source for the whole page.

### 3.6 Motion tokens (DOM)

| Token | Value | Use |
|---|---|---|
| `--cc-dur-1` | 120 ms | State changes: hover, press, chip swap |
| `--cc-dur-2` | 200 ms | Enter/exit of small elements; the crumb's hop from heap to critter |
| `--cc-dur-3` | 320 ms | Layout changes: a statement expanding in place |
| `--cc-dur-4` | 600 ms | Designed moments in the DOM: the statement reveal stagger |
| `--cc-ease-out` | `cubic-bezier(.2, .8, .2, 1)` | Default for anything arriving |
| `--cc-ease-in-out` | `cubic-bezier(.6, 0, .2, 1)` | Layout changes |
| `--cc-ease-hop` | `cubic-bezier(.3, 1.4, .5, 1)` | The crumb's hop only |

Under `prefers-reduced-motion: reduce` and the **Still critters** setting (§12.7): every duration above becomes 0 ms except opacity crossfades, which cap at `--cc-dur-1`. The specific critter wake and growth transitions in Game Design §3.5 use 200 ms and 320 ms opacity crossfades in both SVG and 3D. Those exceptions preserve the frozen feel constants; they introduce no spatial motion. Other DOM opacity transitions retain the 120 ms cap.

### 3.7 Layers

| Token | z-index | What |
|---|---|---|
| `--cc-z-canvas` | 0 | The WebGL canvas (fixed, full viewport, `pointer-events: none`) |
| `--cc-z-content` | 1 | All page content |
| `--cc-z-sticky` | 10 | The pile bar, the top bar |
| `--cc-z-sheet` | 20 | Non-modal sheets (settings on desktop) |
| top layer | — | Native `<dialog>` and popovers; never z-indexed by hand |

### 3.8 Iconography

No icon library (**D4**). One inline SVG sprite, 24 × 24 viewBox, 1.75 px stroke, round caps and joins, Burrow by default. The full set for v0:

`crumb`, `plus`, `minus`, `clock`, `link`, `copy`, `check`, `warning`, `sound-on`, `sound-off`, `ambience` (a leaf), `still` (a pause bar), `simple-view` (a flat critter outline), `replay`, `download`, `chevron-left`, `chevron-right`, `chevron-down`, `external`, `sleep` (a small "z"), `chain` (for the on-chain record), `leave`.

Every icon-only button has a visible tooltip on desktop hover and an accessible name (§12.6). Decorative icons are `aria-hidden="true"`.

**The crumb glyph** (`crumb`) is the app's one piece of iconography with character: an irregular six-sided lump, Honey fill, Crust 1 px edge, a lighter fleck at the top-left (the page's light). It appears at 12 px beside counts, at 16 px in buttons, and at 14–20 px in the heap (§7.4) with randomised rotation per instance.

## 4. The 3D layer palette

Only critters live in the canvas. The canvas is transparent (`alpha: true`), fixed to the viewport, behind all DOM content, so the DOM's Oat ground and light glow are the scene's background in both 3D and 2D.

### 4.1 Materials

| Element | Material | Roughness | Metalness | Colour |
|---|---|---|---|---|
| Body, head, ears, limbs, tail | `MeshStandardMaterial` | 0.92 | 0 | Critter base colour (§5.4) |
| Belly patch, ear inner, cheeks | same | 0.92 | 0 | Critter accent colour (§5.4) |
| Eye white | same | 0.55 | 0 | `#FBF6EC` (Surface) |
| Pupil | same | 0.35 | 0 | `#2A211A` (Burrow) — the only glossy point on a critter, so it reads as alive |
| Crumb (flying, and in the mouth) | same | 0.8 | 0 | Honey `#D89A2E` with vertex-colour variation ±6 % lightness |
| Ground blob shadow | Sprite, radial gradient | — | — | Burrow at 0.22 → 0 alpha; scales with the critter's footprint |

No environment maps, no bloom, no SSAO, no post-processing of any kind (performance budget: Game Design). `dithering: true` on body materials to avoid banding on the soft gradients. Colour management on; colours are authored in sRGB and converted by Three.js.

### 4.2 Lighting presets

Three presets, three lights each. The Game Design document sequences transitions between them (dusk → feast is a beat of the feast).

| Preset | Hemisphere (sky / ground / intensity) | Directional (colour / intensity / position) | Ambient (colour / intensity) | When |
|---|---|---|---|---|
| `day` | `#FFF4E3` / `#C7A67C` / 0.9 | `#FFE2B8` / 1.5 / `[3, 6, 4]` | `#F1E7D6` / 0.2 | Scattering, results, the burrow home |
| `dusk` | `#E9E2F0` / `#8C7C90` / 0.6 | `#C8BFE0` / 0.7 / `[-2, 5, 3]` | `#D9D2E3` / 0.25 | Arrival (critters asleep), gathering, waiting for the feast |
| `feast` | `#FFF1D6` / `#D9A860` / 1.1 | `#FFD590` / 2.0 / `[2, 7, 3]` | `#F1E7D6` / 0.25 | The feast sequence, then easing back to `day` |

The directional light is the page's one light (§3.5): it comes from the upper left, matching the DOM glow. No shadow maps on any device — blob sprites only. Tone mapping `ACESFilmic`, exposure 1.0, sRGB output.

### 4.3 Camera and staging

Each critter is staged in its own DOM stage rect (§6.3). Camera per stage: perspective, 28° vertical FOV, positioned so a scale-1.0 critter fills ~70 % of the stage height with its feet at the lower third. The critter faces the camera with a 12° turn to its left so the ear silhouette reads. The Technical Spec chooses the mechanism that renders one canvas into many DOM-tracked rects (drei `View` is the candidate, **D7**); this document only fixes the framing.

### 4.4 Critter colour space

Critter colours are drawn in OKLCH so every hue sits at the same perceptual weight against Oat:

| Channel | Range | Note |
|---|---|---|
| Lightness (L) | 0.58 – 0.76 | Never lighter, or the critter melts into Oat; never darker, or it reads as a silhouette |
| Chroma (C) | 0.06 – 0.13 | Muted: felt and clay, not plastic |
| Hue (H) | 0 – 360 | Uniform; every hue is allowed, the L/C box keeps them in the same world |
| Accent | H + 15° … + 45°, L + 0.12 | Belly, ear inner, cheeks |

Converted to sRGB at generation time; clipped in-gamut by reducing C.

### 4.5 Crumbs in 3D

A crumb is a low-poly irregular lump (a 6–8 face polyhedron, ≤ 20 triangles), Honey with vertex jitter. Crumbs exist in the canvas only while flying (tap: one crumb hops from the critter's stage edge to its mouth; hold: a stream), and briefly at the mouth. They are instanced (one geometry, one material). The count is never conveyed by crumbs on screen — the DOM number is the count; crumbs are the feeling.

## 5. Critter generation

### 5.1 Inputs and determinism

```
seed      = cyrb53( lowercase(address) + ":" + variant + ":" + GEN_VERSION )
rng       = mulberry32(seed)           // 32-bit integer maths only; identical on every platform
params    = draw(rng)                  // fixed draw order below
```

- `address` — the owner's address for a person; the derived identifier for an option (Technical Spec).
- `variant` — 0 by default; incremented by re-rolls, up to 4 (PRD F2); stored per address (PRD P10).
- `GEN_VERSION` — `"1"`. Any change to the draw order, ranges, or composition rules that alters output for an existing seed requires a new version and a migration decision; the generator is frozen before the September rehearsal (**D8**).
- No dependencies: cyrb53 and mulberry32 are ~15 lines each, public-domain, and shared by the 3D and 2D renderers so a critter is the same critter everywhere.

### 5.2 Parameter space

Drawn in this order. "choice" draws use the listed weights; "uniform" draws are linear in the range.

| # | Parameter | Draw | Range / options (weights) | Affects |
|---|---|---|---|---|
| 1 | `bodyShape` | choice | egg 35, bean 25, capsule 25, round 15 | Body primitive |
| 2 | `bodyHeight` | uniform | 0.85 – 1.25 | Body scale Y (units) |
| 3 | `bodyWidth` | uniform | 0.75 – 1.15 | Body scale X/Z |
| 4 | `belly` | uniform | 0 – 0.30 | Forward bulge of the lower body |
| 5 | `headShape` | choice | round 45, egg 30, squarish 25 | Head primitive |
| 6 | `headSize` | uniform | 0.50 – 0.72 × bodyHeight | Head diameter |
| 7 | `headTilt` | uniform | −8° – +8° | Resting head roll |
| 8 | `earType` | choice | round, pointed, long, floppy, tufts, none (equal) | Ear geometry |
| 9 | `earSize` | uniform | 0.18 – 0.50 × headSize | Ear length |
| 10 | `earSpread` | uniform | 35° – 75° | Angle from vertical |
| 11 | `eyeStyle` | choice | round 50, oval 30, half-lid 20 | Eye shape |
| 12 | `eyeSize` | uniform | 0.10 – 0.20 × head diameter | Eye diameter (tuned up from 0.06–0.13 after rendering: smaller eyes read as beads at grid size) |
| 13 | `eyeSpacing` | uniform | 0.32 – 0.62 × head width | Distance between eyes |
| 14 | `eyeHeight` | uniform | 0.45 – 0.62 × head height | Vertical placement (from the chin) |
| 15 | `pupilSize` | uniform | 0.45 – 0.70 × eyeSize | Pupil diameter |
| 16 | `snout` | choice | none 40, button 35, muzzle 25 | Small nose/muzzle primitive |
| 17 | `cheeks` | boolean | 30 % true | Two accent discs |
| 18 | `armType` | choice | stubs 50, paws 30, none 20 | Arm primitives |
| 19 | `legLength` | uniform | 0.15 – 0.35 × bodyHeight | Stubby legs, always present |
| 20 | `tailType` | choice | none 30, puff 25, curl 25, stub 20 | Tail primitive |
| 21 | `markings` | choice | none 55, belly patch 25, spots 20 | Accent-colour regions |
| 22 | `hue` | uniform | 0 – 360 | Base colour H |
| 23 | `chroma` | uniform | 0.06 – 0.13 | Base colour C |
| 24 | `lightness` | uniform | 0.58 – 0.76 | Base colour L |
| 25 | `accentShift` | uniform | +15° – +45° | Accent hue offset |
| 26 | `idlePhase` | uniform | 0 – 1 | Phase offset for the idle wobble; not part of identity |

Silhouette diversity is guaranteed by discrete draws alone: 4 bodies × 3 heads × 6 ears × 3 snouts × 3 arms × 4 tails = 2,592 distinct silhouettes before any continuous parameter or colour. Colour is never the only difference between two critters in a burrow of ten; if a collision on the discrete draws does occur, the continuous parameters still separate them. No uniqueness check is performed (a re-roll is the user's tool).

### 5.3 Composition rules (3D)

Primitives only, low segment counts, no subdivision:

| Part | Geometry | Segments | Notes |
|---|---|---|---|
| Body | Sphere / capsule (`CapsuleGeometry`) scaled to shape | 16 × 12 | `bean` = sphere with a slight forward shear; `egg` = sphere scaled 1 : 1.25 : 1 |
| Head | Sphere / rounded box (drei `RoundedBox`) | 16 × 12 / 4 | Sits on the body with 12 % overlap so the join is hidden |
| Ears | Cone, flattened sphere, or capsule per type | 8 – 12 | `tufts` = three tiny cones; `floppy` = capsule rotated outward and down |
| Eyes | Sphere (white) + sphere (pupil) | 10 × 8 | Pupils offset toward the camera by 30 % of eye radius; `half-lid` adds a body-colour cap |
| Snout | Small sphere / capsule | 8 | Accent colour for `button`; body colour for `muzzle` |
| Arms, legs | Capsules | 8 | Legs half-sunk in the ground plane so feet are implied, not modelled |
| Tail | Sphere (puff), torus segment (curl), capsule (stub) | 8 – 12 | Behind and slightly to the camera's right |
| Cheeks, spots, belly patch | Flattened spheres, sunk 70 % into the body | 8 | Accent colour |
| Mouth | Torus segment, ≤ 40 triangles, Burrow at 60 % opacity | 8 × 6 | Added by Game Design G5; hidden below mood 0.35; curvature follows mood (Game Design §3.4). In 2D, a stroked arc |

Budget: **≤ 3,000 triangles per critter**, ≤ 12 draw calls per critter (parts sharing a material are merged at generation time). Ten critters ≤ 30,000 triangles. The whole-scene budget, frame rate target, and device floor are the Game Design document's.

### 5.4 Runtime state (not identity)

The generator produces the critter's *identity*. Its *state* is a small vector the scene applies every frame; the Game Design document defines the curves that drive it.

| State | Range | Visual meaning |
|---|---|---|
| `asleep` | 0 – 1 | Eyes closed (lids from the top), ears drooped 40 %, slow 4 s breathing, the `sleep` glyph in the DOM label |
| `awake` transition | — | Eyes open, ears lift, one small stretch — the wake moment |
| `fed` | 0 – 1 | Share of crumbs received (compressed curve in Game Design): scale 1.0 → 1.35 max, cheeks fuller, posture more upright |
| `mood` | 0 – 1 | Eye openness, mouth curve, ear lift. Mostly follows `fed`; the feast pushes it |
| `bump` | impulse | The squash-and-stretch on receiving a crumb |
| `isOwn` | boolean | The viewer's own critter: `asleep` held at 1, no feeding controls |

### 5.5 Names

- Name = ENS reverse record, else the display name typed at first connect (PRD F2). Options are named by the creator.
- Display: display face in the grid; body face in tables and lists. Truncate at 24 characters with an ellipsis; the full name is the element's `title` and accessible name.
- Addresses are never a critter's visible name except as a fallback for a member who has neither ENS nor a display name yet: `0x1234…abcd` (6 + 4), in the data face.

### 5.6 Where 3D is used, and where 2D is used

**3D where feeding happens; 2D everywhere else** (**D6**). The 3D critter appears only in the scatter pass grid and the feast/results grid. Everywhere else — home, burrow member list, read pass cards, results table rows, the participation line, dialogs — the critter is its 2D portrait (§5.7). This keeps the read pass free of WebGL entirely: the 3D bundle and context warm up in the background while the member reads, and the grid appears with portraits first, crossfading to 3D when it is ready (§11).

### 5.7 The 2D portrait

An SVG in a 120 × 150 viewBox, drawn from the same parameters by a pure function shared with the fallback (§11). Both renderers consume one shared **layout** step, so the 2D portrait and the 3D mesh have the same proportions by construction:

```
yF      = { egg: 1.25, bean: 1.10, capsule: 1.15, round: 1.00 }[bodyShape]
bh      = 0.5 × bodyHeight × yF          // body half-height (units)
bw      = 0.5 × bodyWidth                // body half-width
leg     = legLength × bodyHeight
bodyC   = 0.6 × leg + bh                 // body centre above the feet
hr      = 0.5 × headSize × bodyHeight    // head radius
headC   = bodyC + bh + 0.76 × hr         // head overlaps the body by 12 % of its diameter
earLen  = earSize × 2 × hr × 1.8
```

The 2D portrait maps units to pixels at **46 px per unit**, feet on the line y = 140, centred at x = 60:

| Part | Mapping |
|---|---|
| Legs | Two rounded rects, 0.2 units wide, from the feet to `leg`, drawn before the body |
| Body | Ellipse at (60, 140 − bodyC·46), rx = bw·46, ry = bh·46; `bean` skews the ellipse 5°; `belly` adds a lower ellipse |
| Head | Circle r = hr·46 at (60, 140 − headC·46); `egg` stretches 1.15 vertically; `squarish` is a rounded rect 1.1 × 0.92; tilted by `headTilt` |
| Ears | Paths per type at the head rim, mirrored, rotated by `earSpread` (+70° for `floppy`, +25° when asleep); inner accent shape |
| Eyes | White circle r = eyeSize·hr·46 (oval 0.85 × 1.15; half-lid adds a body-colour cap); pupil r = pupilSize × eye radius, offset 15 % of the radius toward the viewer's right (the 12° turn); one Surface catchlight; asleep = a stroked arc |
| Snout, cheeks, markings, tail, arms | Simple shapes in accent colour; the tail is drawn behind the body |
| Shadow | Ellipse under the feet, Burrow at 0.18 alpha, scaling with `fed` |
| Growth | The whole figure scales about the feet by 1 + 0.35·fed |
| Sizes | 40 px (lists), 64 px (read pass), 96 px (dialogs), fills the stage in Simple view |

Portraits are `role="img"` with the critter's name as `<title>` when they stand alone; decorative (`aria-hidden`) when next to the name.

## 6. Layout: breakpoints and the grid

### 6.1 Breakpoints

| Name | Min width | Critter columns | Pile placement | Content column |
|---|---|---|---|---|
| `xs` | 0 | 1 | Sticky bottom bar | 100 % − 32 px |
| `base` | 360 px | 2 | Sticky bottom bar | 100 % − 32 px |
| `md` | 600 px | 3 | Sticky bottom bar | max 640 px, centred |
| `lg` | 960 px | 4 | Side rail, 280 px, sticky | max 640 px in text screens; grid max 1,120 px |
| `xl` | 1,280 px | 4 | Side rail, 280 px | Grid max 1,120 px, centred |

`xs` exists for 200 % zoom on small phones and for very narrow windows; it is the 2-column layout collapsed, not a separate design. Nothing scrolls horizontally except the read pass carousel and wide tables inside their own `overflow-x: auto` containers.

### 6.2 Page shell

```
┌─────────────────────────────────────────┐
│ ◆ Burrow name        Gathering · Scatt. │  <header>  top bar: burrow, phase chip, deadline strip
├─────────────────────────────────────────┤
│                                         │  <main>    content column / critter grid
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ [heap]  37 to go             [Scatter]  │  <aside>   pile bar (scatter pass only); safe-area aware
└─────────────────────────────────────────┘
```

- `<header>` holds the burrow name (display face), the phase chip, and the **deadline strip**: both deadlines, always, in the viewer's local time, each tappable to reveal the absolute time (§8, `DeadlineStrip`). On `xs`/`base` the strip wraps to its own line.
- `<main id="content" tabindex="-1">` receives focus on every route change. A skip link precedes the header.
- The pile bar is `position: sticky; bottom: 0` on `xs`–`md`, height 64 px + `env(safe-area-inset-bottom)`, with `--cc-shadow-up`; on `lg`+ it becomes a `position: sticky; top: var(--cc-space-6)` rail to the right of the grid.
- Viewport height uses `dvh` where it matters (the feast's centred layout), never `vh`.

### 6.3 The critter grid and the stage contract

Every critter occupies a **cell**. The cell is DOM; the critter inside it is drawn by the canvas (3D) or the portrait SVG (2D) into the cell's **stage**.

```
┌────────────────┐
│                │
│     stage      │   aspect 4 : 5; critter fills ~70 % of its height, feet at the lower third
│                │
├────────────────┤
│ Fern       · 12│   name (display face) · count (tabular) with the crumb glyph
│ Ran the … ▾    │   statement collapsed to one line; expands in place (<details>)
│ [ − ] [ 12 ][+]│   controls row, scatter pass only: 44 × 44 targets, number field between
└────────────────┘
```

The stage contract the Technical Spec must satisfy:

1. The DOM owns layout. The stage is an empty element with a known rect; the canvas draws the critter inside that rect and nowhere else.
2. Scrolling, resizing, and column changes move critters with their cells with no visible lag beyond one frame.
3. The stage's background is transparent; Oat and the page glow show through in both modes.
4. Each stage carries `data-critter-id`; the canvas never guesses positions from indices.
5. Pointer events on the stage pass to the DOM cell (the canvas is `pointer-events: none`); tapping a critter's stage is equivalent to tapping its `+` control (**D3** of the interaction model: the whole stage is a target, the controls row is the precise target).

Gaps: 12 px (`base`), 16 px (`md`), 24 px (`lg`+). Cells sit on a shared **ground line**: a 2 px Bark-tinted hairline at 4 % alpha runs behind each row at the feet height, so the critters stand on something.

### 6.4 The read pass

A horizontally scrolling list of statement cards, one per critter in the same order as the grid:

- `<ul role="list">` with `scroll-snap-type: x mandatory`; each `<li>` `scroll-snap-align: center`, width 100 % (`base`) or 640 px (`md`+), `scroll-snap-stop: always`.
- A position line ("3 of 8") and Previous / Next buttons above the list; the current index is tracked with an `IntersectionObserver` (the CSS `scroll-state()` query is Chrome-only and not used for anything that matters).
- The card: the 64 px portrait, the name, the statement at `--cc-text-lg` with `62ch` measure, links underlined. A card with no statement shows `read.noStatement`.
- The last card's footer carries **Start scattering**; the top bar always carries **Go to scattering**, so reading is encouraged but never a gate.
- Keyboard: Left/Right and Home/End when the list has focus; the buttons work everywhere. Focus never moves because of a snap.

### 6.5 Results

The settled critter grid (fed states applied, static) above a real `<table>`: Critter · Crumbs · Share, sorted by crumbs descending, ties sharing their line (`results.tie`). Below: the participation line, the did-not-scatter line, the CSV button(s), and — for public feasts — the on-chain record (PRD F9). The giver matrix, when individual scatters are open, is a second table in its own `overflow-x: auto` container with sticky first column.

## 7. Component inventory

States use the same names everywhere: `default`, `hover` (pointer devices only), `focus-visible`, `active`, `disabled` (removed from tab order — only for controls that cannot apply at all), `aria-disabled` (focusable, explains why), `loading`, `error`, `done`.

### 7.1 DOM components

| Component | Purpose | Anatomy | States | Accessibility notes |
|---|---|---|---|---|
| `AppShell` | Page frame | skip link, `<header>`, `<main>`, `<aside>` (pile), announcers | — | Two live regions: `#announce` (polite) and `#alert` (assertive), atomic |
| `TopBar` | Burrow + phase + deadlines | burrow name, `PhaseChip`, `DeadlineStrip`, settings button | — | `<header>`; burrow name is not a heading |
| `PhaseChip` | Current phase | text chip | draft / gathering / scattering / feast | Text, not colour alone |
| `DeadlineStrip` | Both deadlines, unmissable | two `DeadlineItem`s | upcoming / closing-soon (< 6 h) / closed | Each item is a `<button aria-expanded>` that reveals the absolute time; relative time refreshes every minute, silently (`aria-live="off"`) |
| `ConnectButton` | Enter the app | primary button | default / loading / connected (shows portrait + name) | Label is "Connect", never mentions a wallet (PRD §3) |
| `CritterCell` | A critter in the grid | stage, name row, statement line, controls row | asleep / awake / own / done (viewer has submitted) / fed levels (results) | The cell is a `<li>`; the stage is `aria-hidden`; the name row carries the accessible summary (§12.6) |
| `ScatterControls` | Give and take crumbs | `−` button, `NumberField`, `+` button | default / at-zero-remaining (`+` aria-disabled) / at-zero-here (`−` aria-disabled) / pouring | 44 × 44 targets; tap-and-hold on both; accessible names "Give a crumb to Fern" / "Take a crumb back from Fern" |
| `NumberField` | Exact amount | `<input type="text" inputmode="numeric" pattern="[0-9]*">` | default / invalid (out of range, clamps on blur) | Label "Crumbs for Fern"; Up/Down ±1, Shift ±10; commits on Enter/blur |
| `StatementLine` | Collapsed statement in a cell | `<details><summary>` one line + chevron | collapsed / expanded | Summary text is the first line of the statement; heading-free |
| `PileBar` | The pile, remaining count, the submit | `Heap`, count, `SubmitScatter`, participation line (rail only) | remaining / empty / saving / done | `<aside aria-label="Your crumbs">`; count text is the source of truth, updated `aria-live="off"`; announcements happen on release (§12.6) |
| `Heap` | The signature (§7.4) | SVG mound of crumb glyphs | full → empty (24 → 0 visible crumbs) | `aria-hidden`; the count carries the meaning |
| `SubmitScatter` | Finalise | primary button | aria-disabled until the pile is empty / loading (signing, saving) / done | Helper text explains why it is not yet available |
| `ParticipationLine` | Who has (not) scattered / written | count + names | live | Text list; portraits decorative; refreshes politely at most once a minute |
| `StatementEditor` | Write your statement | label, prompt, `<textarea>`, counter, save | empty / editing / saved / over-limit (blocked at 2,000) | `field-sizing: content` with `min-block-size: 6lh; max-block-size: 24lh`, fixed width; counter is `aria-live="off"` text; over-limit announced politely once |
| `StatementCard` | Read pass card | portrait, name, statement, links | default / empty | `<article aria-labelledby>`; links `rel="noopener nofollow ugc"`, same tab |
| `StatementText` | Plain text renderer | paragraphs from line breaks, URLs → links | — | Never injects HTML; auto-link only `http(s)://`; visible URL truncated at 48 chars, full in `title` |
| `Carousel` | Read pass container | list, position, prev/next | — | §6.4 |
| `ResultsTable` | Totals and shares | `<table>` with `<caption>` | default / tie rows | `<th scope="col">`; numbers tabular; share as percentage to one decimal in the UI (CSV carries full precision) |
| `GiverMatrix` | Who gave what | table, sticky first column | — | Only when individual scatters are open; caption states that |
| `CsvButton` | Export | secondary button with `download` icon | default / loading | Filename `feast-{slug}-results.csv` |
| `PrivacyControls` | Two switches | aggregate segmented control, individual switch, explainer | the two switches are independent; every combination is valid (PRD P14) | No forced or disabled state: each switch stands alone and the explainer describes what the current pair means |
| `Switch` | On/off | `<button role="switch" aria-checked>` | on / off | Track `--cc-line-strong` off, `--cc-moss` on, thumb Surface; 3 : 1 in both states |
| `SegmentedControl` | One of two/three | `<fieldset>` of radios styled as segments | — | Native radios; visible legend |
| `DeadlinePicker` | Pick a time | `<input type="datetime-local">` + time-zone line | default / invalid (order violated) | Native picker; the time-zone line names the viewer's zone explicitly |
| `Button` | Primary / secondary / quiet | `<button>` | all | Primary: Burrow on Oat; secondary: Surface with strong border; quiet: text-only Soil, underlined on hover/focus |
| `Chip` | Small status | text + optional icon | ok / neutral / error | Never colour alone; ok chips carry the `check` icon |
| `Notice` | Inline message | icon, text, optional action | info / error / offline | Errors use `role="alert"` only when they block the current action; otherwise polite |
| `Sheet` / `Dialog` | Confirmations, settings | native `<dialog>` opened with `showModal()` | — | No hand-rolled focus trap; Esc closes; focus returns to the opener |
| `SoundControls` | Two toggles | effects switch, ambience switch, still-critters switch, simple-view switch | — | Ambience defaults off, effects on (PRD §9); each persisted |
| `RerollControl` | Meet your critter | big portrait, re-roll button with remaining count, keep button | 4 → 0 re-rolls left / locked | The portrait swap is announced: "New critter. 3 re-rolls left." |
| `MemberList` | Burrow critters | list of portrait + name + address | — | `role="list"` restored when styled (Safari) |
| `BurrowList` | Home | list of burrows with critter counts and the next deadline | empty | — |
| `FeastList` | Past and current feasts | list with phase chips and dates | empty | Cancelled feasts are listed, labelled |
| `EmptyState` | Nothing here yet | portrait (asleep), title, body, one action | — | §9 |
| `Skeleton` | Loading | Oat/Sunken shimmer blocks | — | `aria-hidden`; not announced |
| `OfflineNotice` | Network state | banner | offline / back | Assertive on offline, polite on return |
| `FallbackNotice` | Simple view is on | one line + retry link | initial / mid-session | §11 |

### 7.2 Canvas components

| Component | Purpose | States | DOM counterpart |
|---|---|---|---|
| `CritterMesh` | One critter from its parameters | `asleep`, `awake`, `fed`, `mood`, `bump`, `isOwn` (§5.4) | Its `CritterCell` — the cell's name row states asleep/own/fed in text |
| `CrumbStream` | Crumbs flying on tap and hold | idle / tapping / pouring | The DOM crumb hop (§7.4) plays too on tap; on hold only the canvas stream runs |
| `GroundBlob` | Soft shadow under each critter | scales with `fed` | The 2D shadow ellipse |
| `StageLights` | The preset lights (§4.2) | `day` / `dusk` / `feast` | The DOM glow is constant |
| `FeastDirector` | Runs the feast sequence (Game Design) | idle / playing / settled | The results heading gains focus when settled; "Skip to results" is DOM |
| `Wakeup` | The asleep → awake transition | — | Cell label loses the `sleep` glyph |

### 7.3 Fallback (2D) components

| Component | Replaces | How |
|---|---|---|
| `CritterPortrait` (stage size) | `CritterMesh` | The §5.7 SVG, scaled to the stage; state applied via CSS: `asleep` closes lids (a path swap), `fed` scales 1.0 → 1.35, `bump` is a 120 ms `scale(1.06, 0.94)` transform |
| CSS crumb hop | `CrumbStream` | The DOM hop (§7.4) plays on every tap; on hold, the count highlight pulses instead of a stream |
| Staggered reveal | `FeastDirector` | Critters scale to their fed size one by one, 240 ms apart, Oat → `feast` warm tint on the page glow, then settle (Game Design specifies; this is the floor) |

### 7.4 The heap and the hop

The `Heap` is an SVG 96 × 56 (bar) or 200 × 120 (rail) of up to 24 crumb glyphs arranged in a mound (three rows: 11 / 8 / 5). Visible crumbs = `ceil(remaining ÷ issued × 24)`; crumbs disappear from the top row first. Each glyph has a per-index rotation (−25° to +25°) and ±10 % size jitter from a fixed table, so the mound looks hand-piled but identical for everyone.

The **hop**: on every tap of `+`, one crumb glyph leaves the heap (a clone, absolutely positioned) and travels a quadratic arc to the tapped cell's count over `--cc-dur-2` with `--cc-ease-hop`, then fades. On `−`, the arc reverses. During a hold, the DOM plays no hops (the canvas stream carries it; in Simple view the count highlight pulses); on release, one hop plays. Under reduced motion or Still critters, no hop; the count simply changes and the heap updates.

At zero, the heap shows three faint crumb outlines (`--cc-crust` at 30 %) and the pile bar's count becomes the `pile.empty` chip in Moss-tint with the `check` icon.

## 8. Time and deadlines

- Relative first, absolute one tap away: "Gathering closes in 2 days" · tap → "Tue 14 Oct, 18:00 (BST)". Relative strings come from `Intl.RelativeTimeFormat`; absolute from `Intl.DateTimeFormat` with `timeZoneName: "short"` in the viewer's zone.
- Both deadlines are always visible in the top bar during gathering and scattering; the past one is shown as "closed {relative}" so the timeline stays legible.
- "Closing soon" (< 6 h) changes the item's text prefix and adds the `clock` icon; never colour alone.
- Countdown text refreshes every minute with `aria-live="off"`; deadlines are never announced spontaneously.
- All times come from the trusted timestamp (PRD R13). If the device clock disagrees by more than 5 minutes, `err.clockSkew` shows once per session as a polite notice.

## 9. Screens, empty states, and first-run states

| Screen / state | What shows | Copy (§10) |
|---|---|---|
| Arrive, not connected | Feast title, context, burrow line, both deadlines, the grid of critters asleep in `dusk` (portraits until 3D is ready), one explainer, the connect button | `arrive.*` |
| First connect, no ENS | Name prompt dialog | `name.*` |
| Meet your critter | `RerollControl` | `critter.*` |
| Home, no burrows | Empty state with an asleep portrait of the viewer's own critter | `home.empty.*` |
| Burrow, only you | Member list with one row; add-critter field focused | `burrow.empty.*` |
| Burrow, no feasts | Feast list empty state | `burrow.feasts.empty.*` |
| Feast draft (creator) | Setup form with a "Draft — only you can see this" chip | `setup.draft.chip` |
| Gathering, statement empty | Editor with the prompt; counter at 0 / 2,000 | `gathering.prompt` |
| Gathering, options feast (creator) | One editor per option, in a list | `gathering.options.title` |
| Gathering, member view of others | Participation line only; no statements | `gathering.hidden`, `gathering.participation` |
| Scattering opens (first visit) | The reveal moment (Game Design), then `reveal.*` and the read pass | `reveal.*` |
| Read pass, critter without statement | Card with portrait and `read.noStatement` | `read.noStatement` |
| Scatter pass, nobody has scattered | Participation "0 of 8 have scattered" | `scatter.participation` |
| Scatter pass, own critter | Cell asleep with `scatter.own.*` instead of controls | `scatter.own.*` |
| After scattering | The done line in the pile bar; controls stay live | `scatter.done.*` |
| Scattering closed, feast not yet computed | Waiting screen with critters asleep in `dusk` | `feast.waiting.*`, `feast.keyNotYet` |
| The feast | Sequence, then results | `feast.*` |
| Results, nobody scattered | Grid unchanged, table empty, `results.nobody` | `results.nobody` |
| Results, one scatterer | Normal results plus `results.one` | `results.one` |
| Results, tie | Tied rows share a line under the table | `results.tie` |
| Results, public, not yet recorded | The record button, creator sees it first | `results.attest.*` |
| Simple view (fallback or chosen) | Portraits in stages; one notice line | `fallback.*` |
| Offline | Banner; controls stay usable; submit shows why it waits | `err.offline` |
| Not in the burrow | Burrow name and the ask-a-member line | `burrow.unknown.*` |
| Feast cancelled | Listed in past feasts with a "Cancelled" chip | `feast.cancelled` |
| People feast below three critters at scattering open | Feast ends; notice on the burrow home | `feast.tooFew` |

First-run guidance is in-place copy, never a tour: the explainer on arrival, the prompt in the editor, the one-line instruction above the scatter grid. Nothing pops up unasked except the two confirmations (open the feast, leave the burrow) and the signing step.

## 10. UX copy

### 10.1 Voice

- Plain, warm, short. Second person, present tense. Sentence case everywhere.
- The vocabulary is the interface (PRD §3): critter, burrow, feast, gathering, scattering, crumbs, scatter. Never seal, round, cache, vote, ballot. Say "connect", never "connect your wallet"; avoid the word "wallet" entirely so v1 needs no rewrite.
- A control says what happens: "Open the feast" → the chip says "Gathering". "Scatter these" → "Scattered." The name of an action never changes mid-flow.
- Numbers are numerals ("3 of 8", "37 to go"). Deadlines are relative with the absolute a tap away (§8).
- Errors say what happened and what to do, and never apologise or blame. Every error that could make someone fear loss says explicitly what was not lost.
- No exclamation marks. The feast gets one designed sentence, not enthusiasm.
- Empty states invite one action; they do not explain the product.

### 10.2 Strings

IDs are stable; `{}` marks interpolation. Plural forms use `Intl.PluralRules`; the table shows the "other" form and notes "one" forms where they differ.

**Global**

| ID | Text |
|---|---|
| `app.name` | Critter Crumbs |
| `app.tagline` | Everyone gets a handful of crumbs to share. |
| `action.connect` | Connect |
| `action.disconnect` | Disconnect |
| `action.back` | Back |
| `action.cancel` | Cancel |
| `action.settings` | Settings |
| `phase.draft` / `phase.gathering` / `phase.scattering` / `phase.feast` | Draft / Gathering / Scattering / Feast |
| `deadline.gathering` | Gathering closes {relative} |
| `deadline.scattering` | Scattering closes {relative} |
| `deadline.closed` | {phase} closed {relative} |
| `deadline.soon` | Closing soon — {relative} |
| `deadline.absolute` | {weekday} {day} {month}, {time} ({tz}) |
| `deadline.line` | {deadline} · {date} (the closing line and its absolute time, on one line) |
| `skip.content` | Skip to content |

**Arrive (F1)**

| ID | Text |
|---|---|
| `arrive.burrow` | {burrowName} · {n} critters |
| `arrive.explainer` | Everyone here gets the same handful of crumbs to share out. Where they go stays private until the feast. |
| `arrive.asleep` | The critters are asleep until you connect. |
| `arrive.cta` | Connect to join |

**Connect and critter (F2)**

| ID | Text |
|---|---|
| `name.title` | What should the burrow call you? |
| `name.help` | There's no ENS name on this address, so pick a name. |
| `name.label` | Display name |
| `name.save` | Save name |
| `critter.meet.title` | Meet your critter |
| `critter.meet.body` | Made from your address. Re-roll up to {max} times, then it's yours. |
| `critter.reroll` | Re-roll ({remaining} left) |
| `critter.reroll.last` | Re-roll (last one) |
| `critter.reroll.announce` | New critter. {remaining} re-rolls left. |
| `critter.keep` | Keep this one |
| `critter.locked` | This one's yours. |

**Home and burrow (F3, F10)**

| ID | Text |
|---|---|
| `home.title` | Your burrows |
| `home.empty.title` | No burrows yet |
| `home.empty.body` | Start one, or ask a friend to add you to theirs. |
| `home.empty.cta` | Start a burrow |
| `burrow.create.title` | Start a burrow |
| `burrow.name.label` | Burrow name |
| `burrow.create.cta` | Create burrow |
| `burrow.members.title` | Critters |
| `burrow.empty.title` | Just you so far |
| `burrow.empty.body` | Add critters by address or ENS name. They get in with the burrow link. |
| `burrow.add.label` | Address or ENS name |
| `burrow.add.cta` | Add |
| `burrow.add.done` | {name} added. |
| `burrow.link.copy` | Copy burrow link |
| `burrow.link.copied` | Link copied. |
| `burrow.feasts.title` | Feasts |
| `burrow.feasts.empty.title` | No feasts yet |
| `burrow.feasts.empty.body` | Start one when the burrow is ready. |
| `burrow.feasts.new` | Start a feast |
| `burrow.leave` | Leave this burrow |
| `burrow.leave.title` | Leave {burrowName}? |
| `burrow.leave.body` | Your critter leaves future feasts. Past feasts stay as they were. |
| `burrow.leave.cta` | Leave burrow |
| `burrow.unknown.title` | This burrow doesn't know you yet |
| `burrow.unknown.body` | Ask someone in {burrowName} to add {shortAddress}. |
| `feast.cancelled` | Cancelled |
| `feast.tooFew` | {feastTitle} ended before scattering: a people feast needs at least 3 critters. Start a new one when the burrow is ready. |

**Feast setup (F4)**

| ID | Text |
|---|---|
| `setup.title` | Start a feast |
| `setup.draft.chip` | Draft — only you can see this |
| `setup.field.title` | Feast title |
| `setup.field.context` | What is this feast for? |
| `setup.field.context.help` | One line. It shows on the invite. |
| `setup.field.type` | Where do the crumbs go? |
| `setup.type.people` | To people |
| `setup.type.people.help` | Recognising contribution. Everyone writes what they did. |
| `setup.type.options` | To options |
| `setup.type.options.help` | Splitting a budget. You write a line for each option. |
| `setup.options.title` | Options |
| `setup.options.add` | Add an option |
| `setup.option.name` | Option name |
| `setup.option.statement` | What this option is |
| `setup.field.crumbs` | Crumbs per critter |
| `setup.crumbs.help` | 100 keeps the maths simple. Anything from 10 to 1,000. |
| `setup.field.gathering` | Gathering closes |
| `setup.field.scattering` | Scattering closes |
| `setup.deadline.help` | Everyone sees these in their own time zone. Yours is {tz}. |
| `setup.deadline.order` | Scattering has to close after gathering. |
| `setup.privacy.title` | Who sees the result? |
| `setup.privacy.aggregate.label` | The result |
| `setup.privacy.aggregate.public` | Public — anyone with the link, and recorded on-chain |
| `setup.privacy.aggregate.burrow` | Burrow only |
| `setup.privacy.individual.label` | Who gave what |
| `setup.privacy.individual.closed` | Closed — nobody sees individual scatters |
| `setup.privacy.individual.open` | Open to the burrow after the feast |
| `setup.privacy.individual.burrow` | Your burrow sees who gave what. Nothing goes public. |
| `setup.min.people` | A people feast needs at least 3 critters. This burrow has {n}. |
| `setup.save` | Save draft |
| `setup.open` | Open the feast |
| `setup.open.title` | Open {feastTitle}? |
| `setup.open.body` | Gathering starts now and closes {gatheringDeadline}. You can extend that once. |
| `setup.open.cta` | Open the feast |

**Gathering (F5)**

| ID | Text |
|---|---|
| `gathering.yours.title` | Your statement |
| `gathering.prompt` | What did you do this time? Draw on your notes, commits, calendar — anything that helps. Links are welcome. |
| `gathering.counter` | {n} / 2,000 |
| `gathering.limit` | That's the limit — 2,000 characters. |
| `gathering.save` | Save statement |
| `gathering.saved` | Saved. |
| `gathering.hidden` | Nobody sees this until scattering opens. |
| `gathering.participation` | {written} of {total} statements written |
| `gathering.notYet` | Not yet: {names} |
| `gathering.options.title` | Option statements |
| `gathering.extend` | Extend gathering (once) |
| `gathering.extend.title` | Extend gathering |
| `gathering.extend.body` | Pick a new close time before scattering closes ({scatteringDeadline}). This is the only extension. |
| `gathering.extend.cta` | Extend |
| `gathering.extended` | Gathering now closes {relative}. |
| `gathering.cancel` | Cancel this feast |
| `gathering.cancel.title` | Cancel {feastTitle}? |
| `gathering.cancel.body` | The feast ends now. This can't be undone. |
| `gathering.cancel.cta` | Cancel the feast |

**Scattering (F6, F7)**

| ID | Text |
|---|---|
| `reveal.title` | Statements are open |
| `reveal.body` | Read them first, then scatter your {crumbs} crumbs. |
| `reveal.cta` | Start reading |
| `reveal.announce` | Statements are open. {n} statements to read. |
| `read.position` | {i} of {n} |
| `read.prev` / `read.next` | Previous / Next |
| `read.skip` | Go to scattering |
| `read.done` | Start scattering |
| `read.noStatement` | {name} didn't write a statement. |
| `read.option.noStatement` | No description for this option. |
| `scatter.instruction` | Tap to give a crumb. Hold to pour. |
| `scatter.add` | Give a crumb to {name} |
| `scatter.remove` | Take a crumb back from {name} |
| `scatter.count.label` | Crumbs for {name} |
| `scatter.count.announce` | {n} for {name}. {remaining} to go. |
| `scatter.own.label` | Your critter |
| `element.earth` / `.water` / `.fire` / `.air` | Earth / Water / Fire / Air (a version 2 critter's element chip) |
| `scatter.own.body` | Asleep, eating what the others give it. |
| `scatter.statement.show` / `.hide` | Show statement / Hide statement |
| `scatter.none.left` | No crumbs left. Take some back to move them. |
| `pile.remaining` | {n} to go (one: 1 to go) |
| `pile.remaining.words` | to go (beside the number in the bar) |
| `pile.empty` | All scattered |
| `pile.empty.announce` | All scattered. Scatter these when you're ready. |
| `scatter.submit` | Scatter these |
| `scatter.submit.help` | Scatter all {n} first. |
| `scatter.sign.title` | Confirm your scatter |
| `scatter.sign.body` | You'll be asked to sign. It costs nothing and nothing goes on-chain. |
| `scatter.sign.rejected` | Not confirmed. Your crumbs are still here — try again when you're ready. |
| `scatter.saving` | Saving… |
| `scatter.done.title` | Scattered. |
| `scatter.done.body` | You can change this until {scatteringDeadline}. |
| `scatter.done.change` | Change my scatter |
| `scatter.participation` | {done} of {total} have scattered |
| `scatter.notYet` | Not yet: {names} |
| `scatter.closed` | Scattering has closed. The feast is on its way. |

**The feast and results (F8, F9)**

| ID | Text |
|---|---|
| `feast.waiting.title` | The feast is being laid out |
| `feast.waiting.body` | Fetching the key and opening every scatter. This takes a moment. |
| `feast.keyNotYet` | The key isn't out yet. Try again in a few minutes. |
| `feast.replay` | Replay the feast |
| `feast.skip` | Skip to results |
| `feast.sequence` | Everyone wakes, then each critter eats and grows in turn. |
| `feast.announce` | Results are ready. {topName} received the most crumbs. |
| `results.title` | Results |
| `results.caption` | Crumbs received in {feastTitle} |
| `results.col.critter` / `.crumbs` / `.share` | Critter / Crumbs / Share |
| `results.summary` | {scatterers} of {total} scattered · {totalCrumbs} crumbs in all |
| `results.didNotScatter` | {names} didn't scatter. |
| `results.everyone` | Everyone scattered. |
| `results.one` | Only {name} scattered. |
| `results.nobody` | Nobody scattered, so there's nothing to share out. |
| `results.tie` | {names} tied. |
| `results.givers.title` | Who gave what |
| `results.givers.caption` | Individual scatters are open to the burrow for this feast. |
| `results.col.giver` | Giver |
| `results.giver.you` | {name} (you) |
| `results.givers.none` | — |
| `results.export` | Download CSV |
| `results.export.givers` | Download CSV (who gave what) |
| `results.private` | Only the burrow can see these results. |
| `results.public` | Anyone with the link can see these results. |
| `results.attest.cta` | Record the result on-chain |
| `results.attest.help` | Anyone in the burrow can do this. It costs a little gas. |
| `results.attest.done` | Recorded on-chain by {name}. |
| `results.attest.view` | View the record |

**Settings**

| ID | Text |
|---|---|
| `settings.title` | Settings |
| `sound.effects.label` | Sounds |
| `sound.effects.help` | Little crumb noises. |
| `sound.ambience.label` | Burrow ambience |
| `sound.ambience.help` | A soft loop in the background. Off unless you want it. |
| `motion.still.label` | Still critters |
| `motion.still.help` | No wobbling or bouncing. |
| `view.simple.label` | Simple view |
| `view.simple.help` | Flat critters. Easier on the battery. |

**Simple view and errors**

| ID | Text |
|---|---|
| `fallback.initial` | Showing the simple view — 3D isn't available in this browser right now. |
| `fallback.midSession` | The 3D view stopped, so this is the simple view. Nothing else has changed. |
| `fallback.retry` | Try 3D again |
| `err.offline` | You're offline. Your crumbs are safe on this screen until you're back. |
| `err.online` | Back online. |
| `err.saveFailed` | Couldn't save your scatter. Check your connection and try again — nothing was lost. |
| `err.saveUnverified` | Saved, but not confirmed yet. Keep this open a moment. |
| `err.saveVerified` | Your scatter is in. |
| `err.clockSkew` | Your device clock is off by about {duration}. Deadlines here use the feast's clock, not yours. |
| `err.uidMissing` | Your scatter isn't in the published set. Keep this: {uid}. Tell the burrow. |
| `err.ensUnavailable` | Couldn't look up ENS names right now, so addresses are shown instead. |
| `err.storeUnreachable` | Can't reach the burrow right now. Try again in a moment. |
| `err.keyUnreachable` | Can't fetch the key right now. Nothing is lost — try again in a few minutes. |
| `err.generic` | Something went wrong. Nothing you did was lost. |
| `err.notParticipant` | This feast started before you joined the burrow. You'll be in the next one. |
| `results.unreadable` | {names} scattered, but their crumbs couldn't be read, so they count as not having scattered. |

The Technical Spec's edge-state table references these IDs and may add `err.*` strings here; it must not invent inline copy.

## 11. The no-WebGL fallback: Simple view

Simple view is a first-class mode, not an error page. It is the same app with the §5.7 portraits in the stages instead of meshes.

**Two ways in.** (1) Automatic: WebGL is unavailable, context creation fails, the 3D module fails to load, or the context is lost and not restored within 2 seconds. (2) Chosen: the **Simple view** switch in settings (**D9**), persisted; useful on low-end devices and for anyone who prefers it.

**Progressive, not defensive.** Every stage renders its portrait first. In 3D-capable browsers, the 3D module lazy-loads, creates the context, and crossfades each critter from portrait to mesh over `--cc-dur-3` when ready. If any step fails, nothing happens: the portraits are already there. This is the whole fallback strategy — there is no separate error path to design, and the arrival and read screens never load 3D at all (**D6**).

**Mid-session loss.** On `webglcontextlost` without restore, the canvas hides, portraits show (they were never removed from the DOM, only visually covered), `fallback.midSession` appears once as a polite notice, and every control keeps working because the controls never lived in the canvas. Scatter state is untouched.

| Aspect | 3D | Simple view |
|---|---|---|
| Identity | Mesh from parameters | Portrait from the same parameters |
| Asleep / awake | Lids, ears, breathing | Lid path swap; no breathing under reduced motion |
| Tap feedback | Squash-and-stretch, crumb flies in the canvas | 120 ms `scale(1.06, .94)` on the portrait; DOM hop from the heap |
| Hold feedback | Crumb stream, pitch rising (sound) | Count highlight pulses in `--cc-honey-tint`; same sound |
| Growth (results) | Scale 1.0 → 1.35, posture, cheeks | Scale 1.0 → 1.35 via CSS transform; cheeks appear at `fed` ≥ 0.5 |
| The feast | The Game Design sequence | Staggered reveal (§7.3), readable within 3 s of the end |
| Everything in the DOM | Identical | Identical |

The retry link re-attempts 3D once per session; on failure it disappears for the session.

## 12. Accessibility

Target: **WCAG 2.2 AA** across the whole app, including the feast. The canvas is decorative by definition here — every fact it shows is also in the DOM.

### 12.1 Structure

- Landmarks: `<header>` (top bar), `<main id="content" tabindex="-1">`, `<aside aria-label="Your crumbs">` (pile bar), `<footer>` on the home. One `<h1>` per screen; heading levels never skip.
- Critter grids, member lists, feast lists, and the read pass are real lists with `role="list"` restored where CSS strips it (Safari).
- Skip link to `#content`; `<title>` is "{screen} · {burrow} · Critter Crumbs" and updates on every route change, then `#content` receives focus.
- `<html lang="en">`.

### 12.2 Contrast

| Pair | Ratio | Passes |
|---|---|---|
| Burrow text on Oat / Surface / Sunken | 12.9 / 14.7 / 11.3 | AA, AAA |
| Soil text on Oat / Surface / Sunken | 6.8 / 7.8 / 6.0 | AA, AAA |
| Bark text on Oat / Surface | 4.9 / 5.6 | AA — never on Sunken (4.3) |
| Moss-ink on Oat / Moss-tint | 6.7 / 6.3 | AA, AAA |
| Clay-ink on Oat / Clay-tint | 5.8 / 5.3 | AA, AAA |
| Oat text on Burrow (primary button) | 12.9 | AA, AAA |
| Line-strong on Oat / Surface (input edges, switch track) | 3.7 / 4.2 | 1.4.11 |
| Crust on Oat (crumb edges, heap stroke) | 3.6 | 1.4.11 |
| Moss on Oat (switch on-state) | 3.6 | 1.4.11 |
| Focus ring (Burrow) on any surface | ≥ 11 | 1.4.11 |
| Honey on Oat (decorative crumb fill) | 2.0 | not required — decorative, edged in Crust |

### 12.3 Targets and spacing

- `+`, `−`, prev/next, the submit, and every list-row action: **44 × 44 CSS px** minimum, 8 px apart.
- Everything else interactive: 24 × 24 minimum (WCAG 2.2 2.5.8), inline text links excepted.
- The whole critter stage is a tap target for `+` (§6.3); it does not replace the button.
- Hold gestures have a non-gesture equivalent (the number field) and a keyboard equivalent (§12.4). No drag anywhere (2.5.7 satisfied by design).

### 12.4 Keyboard

| Where | Keys | Behaviour |
|---|---|---|
| Everywhere | Tab / Shift+Tab | Visual order: header → main → pile bar. Never a positive `tabindex` |
| `+` / `−` buttons | Enter, Space | One crumb. Holding the key pours with the same curve as pointer hold: start on `keydown` (ignoring repeats), stop on `keyup` |
| `NumberField` | Digits; ↑/↓ ±1; Shift+↑/↓ ±10; Enter commits; Esc reverts | Clamped to `[0, current + remaining]` |
| `StatementLine` (`<details>`) | Enter, Space on the summary | Expand / collapse in place |
| Read pass list | ←/→, Home/End; Tab reaches links inside the card | Snap position follows; focus does not move on snap |
| Dialogs | Esc | Closes; focus returns to the opener (native `<dialog>`) |
| Deadline items | Enter, Space | Toggles the absolute time (`aria-expanded`) |
| Feast | Enter on **Skip to results** | Ends the sequence; results heading focused |

### 12.5 Focus

- `:focus-visible` on everything interactive: `outline: 3px solid var(--cc-focus); outline-offset: 2px`, plus a 2 px Oat inner ring on filled buttons (`box-shadow: 0 0 0 2px var(--cc-oat)` inside the outline) so the ring reads on Burrow too.
- Focus management: route change → `#content`; statement reveal → **Start reading**; scatter saved → the done line (`tabindex="-1"`); dialog close → opener; feast settled (or skipped, or reduced motion) → results `<h1>`.
- Nothing steals focus while typing or pouring.

### 12.6 Screen readers over a canvas

- The `<canvas>` is `aria-hidden="true"` and `inert`. Nothing in it is focusable; no HTML-in-canvas (the API is not shipped in any browser — checked against current guidance, and not needed here).
- Each `CritterCell` exposes, in DOM order: name, state in words ("asleep", "your critter", "fed 4 of 10" on results), the collapsed statement, then the controls. The count is an `<output for="…">` bound to the field.
- Two announcers only (`#announce` polite, `#alert` assertive), both `aria-atomic="true"`; nothing else is live.

| Event | Region | Text | Timing |
|---|---|---|---|
| Crumb given/taken by tap or key | polite | `scatter.count.announce` | On release, debounced 250 ms — never per crumb during a pour |
| Pile reaches zero | polite | `pile.empty.announce` | Immediately |
| Scatter saved | polite | `scatter.done.title` + `scatter.done.body` | On confirmation |
| Save failed / offline | assertive | `err.saveFailed` / `err.offline` | Immediately |
| Statements revealed (screen opens) | polite | `reveal.announce` | After focus lands |
| Feast settled | polite | `feast.announce` | After the sequence, or immediately with reduced motion |
| Phase closed while on screen | polite | `scatter.closed` | Once |
| Simple view engaged mid-session | polite | `fallback.midSession` | Once |
| Re-roll | polite | `critter.reroll.announce` | Each re-roll |
| Loading, saving, countdown ticks | none | — | Never announced |

- Results are a `<table>` with `<caption>`; the feast is summarised in one sentence. Sound never carries state alone (PRD §9): every cue in the Game Design document maps to one of the DOM states above.

### 12.7 Motion, contrast, and forced colours

- `prefers-reduced-motion: reduce` → DOM durations per §3.6; canvas per the Game Design document's reduced-motion rules (near-static: no idle wobble, no bounce, crossfades only); the crumb hop and the crumb stream are off; audio effects are damped (Game Design defines the gain and flattens the pour). The feast becomes the staggered reveal (§7.3) with no scale overshoot.
- **Still critters** (**D10**) is a visible setting that applies the same rules regardless of the OS preference. It exists because idle critter motion runs longer than five seconds alongside other content, which WCAG 2.2.2 says must be pausable.
- `prefers-contrast: more` → §3.1 rules.
- `forced-colors: active` → components rely on system colours (`ButtonText`, `CanvasText`, `Highlight`); focus uses `outline` (preserved); the crumb glyph and heap keep their fills with `forced-color-adjust: none` because the count text next to them carries the meaning; the canvas is unaffected and remains decorative.
- Text zoom to 200 % and reflow at 320 px: the grid drops to `xs` (one column); no fixed heights on text containers; the collapsed statement line clamps with `text-overflow`, and the expanded state has no cap.

### 12.8 Accessibility review of this design

Reviewed against WCAG 2.2 AA and the current accessibility guidance in this session, manually (no automated review tooling was available in this session). Findings and their resolutions in the design above:

| # | Finding | Severity | Resolution |
|---|---|---|---|
| A1 | Tap-and-hold has no non-pointer equivalent | Blocker | Number field per critter; keyboard hold on the buttons (§12.4) |
| A2 | Honey on Oat fails text and boundary contrast, so honey buttons would fail | Blocker | Honey is never a button or text; primary action is Burrow on Oat; crumb edges use Crust at 3.6 : 1 (§3.1) |
| A3 | Announcing every crumb during a pour floods a screen reader | Major | Announce on release only, debounced (§12.6); counts are `aria-live="off"` |
| A4 | Canvas content could receive focus or be read as garbage | Major | `aria-hidden` + `inert`; all state mirrored in the cell (§12.6) |
| A5 | Own critter's missing controls could look like a bug | Minor | Text state "Your critter — asleep, eating what the others give it" replaces the controls |
| A6 | Participation and "closing soon" conveyed by colour | Major | Text and icons; chips never colour-only (§8, `Chip`) |
| A7 | Carousel snap could fight keyboard focus | Major | Focus never moves on snap; buttons and arrow keys drive it; scroll-state CSS not relied on (§6.4) |
| A8 | Idle critter animation runs indefinitely | Major | Still critters setting + reduced motion (§12.7) |
| A9 | Autoplaying ambience | Major | Off by default; starts only on interaction (PRD §9) |
| A10 | Forced-disabling the individual-scatters switch silently | Minor | `aria-disabled` with the visible reason (`PrivacyControls`) |
| A11 | Hand-rolled focus traps in sheets | Minor | Native `<dialog>` + `showModal()` only |
| A12 | Bark text on Sunken misses 4.5 : 1 | Minor | Forbidden pairing; Soil on Sunken instead (§3.1) |
| A13 | The feast sequence blocks results for vestibular users | Major | Skip to results always present; reduced motion goes straight to the settled state |
| A14 | Statement links open new tabs unexpectedly | Minor | Same tab, `rel="noopener nofollow ugc"`, underlined |
| A15 | Time zones ambiguous across four continents | Major | Relative + absolute with explicit zone; the zone named in setup (§8) |
| A16 | Sound-only feedback during hold | Major | Count highlight and stream/pulse are the visual counterparts (§11) |

Still required in implementation, not resolvable in a document: axe-core in CI on every screen; a full keyboard-only pass of the feast lifecycle in the mock Shutter mode; VoiceOver on iOS Safari and TalkBack on Chrome for Android over the scatter pass; a 200 % zoom pass on a 375 px viewport.

## 13. Sound in the design system

The Game Design document owns every sound token. This document fixes what is shared:

- The six palette words (§2) are the character brief. A sound that needs a word outside that list is wrong.
- Two toggles, in this order in settings: **Sounds** (effects, default on) and **Burrow ambience** (default off), followed by **Still critters** and **Simple view**. All four persist per browser.
- The ambience toggle is where the charm is spent: its label carries the `ambience` leaf icon and the one sentence of help; it is never a bare speaker icon.
- Every sound token maps to exactly one DOM state or announcement in §12.6; the Game Design table must carry that column.
- Under reduced motion or Still critters, effects are damped, never disabled — the user's own toggle is the only thing that disables them.

## 14. Decisions and open questions

### Decisions made here

| # | Decision | Why |
|---|---|---|
| D1 | One light theme in v0; `color-scheme: light` declared; dark theme is a token swap in v1 | Four weeks to the rehearsal; one theme done well. Tokens are semantic so the swap is mechanical later |
| D2 | Superseded by D14: system sans throughout | October review chose Inked daylight |
| D3 | Amended by D14: primary actions are gold with ink text and ink outline; honey otherwise belongs to crumbs | October review adopts the gold button; text and meaningful edges retain contrast |
| D4 | No icon library; one inline SVG sprite of 22 icons | A dependency for 22 shapes is not justified |
| D5 | The heap is the signature element; it lives in the DOM | Zero cost, works in Simple view, memorable |
| D6 | 3D only where feeding happens; portraits everywhere else; portraits render first and crossfade to 3D | Reading never waits for WebGL; the fallback is the default path, not an error path |
| D7 | One canvas rendered into DOM-tracked stage rects; drei `View` is the candidate mechanism | The DOM owns layout; the Technical Spec confirms the mechanism against the performance budget |
| D8 | cyrb53 + mulberry32, fixed draw order, `GEN_VERSION`, frozen before the rehearsal | Zero dependencies; identical output on every device; identity never changes under a code update |
| D9 | Simple view is also a user setting | Low-end devices and preference, not only failure |
| D10 | A visible Still critters setting in addition to reduced-motion detection | WCAG 2.2.2 pause requirement for persistent motion |
| D11 | `xs` breakpoint (< 360 px) collapses the grid to one column | 200 % zoom on small phones must reflow without horizontal scroll |
| D12 | Statement links open in the same tab with `rel="noopener nofollow ugc"` | Predictable; user-generated links are never endorsed |
| D13 | Auto-link only `http(s)://` URLs; visible text truncated at 48 characters | No sanitisation surface beyond one regex; long URLs don't break cells |
| D14 | Inked daylight; gold primary action; system sans, bold headings, 12/14/16/20/28 px | Answers DQ1, replaces D2 and amends D3/§1; generated semantic tokens own values |
| D15 | Exact heaps and piles, one drawn crumb per crumb; Proportional is one per four | Answers DQ4 with one shared feel setting |
| D16 | Version 2 element draw and October portrait beside frozen v1; dev/demo v2, production v1; v2 portraits only | Partly answers DQ5; exception to D6 only for v2 until mesh/style and shipping are decided |
| D17 | Circle with one critter in focus in place of the core game grid | Adopts the review’s §6.2/§6.3 departure |
| D18 | Focus row and bar combined as a dock | Giving controls remain fixed under the scene |
| D19 | Crumb heap in the middle of the circle, remaining count in the bar | Same arrangement on phone and desktop |
| D20 | Piles beside every critter’s feet | Amounts become visible in the scene |
| D21 | Centred above-head tags; whole names where they fit, ten-character short form otherwise; desktop focus tag carries its name | Preserves identity, avoids tag collisions and retains 44 px hit areas |
| D22 | Thought bubble opens fixed-height scrolling statement; phone top, desktop side panel; outside tap/Escape closes | Reading preserves the circle and dock |
| D23 | Own tag says You; own tap stirs without changing focus or giving | Own critter stays asleep and cannot receive own crumbs |
| D24 | Phone results grow from dock with playing huddle; desktop results/action bar beside it | Results remain connected to the scene |

**October adoption (2026-10-06).** D14–D24 override the earlier grid, type, control, heap and reading descriptions in §1, §3, §6 and §7 for core game screens. The generated token source is normative for Inked daylight values. Other screens inherit these tokens and keep their existing layouts.

### Open — confirm before implementation

| # | Question |
|---|---|
| DQ2 | Dark theme deferred to v1 (D1). If it must be v0, budget roughly two days for a second token set and a lighting preset |
| DQ3 | The signing step's wording avoids "wallet" entirely (`scatter.sign.body`). Confirm this reads clearly to the October council, who all use wallets |
| DQ5 | When does v2 ship to production, and will it receive a v2 mesh and 3D render style? D16 answers its present definition and development use; future species/flying critters remain undecided |

## 15. What the other documents own

| Document | From here, it must |
|---|---|
| **03 Game Design** | Use the §2 words for every sound; give every sound token the DOM state it pairs with (§12.6); define the tap/hold curve, the `fed` compression curve, `bump`, `mood`, the wake moment, the feast sequence from `dusk` to `feast` to `day`, reduced-motion rules at least as strict as §3.6, and the whole-scene performance budget that §5.3's per-critter budget rolls up into |
| **04 Technical Spec** | Generate `tokens.css` and `tokens.ts` from one source; satisfy the stage contract (§6.3) and confirm the render mechanism (D7); lazy-load the 3D module behind portraits (§11); ship the generator (§5) as a pure, versioned, dependency-free module shared by 3D, 2D, and tests; self-host the display font; wire the two announcers and focus management (§12); reference §10 string IDs from the edge-state table and add `err.*` strings here rather than inline |

### Phase 3 additions to §10

The shared copy table adds screen/burrow document titles, burrow card counts and next deadlines, visible saved-draft guidance, creator-removal/history wording, scatter receipt/unsaved-edit explanations, and accessible names for the heap and symbol buttons. The exact strings remain in `packages/shared/src/copy.ts`. A saved scatter in another tab is identified as the latest; the current screen's in-memory edits are kept, and the next save replaces the accepted scatter. No plaintext allocation is restored from the server before the feast.
