# Floor plates

The painted rooms the circle stands in while a feast is played: one painting per scene and device, seen from above, with the wall arching over the top and the floor filling the rest. They replace the floor that was cropped from the paintings, mirrored and tilted onto a plane (design pass §22 and §26). Asked for on 11 October 2026: "better background images for the gameplay that has more of a floor and wall", "building off the background images we currently have".

| Plate | Painted from | Take | Size | Wall foot | SHA-256 |
|---|---|---|---|---|---|
| `window-plate-phone.webp` | `window.webp` | `window:phone:d` | 887 × 1774 | 0.16 | `997ab4e4…c5c3a8` |
| `window-plate-desktop.webp` | `window.webp` | `window:desktop:a` | 1536 × 1024 | 0.215 | `7d33296f…df7779` |
| `dusk-plate-phone.webp` | `dusk.webp` | `dusk:phone:a` | 887 × 1774 | 0.135 | `db07e8ca…580ffc` |
| `dusk-plate-desktop.webp` | `dusk.webp` | `dusk:desktop:a` | 1536 × 1024 | 0.22 | `fe0b7094…e7da35` |

They are in `packages/app/public/scenes`, described in `manifest.json` there. The Entrance scene has no plate and is still drawn from crops; the live game shows only Window and Dusk. The launcher and the screens with a sheet still show the whole paintings.

## How they were made

Painted on 11 October 2026 with the image generation tool built into OpenAI's Codex CLI (version 0.162.0-alpha.17.2, driven by `gpt-6-astra`; the tool does not say which image model it runs), signed in to Afolabi's Codex account. Each take had two images attached: the scene's own painting, as the reference for the place, its things, its colours and its hand, and a rough block-in of the layout. The words are the project's own plate prompts (the scatter review page's `SCENE_STYLE`, `VIEW` and `PLATES`) with the wall changed from a straight band to an arch. Nothing was retouched: a take is converted to WebP at quality 84 and nothing else.

Nine takes were painted in all: five of Window for the phone while the layout was being found, two of Dusk for the phone, one of each scene for desktop. The four in the table are the ones shipped.

To paint again (each run sends the painting and the block-in to OpenAI, and bills the account):

```bash
sh docs/explorations/floor-plates/paint.sh window:phone:f dusk:desktop:b
```

```bash
sh docs/explorations/floor-plates/to-webp.sh window phone f
```

`plans.sh` draws the block-ins, `prompts.mjs` writes the words for a take, `paint.sh` runs Codex once per take, and `to-webp.sh` puts a take in the app. Working files go to `.scratch/floor-plates`, which git ignores. Then measure where the wall ends in the middle of the new plate, as a share of its height, and set `wallFoot` in the manifest. They need the Codex CLI, ImageMagick 7 and `cwebp`.

## The rule a plate follows

The circle is laid out before the room is: where each critter stands depends on the screen and on the size of the burrow (`packages/app/src/game/layout.ts`), and no critter may stand on a wall. So:

- **The wall is an arch, not a band.** The circle's back row stands about 14 % down the phone's scene and 22 % down the desktop's, and the critters either side of it stand lower. A wall that follows that curve can be low in the middle and tall in the corners, which is where the roots, the shelf and the table go.
- **The app raises a plate until its wall ends 8 px above the back row** (`packages/app/src/game/plate.ts`). `wallFoot` says where the wall ends in the middle: the foot of the wall, or of the steps under the round opening. On a short screen, such as a phone inside another app's browser, the row stands higher, so more of the top of the wall leaves the screen; the floor always meets the feet.
- **Things on the floor may be stood on.** A cushion, a mat or the bottom step can run under the back row; a table cannot. Keep the table's front edge no more than 4 % of the plate's height below the wall foot, and to one side.
- **The middle of the floor is plain**: large flagstones, even light, nothing standing on it, because critters, name tags and the heap are read against it. The foot of the plate is under the dock.
- A phone plate is 1 : 2 and a desktop plate 3 : 2. A scene of another shape loses the plate's sides or its foot, never its top.

The image tool paints the wall and the props about half as tall again as a block-in draws them. Raising the plate absorbs that, so the block-ins are left as they were for the takes shipped.
