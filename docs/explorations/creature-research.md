# Critter Crumbs — Creature Research

**Exploration for discussion, not a numbered document** · 2026-10-06 · Reacts to: Afolabi's note of 2026-10-06 (below), `docs/explorations/design-directions.md` §12–§16, `docs/explorations/design-pass-2026-10.md` Appendix A, `docs/02-design-system.md` §5, PR #31 (DQ5)

Nothing here changes the generator. `GEN_VERSION` is `1` in code and frozen (D8); version 2, the element draw of PR #31, is the prototype the review page draws with and waits on DQ5. A species draw would change output for every seed again, so it belongs in the same decision.

## 1. The ask

> We need to to better design the critters to have a more diverse set of elemental creatures that exhibit the element and have a more spiritual feel as well as have both flying and ground creatures. We should research and discuss different creature ideas

Four things, then: more kinds of creature (diversity), the element shown in the creature itself (not only in accessories), a spiritual quality, and some that fly.

## 2. Where the critters are today

| Source | What it settled | What it leaves out |
|---|---|---|
| Design System §5 (version 1, shipped) | One body plan built from primitives: body, head, ears, eyes, snout, arms, legs, tail, markings; any hue | Elements; species; flight |
| PR #31 (version 2, prototype) | An `element` draw first (earth, water, fire, air) that fixes the hue band and the ear, crest, tail and marking sets and a glow colour | Still one body plan for every critter |
| The four element paintings (`docs/pitch/assets/earth.webp`, `water.webp`, `fire.webp`, `air.webp`) | The look Afolabi liked: a round sitting body, big dark eyes, a crumb held to a glowing belly; leaf, fin, flame or cloud ears; three of the four hover over a soft shadow | The four are one animal in four costumes |
| Design directions §14–§16 | One animal per element, never built: earth a large squirrel, water a turtle, fire a phoenix chick, air a flying lemur; "nature as anatomy" | Only four creatures; two of them fly |
| Appendix A, the art direction (2026-10-02) | Quoted below | — |

Appendix A, verbatim:

> CRITTERS
> Small, round, big-eyed, with slightly oversized paws. Each has one feature taken from a real plant or habitat and one element accent. Friendly and curious, never fierce. Idle motion: breathing, a blink, an ear twitch.

> STYLE
> Painted daylight. Hand-drawn critters with a loose, tapered sketch line left visible, coloured dark plum (#251C25), never black. Three-value soft-cel shading: shadows shift cool (teal, plum), lights shift warm (lime, peach, gold). Rounded, chunky shapes that read as a silhouette at 64px. Dry-brush grain only on rough things: fur, bark, shell, crumbs. No glossy 3D, no neon, no pure black or pure white.

The new ask goes past "one element accent": the element should be visible in the creature's body. That is the one point where this research proposes to move Appendix A, and it needs Afolabi's yes.

## 3. What makes a creature read as an element spirit

### Traditions worth borrowing from

- **The four elementals of Paracelsus** (16th century): gnomes of earth, undines of water, sylphs of air, salamanders of fire, described as spirit counterparts of visible nature ([Elemental](https://en.wikipedia.org/wiki/Elemental)). The salamander is a ready-made fire spirit, and sylphs are air spirits that fly.
- **The Four Symbols** of Chinese astronomy: the Azure Dragon of the east and spring, the Vermilion Bird of the south, summer and fire, the White Tiger of the west and autumn, the Black Tortoise of the north and winter ([Four Symbols](https://en.wikipedia.org/wiki/Four_Symbols)). Guardian beasts that each carry a season and a colour, two on the ground, one in the air, one serpentine. The turtle chosen for water in §14 already echoes the Black Tortoise.
- **Japanese folklore**: kodama, the spirits that live in trees, sometimes seen as small lights ([Kodama](https://en.wikipedia.org/wiki/Kodama_(spirit))); kitsunebi, foxfire, flames that float in a line and that a fox was said to strike from its tail ([Kitsunebi](https://en.wikipedia.org/wiki/Kitsunebi)). Hitodama, the floating flames, are souls of the dead ([Hitodama](https://en.wikipedia.org/wiki/Hitodama)), so they are left out.
- **The references Appendix A already names**: Avatar's spirit creatures, built from real animals; Ghibli's spirits, where nature answers the creature; Wolfwalkers, sketch lines left in; Pokémon and Pikmin, instant silhouettes.

### The cues, drawn together

| Cue | What it looks like | In the generator |
|---|---|---|
| Light from within | One soft glow point: a seed in the chest, an ember under the skin, a lit gill tip (the §13 rule, one per critter) | Exists in version 2 (`glow`, `spot`) |
| The element as material | One body part made of the element: a mossy back, a shell holding a small pool, foxfire tail tips, a woolly cloud body | A per-species part, replacing a body primitive |
| Edges that dissolve | A tail or mane that thins into mist, smoke, water or seed fluff | A tapered part with a fading fill |
| Weightlessness | Hovering a hand's height above its shadow, drifting slowly | A hover offset; the shadow stays at the feet line |
| Motes | Two or three particles that drift near it: spores, droplets, sparks, seeds | DOM or canvas particles, off under reduced motion |
| A painted mark | One calm face or brow marking in the element's light colour, like a painted rite rather than a pattern | A marking shape per element |
| The world answers | A flower opens where an earth spirit stands, a ripple spreads under a water spirit, the air shimmers over a fire spirit | One small effect at the feet, played when it is fed |

What keeps them friendly at 64 px: round dominant shapes, triangles only as small accents (flame tips, ear points), no teeth, no claws, and the big round dark eyes that are already decided. Circles read as friendly and safe; sharp triangles read as danger ([shape language](https://rocketbrush.com/blog/shape-language-in-game-character-design-how-to-make-characters-readable-and-consistent)), which "never fierce" rules out.

## 4. Ground and flying

Six body plans cover the concepts below. Every critter keeps the round body, the big eyes and a head the circle can put a tag over.

| Body plan | Moves by | Example |
|---|---|---|
| Sitter | Sits, hops | Today's critter; the squirrel |
| Walker | Four short legs, low and long | Fox, badger |
| Slider | A long low body, tail behind | Salamander, axolotl |
| Swimmer in air | Fins, no legs; swims through the air | Koi |
| Winged flier | Wings that beat or glide | Owlet, moth, phoenix chick |
| Floater | No wings; drifts | Cloud lamb |

**How fliers sit in the circle.** A flier hovers a quarter of its height above its shadow and bobs slowly (about 2.5 s a cycle). The shadow sits on the circle's foot line, its pile of crumbs beside the shadow, its tag above its head as now. The tag solver and the heap already work from each drawing's extents, so a hover offset is one more number per drawing. At the results, fliers take the back row of the huddle, hovering over the shoulders of the front row.

**How many fly.** About one critter in three. Every element gets a ground creature; air gets no ground creature at all, which suits it.

## 5. Twelve concepts

Three per element. Each keeps Appendix A's "one feature taken from a real plant or habitat" and adds the element as material and one spirit cue. Names are working names for discussion; the burrow never sees them (a critter's name is its owner's name, PRD F2).

### Earth: moss, root, stone, seed (greens and ochres)

| | Acorn squirrel | Mossback | Lichen moth |
|---|---|---|---|
| Body plan | Sitter | Walker | Winged flier |
| The element in the body | Tail a spray of oak leaves with two acorns; a sapling between the ears (§16) | The back is a mossy hillock with two tiny mushrooms and a sapling | Round furry body; wings patterned like bark, with lichen spots |
| Plant or habitat | Oak | Moss and mushrooms | Lichen; antennae like unfurling fern fronds |
| Spirit cue | Acorn caps glow faintly | Spores drift up from its back like slow fireflies; a flower opens where it stands when fed | The eyespots on its wings glow and pulse with its breathing |
| Silhouette | Upright bean with a big plume | Low dome with a sapling on top | Ball between two broad wings |

### Water: pool, river, rain, mist (teals and blues)

| | Pond turtle | Koi kite | Rain axolotl |
|---|---|---|---|
| Body plan | Walker | Swimmer in air | Slider |
| The element in the body | A shell of river stones holding a tiny pool that mirrors the sky, a lily pad afloat (§16) | Fins of thin water; the body half clear, with a light inside | Feathery gills like rain-soaked reeds; it sits in a puddle it carries with it |
| Plant or habitat | Lily pad, river stones | Pond weed trailing from a fin | Reeds |
| Spirit cue | Ripples spread from its feet across the floor | Swims slow figure-eights above its shadow; droplets hang in the air behind it | Its gill tips glow; a small rain cloud gathers over it when it is fed |
| Silhouette | Wide dome on short legs | Teardrop with a long flowing tail | Long and low, a fan of gills |

### Fire: hearth, ember, candle, sun (rusts and golds)

| | Ember fox | Hearth salamander | Phoenix chick |
|---|---|---|---|
| Body plan | Walker | Slider | Winged flier |
| The element in the body | Tail tips of foxfire: three small flames that float free behind it like lanterns | Cracks along its back glow like embers under ash | Plumage of dry autumn leaves; ember-edged wings (§16) |
| Plant or habitat | Dry grass in its ruff | Ash and a warm stone | Three smouldering seed pods as a crown (§16) |
| Spirit cue | The flames bob each on its own; an ash-white mark on its brow | Heat shimmer over it; it curls up like a coal to sleep | Hovers on slow wingbeats; embers drift down and go out |
| Silhouette | Low and round with a tail of three lights | A long round newt shape | Plump ball with two wings and a spark tail |

The ember fox is the one concept with pointed ears and a pointed face; it needs the roundest body of the twelve to stay "never fierce".

### Air: wind, cloud, sky, seed fluff (creams and sky blues)

| | Flying lemur | Dandelion owlet | Cloud lamb |
|---|---|---|---|
| Body plan | Winged flier (glides) | Winged flier | Floater |
| The element in the body | Membranes as thin as sycamore seed wings; a tail that thins into a wisp of cloud (§16) | A mantle of dandelion fluff | A woolly cloud for a body; tiny hooves that never touch the ground |
| Plant or habitat | Sycamore; ears like unfurling ferns (§16) | Dandelion | Thistle down caught in its wool |
| Spirit cue | Pale glow in its eyes (§16) | Seeds lift off its mantle when it flaps and grow back | Wisps drift off its edges and come back; a breeze stirs the grass under it |
| Silhouette | Spread kite shape | Tall round owl with two tufts | A puffy cloud with a face |

Overall: six walk, sit or slide; six fly, swim in the air or float. The §16 four are all kept.

## 6. What it would take

- **A species draw.** Element first, as in version 2, then a species from the element's three, then the species' own parameters (proportions, the element's hue band, markings, the spirit cue's variant). Re-rolls (up to four, PRD F2) can land on a different species, which makes meeting your critter more of a moment.
- **A part set per species**, drawn twice from the same parameters: the 2D portrait (the review page's `paint()` is the prototype) and the 3D recipe of primitives (Design System §5.3). Wings and fins are flattened capsules or planes; the cloud lamb is a cluster of spheres. The budget of 3,000 triangles a critter holds.
- **The layout contract grows by one number.** Each drawing already reports its extents and head (`top`, `left`, `right`, `hy`, `hr`), which the circle uses for tags, the thought bubble and the heap; fliers add a hover offset.
- **Staging.** Eight species first, a ground creature and a flier for each element (squirrel and moth, turtle and koi, fox and phoenix chick, flying lemur and cloud lamb), then the other four.
- **Timing.** A species draw changes every critter, like version 2 does. If version 2 has not landed, fold species into it so there is one change of critters, not two. Either way it is a decision for DQ5 (before the October feast, or after it so v0 runs on version 1) and a line in `docs/decisions.md`.
- **Options feasts.** Budget options get critters too (PRD §4); four options as four different creatures are easier to tell apart than four of one shape.

## 7. Prompts to see them

For Midjourney V8.2, one creature per image, built from Appendix A's style words. Give the element painting (`docs/pitch/assets/earth.webp` and so on) as the style reference so the twelve share a hand; the earlier sheets used `--sref` the same way.

Style clause (Appendix A, as prompt words): `painted daylight, hand-drawn with a loose tapered sketch line left visible in dark plum and never black, three-value soft cel shading where shadows shift cool to teal and plum and lights shift warm to lime, peach and gold, rounded chunky shapes that read as a silhouette at small size, dry-brush grain only on rough things like fur, bark, shell and crumbs, no glossy 3D, no neon, no pure black or pure white, friendly and curious, never fierce`

Parameters: `--ar 4:5 --raw --s 60 --v 8.2 --sref <element painting link> --sw 350 --no glossy, shiny, 3d render, plastic, photorealistic, hyperdetailed, teeth, claws, text, watermark, logo, signature, humans`

Each prompt is: `a small round elemental spirit creature, [concept], big round dark eyes with one small highlight, a tiny calm mouth, slightly oversized paws where it has paws, holding one bread crumb, [ground: sitting on a sunlit cream floor with a soft teal shadow | flying: hovering a hand's height above its soft teal shadow], full body, three-quarter view, plain warm paper background, [style clause] [parameters]`

The concept phrases:

1. Acorn squirrel: `a large squirrel spirit whose bushy tail is a spray of oak leaves with two acorns, a sapling growing between its ears, acorn caps on its cheeks glowing faintly`
2. Mossback: `a low round badger-like spirit whose back is a mossy hillock with two tiny mushrooms and a sapling, spores drifting up from the moss like slow fireflies, stone-grey paws`
3. Lichen moth: `a round furry moth spirit with broad wings patterned like tree bark with pale lichen spots, antennae like unfurling fern fronds, eyespots on its wings glowing softly`
4. Pond turtle: `a round turtle spirit whose shell is a cluster of river stones holding a tiny pool that mirrors the sky, a lily pad floating on it, fin-shaped ears, ripples spreading from its feet`
5. Koi kite: `a small round koi spirit swimming through the air, fins of thin clear water, its body half translucent with a soft light inside, a strand of pond weed trailing from one fin, droplets hanging in the air behind it`
6. Rain axolotl: `a pale blue axolotl spirit with feathery gills like rain-soaked reeds glowing at the tips, sitting in a small puddle, a tiny rain cloud above its head`
7. Ember fox: `a round fox kit spirit with an ash-white mark on its brow and dry grass in its ruff, three small flames floating free behind its tail like lanterns`
8. Hearth salamander: `a chubby round newt spirit whose back has cracks glowing like embers under ash, a faint heat shimmer above it, resting on a warm stone`
9. Phoenix chick: `a plump phoenix chick spirit with plumage of dry autumn leaves in rust and ochre, wing edges glowing like embers, a crown of three smouldering seed pods, three spark-tipped tail feathers`
10. Flying lemur: `a round flying lemur spirit gliding with membranes as thin as sycamore seed wings, ears like unfurling ferns, a tail that thins into a wisp of cloud, a pale glow in its eyes`
11. Dandelion owlet: `a tall round owlet spirit with a mantle of dandelion fluff, a few seeds lifting off the mantle as it flaps, two soft ear tufts`
12. Cloud lamb: `a lamb spirit whose body is a small woolly cloud with thistle down caught in it, tiny hooves that never touch the ground, wisps drifting off its edges`

To compare silhouettes, run the three of one element together: `three small round [element] spirit creatures in a row at the same scale, [concept one], [concept two], [concept three], character lineup on plain warm paper, [style clause] --ar 16:9` with the same parameters.

## 8. To decide

1. **The direction.** The element shown in the body, a spirit cue each, and some fliers, going past Appendix A's "one element accent". Yes or no.
2. **How many species.** Eight first (a ground creature and a flier per element), or all twelve.
3. **Which concepts.** Keep, drop or replace any of the twelve; the §16 four stay unless you say otherwise.
4. **Fliers in the circle.** Hovering over their shadow with a slow bob, and the back row of the huddle at the results.
5. **When.** Fold species into version 2 and decide DQ5 with it: before the October feast, or after it so October runs on version 1.

Once the direction is chosen, the next step is drawing the chosen species in the review page's renderer, so they can be judged in the circle at 64 px rather than as single paintings.
