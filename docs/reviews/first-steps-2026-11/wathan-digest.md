# Refactoring UI (Wathan and Schoger): digest for explaining a product on screen

Page numbers: PDF index equals printed page (offset 0); pp. 1-5 are unnumbered front matter. Chapters: SfS Starting from Scratch, Hier Hierarchy is Everything, L&S Layout and Spacing, Text Designing Text, Color Working with Color, Img Working with Images, FT Finishing Touches. The book has no onboarding or progressive-disclosure section; each *Phone* line is my application, not the authors' advice.

## 1. Principles

1. **Start with a feature, not a layout; be a pessimist** [SfS 8-10, 16-19]. Design one real function first, shell later; build the smallest useful version and do not depict what you cannot yet ship. *Phone:* design the one what-you-do-here moment before any carousel or nav; show a go-deeper door only once the room behind it exists.
2. **Detail comes later (the Hold the color sub-section)** [SfS 12-14]. Work coarse and in grayscale so spacing, contrast and size carry the hierarchy; add color, type and shadow afterwards. *Phone:* if reading order is unclear in grayscale at phone width, painted art will not fix it.
3. **Choose a personality** [SfS 20-26]. Four levers: typeface (rounded sans is playful), color, corner radius (never mix square and round) and wording. Study what your audience uses; do not mimic competitors. *Phone:* let friendly words and rounded type carry the play, the same on every screen.
4. **Limit your choices** [SfS 28-32; L&S 70-74; Text 102-107]. Fix small scales in advance (shades, type, spacing, shadow, radius) and pick by comparing neighbors. *Phone:* settle four or five text sizes and a short spacing ladder once.
5. **Not all elements are equal; size isn't everything** [Hier 36-41]. Hierarchy is what makes an interface feel designed. Use weight and color, not size alone. *Phone:* keep explanatory text readable and make it secondary with a softer color, not tiny type.
6. **Emphasize by de-emphasizing; no grey on color** [Hier 42-47]. Quiet the rivals of the key element. On colored grounds, lower contrast with a same-hue tint; grey or transparency looks washed out. *Phone:* on tinted or painted grounds, derive secondary text from the background hue.
7. **Labels are a last resort** [Hier 48-52]. Let format or context identify data, fold label into value, and make any remaining label secondary. *Phone:* state facts as phrases, not caption plus number.
8. **Semantics are secondary** [Hier 60-62]. Rank actions: one primary (solid), a few secondary (outline or low contrast), tertiary as links. *Phone:* one solid button per screen; skip and the technical how-it-works door as links.
9. **Start with too much white space; avoid ambiguous spacing** [L&S 66-69, 96-99]. Begin generous and trim; keep more space around a group than inside it. *Phone:* one idea per screen; captions hug their picture, bigger gaps between steps.
10. **You don't have to fill the whole screen** [L&S 76-82]. Use only the width needed; design mobile first at about 400px, then adapt; use columns rather than stretching. *Phone:* this is your native canvas; on desktop keep a narrow centered column.
11. **Grids are overrated; relative sizing doesn't scale** [L&S 84-95]. Prefer fixed or maximum widths; do not scale sizes proportionally, since large type must shrink faster on small screens. *Phone:* set phone headline and padding sizes independently (book's example: 20-24px headline over 14px body).
12. **Keep line length in check; line-height is proportional** [Text 114-116, 122-125]. 45-75 characters per line; about 1.5 leading for narrow text, up to 2 for wide, about 1 for big headlines. *Phone:* lines are already short; tighten headline leading.
13. **Align with readability in mind (plus baseline, not center)** [Text 118-120, 128-131]. Left-align; center only two or three lines (shorten copy rather than center a long block); share a baseline across mixed sizes. *Phone:* a centered welcome headline is fine; explanations go left.
14. **Supercharge the defaults** [FT 220-222]. Upgrade what exists: icon bullets (content-specific, such as a padlock for security points), brand-colored selected states and links. *Phone:* make step lists icon-led rows in the brand color.
15. **Add color with accent borders** [FT 224-226]. A thin colored bar on a card, under a headline, beside an alert or across the page adds polish without illustration skill. *Phone:* a short accent underline beneath titles; an accent edge on the optional technical card.
16. **Decorate your backgrounds; keep text contrast consistent** [FT 228-232; Img 202-206]. Tint a panel, or use a gentle gradient (hues within 30 degrees), a faint pattern or one placed shape. Text over imagery needs an overlay, lowered image contrast, a one-color tint or a wide soft glow. *Phone:* painted scenery sits beside or behind copy at low contrast; captions get a scrim.
17. **Don't overlook empty states** [FT 234-236]. The book calls them "a user's first interaction with a new product or feature" (p. 236): give them an illustration and an emphasized call to action, and hide tabs and filters until content exists. *Phone:* a first-run screen is a teaching moment: art, one sentence, one button.
18. **Use fewer borders; think outside the box** [FT 238-246]. Separate with soft shadow, tint or space; rebuild stock components (selectable cards for radio buttons, rich sectioned dropdowns). *Phone:* choices as illustrated tap-cards; steps divided by space and tint, not ruled boxes.
19. **Everything has an intended size** [Img 208-213]. Do not enlarge small icons (set them in a tinted shape) or shrink full screenshots (crop, or draw a simplified UI with bars for text). *Phone:* explain with simplified drawings, not miniature screenshots.
20. **Don't rely on color alone; greys don't have to be grey** [Color 158-168]. Pair color with icons or contrast; flip to dark text on a light tint; a little saturation warms or cools neutrals. *Phone:* mark states (hidden versus opened) with icon and word as well as tint; warm neutrals suit a warm palette.

## 2. Hierarchy on an explanation screen

- **Tiers (pp. 38-41):** primary in dark, heavy type (the screen's one idea), secondary in mid grey (supporting sentence), tertiary in light grey (step counts, fine print). Two weights suffice (400/500 and 600/700); avoid weights under 400 for UI text.
- **De-emphasize to emphasize (pp. 46-47):** soften inactive controls; drop the background of a panel competing with the content.
- **Labels (pp. 48-52):** skip them when format or context tells; merge label and value into one phrase; otherwise small and quiet. Emphasize labels only where readers search by label.
- **Visual versus document hierarchy (pp. 54-55):** headings for meaning, size by importance; section titles often act as labels, can be small (example: 24px down to 16px) or visually hidden.
- **Weight and contrast (pp. 56-59):** heavy elements such as solid icons feel emphasized, so soften their color; widen a thin border rather than darken it.
- **Actions (pp. 60-62):** most pages have one true primary action, a couple of secondary, a few tertiary: solid, outline or low-contrast, link-like. Destructive actions stay quiet until a confirmation step.

## 3. Text

- **Line length (pp. 114-116):** 45-75 characters (about 20-35em); cap paragraph width even in wider layouts.
- **Type scale (pp. 102-107):** hand-picked; the book's example runs 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72px. Modular ratios give fractions and too few UI sizes. Define sizes in px or rem, not em.
- **Line-height (pp. 122-125):** inversely proportional to font size; grows with line length.
- **Alignment (pp. 118-120, 128-131):** left; center short blocks only; right-align numbers; hyphenate justified text; baseline-align mixed sizes.
- **Letter-spacing (pp. 132-134):** mostly leave alone; tighten large headlines set in a text face; widen small all-caps.
- **Links (pp. 126-127):** where most things are links, use weight or darker color; ancillary links may show underline or color only on hover. Touch has no hover, so (my inference) use weight or underline.
- **Reading versus UI text:** neutral sans or system stack is safest for UI (pp. 108-109); avoid condensed short-x-height faces for body (p. 110); headline faces rarely work small (p. 133); light weights only for large headings (p. 40).

## 4. Layout and spacing

- **White space first (pp. 66-69):** trim from generous; dense is a deliberate exception.
- **Scale (pp. 70-74):** non-linear, neighbors at least about 25% apart, base 16px (example: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128...).
- **Screen width (pp. 76-82):** use the width needed; start at about 400px; columns on wide screens.
- **Grids and relative sizing (pp. 84-95):** fixed widths for sidebar-like parts; maximum width, shrinking only below it; headline-to-body ratio and padding need not scale together.
- **Ambiguous spacing (pp. 96-99):** forms, headings, bullet lists and horizontal groups all need more space between groups than within.

## 5. Finishing touches and personality

- **Start small (pp. 8-19):** start with a feature (even the nav may prove unnecessary); sketch with a thick marker, ignore type, shadow and icon choices; hold the color; wireframes are disposable; work in cycles and build the real thing early; nice-to-haves later.
- **Personality (pp. 20-26):** serif elegant, rounded sans playful, neutral sans plain; blue safe, gold expensive, pink fun; small radius neutral, large playful, none formal; casual wording is friendlier, and words matter as much as color or type.
- **Finishing (pp. 220-246; see entries 14-18):** promoted pull-quote (221); accent bars on cards, active nav and alerts (224-225); one-edge pattern or dotted-map background (230-232); shadows suit elements that differ in color from the background (239); merge related table columns to add hierarchy (244).
- **Leveling Up (pp. 250-252):** only study habits: note design choices you would not have made, and rebuild favorite interfaces from scratch.

## 6. Illustration, icons and going deeper

- **Illustration:** the book's examples serve personality and emphasis, not diagrams: empty-state art with a call to action (p. 235), a big faint graphic behind a headline (p. 236), shapes and pattern chunks (pp. 231-232). Overlap and larger shadows add layers and focus (pp. 180-184, 194-196). Use good final imagery; placeholders swapped later never work (pp. 200-201).
- **Product pictures (pp. 208-212):** a shrunken screenshot is unreadable; use a smaller-layout capture, a cropped or zoomed area (p. 211) or a simplified drawing with bars for text (p. 212).
- **Icons versus illustration at size (pp. 208-209, 212-213):** icons drawn for 16-24px look chunky at 3-4 times the size, so enclose them in a tinted shape or use art drawn for that size; large art shrunk small turns to mush, so redraw it simplified.
- **Going deeper:** progressive disclosure is not covered. Nearest: tertiary actions as quiet links (p. 61); ancillary links unemphasized until hover (p. 127); section titles may be hidden (p. 55); hide controls that do nothing yet (p. 236); smallest version first (pp. 18-19); richer panels and selectable cards (pp. 243, 246). Nothing on accordions, expanders, learn-more flows or step sequences.
