# Initial Phase 3 assets

Specific music and external sound sourcing are deferred by Afolabi's approval. The current implementation uses authored procedural assets and a local font; it makes no runtime request to an asset service.

| Asset | Source | Licence / provenance | Shipped size |
|---|---|---|---|
| Critter portraits | `generate(address, variant)` and `layout(params)` from the reviewed core, GEN_VERSION 1 | Project-authored SVG elements; no supplied markup | Code, no individual image downloads |
| Arrival illustration | Existing `docs/pitch/assets/scene-day.webp` | Existing project artwork, reused as approved | 99,906 bytes, WebP, resized to fit 960 × 720 |
| Young Serif Latin | [Google Fonts upstream](https://github.com/google/fonts/tree/main/ofl/youngserif) `YoungSerif-Regular.ttf` | SIL OFL 1.1; full licence in `packages/app/public/licenses/young-serif-OFL.txt` | 27,244 bytes, WOFF2 |
| Effects | Five Web Audio voices specified in Game Design §5 | Project-authored synthesis; implementation in ticket 09 | No recorded FX files |
| Ambient bed | Deferred | No composer or source selected; no placeholder remote track | Not shipped |

The Latin font subset was made with isolated FontTools 4.59.2 / Brotli 1.1.0, preserving layout features, from the upstream TTF. Included code points: U+0000–00FF, 0131, 0152–0153, 02BB–02BC, 02C6, 02DA, 02DC, 0304, 0308, 0329, 2000–206F, 20AC, 2122, 2191, 2193, 2212, 2215, FEFF, FFFD. Asset tools are outside the app dependency graph.

Renderer colours use the [CSS Color 4 conversion matrices](https://www.w3.org/TR/css-color-4/#color-conversion-code). Chroma alone is reduced to fit sRGB, preserving the generator's lightness/hue. The same returned sRGB colours serve SVG and later mesh materials; renderer conversion does not change generator output.

Web Audio implementation reference, checked2026-09-06: the normative [Web Audio specification](https://webaudio.github.io/web-audio-api/) defines scheduled AudioParam automation, compressor nodes and context time; MDN's [OfflineAudioContext.startRendering](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/startRendering) documents offline DSP rendering. Sound voices use that rendering path for measured browser checks. No downloaded effects or music library is used.

October 2026: the adopted Inked daylight look uses system sans throughout; the unused Young Serif file and OFL copy were removed (D14). The row above records the historical phase-3 asset.

October 2026: the effects and ambient-bed rows are history too. The settled sound set, with recorded effects, stings, a feast cue and four music loops, is recorded in [audio-assets.md](audio-assets.md).
