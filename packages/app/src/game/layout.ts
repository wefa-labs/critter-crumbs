import { copy, CIRCLE_FEEL, PILE_RULE } from '@critter-crumbs/shared';
import type { PortraitExtent } from '../portraits/metrics.js';
import type { SceneTreatment, Surface } from './composition.js';
import { moundSize } from './mound-size.js';
export { moundSize };

/**
 * Where everything in the circle goes, ported from the scatter review page (geometry, slotAt, huddleAt, layoutRing)
 * and, over a sheet, the flow page (circle, heapAt). Pure: the viewport, the critters, the focus and the state's
 * composition in; rectangles out. The scene's bottom edge is the state's surface: the scattering dock, a sheet of its
 * height, or the results grown out of the dock.
 */
export interface Rect { x: number; y: number; width: number; height: number }
export interface LayoutCritter {
  name: string; own: boolean; count: number; extent: PortraitExtent;
  /** Left out of the huddle: it received no crumbs (flow page 46 gathers only the critters that were fed). */
  away?: boolean;
  /** At the feast, the scale its growth draws it at (Game Design §3.4, 1 to 1.35); the huddle spaces critters by it. */
  growth?: number;
}
export interface LayoutInput {
  viewport: { width: number; height: number };
  critters: readonly LayoutCritter[];
  focus: number;
  /** a statement open on the phone: the heap, the bubble and the tags under it give way */
  reading?: boolean;
  /** crumbs still in the heap; an empty heap over a sheet is drawn as the flow page's outlines */
  remaining?: number;
  issued: number;
  surface: Surface;
  scene: Pick<SceneTreatment, 'grown' | 'bubbles' | 'tags' | 'heap' | 'huddle'>;
  /** a tag's text width in the page's font (game/measure.ts); without it, an estimate from the letters */
  measure?: (text: string, size: number, weight: number) => number | undefined;
}

export const HEADER_HEIGHT = 64;
export const DOCK_HEIGHT = 130;
/** Desktop: with results open the dock folds to its bar, level with the panel's actions. */
export const FOLDED_DOCK_HEIGHT = 74;
/** Phone: the results grow the dock until this much floor is left above them (RESULTS_FLOOR). */
export const RESULTS_FLOOR = 196;
export const DESKTOP_MIN_WIDTH = 900;
export const sidePanelWidth = (width: number) => Math.min(480, Math.max(400, width * 0.25));
/** Phone: an open statement is a bubble across the top of the scene (.panel.bubble). */
const STATEMENT = { inset: 12, height: 378 };

/** How far apart two rectangles are, in px; 0 when they touch or overlap. */
export const rectGap = (a: Rect, b: Rect) => Math.hypot(Math.max(0, a.x - (b.x + b.width), b.x - (a.x + a.width)), Math.max(0, a.y - (b.y + b.height), b.y - (a.y + a.height)));
export const overlapArea = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
/** A target at least `min` square around a smaller drawing, centred on it, so a small one still takes a finger. */
export function hitRect(rect: Rect, min = 44): Rect {
  const width = Math.max(min, rect.width), height = Math.max(min, rect.height);
  return { x: rect.x - (width - rect.width) / 2, y: rect.y - (height - rect.height) / 2, width, height };
}
export function shortName(name: string, limit = 10) { return name.length > limit ? name.slice(0, limit - 1) + '…' : name; }
const nameWidth = (name: string) => [...name].reduce((width, ch) => width + (/[MW@]/.test(ch) ? 11 : /[ilj1 .]/.test(ch) ? 4 : 8), 0);

/**
 * A name tag's type and frame (.spot .tag): 14 px with 11 + 10 px of padding, 12 px and 9 + 8 on a crowded phone,
 * 16 px and 14 + 14 for the critter in focus on desktop, which drops its count; the border adds 3, the gap before the
 * count 6 (4 crowded).
 */
function tagStyle(focusOnDesktop: boolean, crowded: boolean) {
  if (focusOnDesktop) return { font: 16, height: 36, frame: 31, gap: 0, counted: false };
  return crowded ? { font: 12, height: 26, frame: 20, gap: 4, counted: true } : { font: 14, height: 30, frame: 24, gap: 6, counted: true };
}

function geometry(W: number, floor: number, n: number, desktop: boolean, grown: boolean) {
  const growth = grown ? 0.9 : 1;
  if (desktop) {
    const u = Math.min(W / 880, floor / 606), room = (n > 8 ? 0.78 : 1) * growth, back = CIRCLE_FEEL.desktop.back * u * room, beside = Math.cos(2 * Math.PI / n);
    const frontY = floor * 0.95, backY = Math.max(floor * 0.22, back * 1.04 + 40), ry = Math.min((frontY - backY) / (1 + beside), floor * 0.4);
    return { u, cx: W / 2, cy: backY + ry, rx: W * (n > 8 ? 0.44 : 0.42), ry, back, front: CIRCLE_FEEL.desktop.front * u * room, focusY: floor - 14 * u, focusSize: CIRCLE_FEEL.desktop.focus * u * growth, ppu: 4.2 * u, maxHeap: 210 * u };
  }
  // Short phone floors need smaller bodies as well as closer feet; otherwise the focused head blocks the tags.
  const compact = Math.min(1, floor / 550), crowd = (n > 8 ? 0.8 : n > 6 ? 0.94 : 1) * growth * compact;
  const cy = floor * (n > 8 ? 0.475 : n > 6 ? 0.455 : 0.45), ry = floor * (n > 8 ? 0.32 : n > 6 ? 0.29 : 0.28);
  // Reserve two rows of tag space above the back row instead of compressing it into the header.
  const backRow = Math.max(cy - ry, compact < 1 ? Math.min(120, floor * .34) : 0), frontRow = cy + ry;
  // However crowded or short the floor, the back row stays large enough to read a face (CIRCLE_FEEL.phone.backMin).
  const back = Math.max(CIRCLE_FEEL.phone.backMin, CIRCLE_FEEL.phone.back * crowd), front = Math.max(back, CIRCLE_FEEL.phone.front * crowd);
  return { u: 1, cx: W / 2, cy: (backRow + frontRow) / 2, rx: W * 0.34, ry: (frontRow - backRow) / 2, back, front, focusY: floor - 14, focusSize: CIRCLE_FEEL.phone.focus * compact, ppu: 3.4 * compact, maxHeap: 150 * compact };
}

/**
 * How far down the scene the scattering circle's back row stands, in pixels from the scene's top: the highest feet a
 * burrow of this size puts on the floor, grown at the feast or not. A painted plate's wall ends above it (game/plate.ts).
 */
export function circleBackRow(viewport: { width: number; height: number }, count: number) {
  const desktop = viewport.width >= DESKTOP_MIN_WIDTH, W = viewport.width - (desktop ? sidePanelWidth(viewport.width) : 0), floor = viewport.height - HEADER_HEIGHT - DOCK_HEIGHT;
  return Math.min(...[false, true].map(grown => { const geo = geometry(W, floor, count, desktop, grown); return geo.cy - geo.ry; }));
}

/** The bottom inset each surface takes from the scene. */
function surfaceHeight(surface: Surface, desktop: boolean, H: number) {
  if (surface.kind === 'dock') return DOCK_HEIGHT;
  if (surface.kind === 'results') return desktop ? FOLDED_DOCK_HEIGHT : Math.max(DOCK_HEIGHT, H - RESULTS_FLOOR);
  return desktop ? 0 : surface.height;
}

export function layoutGame(input: LayoutInput) {
  const desktop = input.viewport.width >= DESKTOP_MIN_WIDTH;
  const W = input.viewport.width - (desktop ? sidePanelWidth(input.viewport.width) : 0), H = input.viewport.height - HEADER_HEIGHT, n = input.critters.length;
  if (!n || input.focus < 0 || input.focus >= n) throw new RangeError('Invalid circle focus');
  /* the scatter page crowds the phone's tags from seven critters (data-crowd) */
  const gathered = input.scene.huddle, dockH = surfaceHeight(input.surface, desktop, H), crowded = !desktop && n > 6;
  /* a sheet sits over the floor; the circle stands on what is left of it, as on the flow page */
  const geo = geometry(W, gathered ? H - DOCK_HEIGHT : H - dockH, n, desktop, input.scene.grown);
  const dock: Rect = { x: 0, y: H - dockH, width: W, height: dockH };
  /* over a sheet there is no critter in focus: the flow page stands the circle in a plain ring (circle()), on a floor
     that runs 24 px under the sheet's rounded top on the phone, the critters 1.5 times larger on desktop */
  const ring = input.surface.kind === 'sheet', ringFloor = desktop ? H : H - dockH + 24, ringScale = desktop ? 1.5 * geo.u : 1;
  /* the huddle counts only the critters gathered on the edge */
  const huddled = input.critters.map((critter, index) => ({ critter, index })).filter(entry => !entry.critter.away);
  /* The huddle on the results' top edge (huddleAt): one row shoulder to shoulder when everyone fits, else a front row
     and a smaller back row looking out from the gaps. Each critter is spaced by the width the feast grew it to, so the
     ones that received more stand out and nobody hides behind a neighbour; the burrow's own order is kept, never a
     ranking (Game Design G3). A phone lets a small group grow into the room it has. */
  const places = new Map<number, { x: number; y: number; size: number; depth: number }>();
  if (gathered && huddled.length) {
    const m = huddled.length, base = (desktop ? CIRCLE_FEEL.huddle.desktop * geo.u : CIRCLE_FEEL.huddle.phone) * (m > 8 ? 0.88 : 1), room = W - 24;
    const drawn = (entry: typeof huddled[number], size: number) => (entry.critter.extent.right - entry.critter.extent.left) * size * (entry.critter.growth ?? 1);
    // neighbours' drawings meet by no more than this share of their mean width
    const SHOULDER = 0.82;
    const step = (row: typeof huddled, i: number, size: number) => (drawn(row[i - 1]!, size) + drawn(row[i]!, size)) / 2 * SHOULDER;
    const span = (row: typeof huddled, size: number) => row.slice(1).reduce((sum, _, i) => sum + step(row, i + 1, size), 0) + (drawn(row[0]!, size) + drawn(row.at(-1)!, size)) / 2;
    // the size a row reaches: up to 1.3 times the base on a phone with room to spare, never wider than the scene
    const fit = (row: typeof huddled) => Math.min(base * (desktop ? 1 : 1.3), base * room / span(row, base));
    // one row when everyone fits at full size, so nobody stands behind anybody; else the scatter page's two
    const single = fit(huddled) >= base, front = single ? m : m <= 5 ? m : Math.ceil(m / 2) + 1, back = m - front, row = huddled.slice(0, front), size = fit(row);
    let x = W / 2 - span(row, size) / 2 + drawn(row[0]!, size) / 2;
    const frontX = row.map((entry, i) => (x += i ? step(row, i, size) : 0));
    row.forEach((entry, rank) => places.set(entry.index, { x: frontX[rank]!, y: dock.y + size * 0.1, size, depth: 3200 + rank }));
    huddled.slice(front).forEach((entry, i) => {
      const gap = Math.max(0, Math.min(front - 2, Math.floor((front - 1 - back) / 2) + i));
      // stood far enough back that a face shows over the front row's heads
      places.set(entry.index, { x: (frontX[gap]! + frontX[gap + 1]!) / 2, y: dock.y - size * 0.4, size: size * 0.9, depth: 3100 + front + i });
    });
  }
  const slots = input.critters.map((critter, index) => {
    const slot = (index - input.focus + n) % n, away = gathered && !!critter.away;
    let x = geo.cx, y = geo.focusY, size = geo.focusSize, depth = 999, face: 'left' | 'right' | 'front' = 'front', ringSize = 0;
    if (gathered) {
      /* a critter left out of the huddle keeps the first place, unseen, as it always has */
      const place = places.get(index) ?? places.get(huddled[0]?.index ?? index) ?? { x: W / 2, y: dock.y, size: CIRCLE_FEEL.huddle.phone, depth: 3200 };
      ({ x, y, size, depth } = place);
      face = x < W / 2 ? 'right' : 'left';
    } else if (ring) {
      const angle = (90 - slot * 360 / n) * Math.PI / 180, sin = Math.sin(angle), cos = Math.cos(angle);
      ringSize = 66 + 32 * (sin + 1) / 2;
      x = W * (0.5 + 0.36 * cos); y = ringFloor * (0.67 + 0.19 * sin); size = ringSize * ringScale; depth = Math.max(1, Math.round(y));
      face = cos > 0.2 ? 'left' : cos < -0.2 ? 'right' : 'front';
    } else if (slot !== 0) {
      const angle = (90 - slot * 360 / n) * Math.PI / 180, sin = Math.sin(angle);
      x = geo.cx + geo.rx * Math.cos(angle); y = geo.cy + geo.ry * sin; size = geo.back + (geo.front - geo.back) * (sin + 1) / 2; depth = Math.max(1, Math.round(y));
    }
    const width = Math.round(size), height = Math.round(size * 1.25), ext = critter.extent;
    const stage: Rect = { x: x - width / 2, y: y - height * 140 / 150, width, height };
    const figure: Rect = { x: stage.x + ext.left * width, y: stage.y + ext.top * height, width: (ext.right - ext.left) * width, height: y + 3 - (stage.y + ext.top * height) };
    /* while scattering, the pile at the feet takes a share of the critter's box: its drawing width × 1.1, in percent
       (pileSvg). At the feast, what each critter received heaps beside it at a sixth of a glyph a crumb and 1.9 px a
       unit (flow page 44), since a pile of every crumb received would dwarf the critter */
    const feastPile = ring && input.scene.grown, glyphs = feastPile ? Math.ceil(critter.count / 6) : PILE_RULE === 'exact' ? critter.count : Math.ceil(critter.count / 4);
    const pileSize = moundSize(glyphs), pileWidth = !critter.count ? 0 : feastPile ? pileSize.width * 1.9 * ringScale : pileSize.width * 1.1 / 100 * width, pileHeight = pileWidth * pileSize.height / pileSize.width;
    const pile: Rect & { glyphs?: number } = feastPile
      ? { x: x + ringSize / 13 / 100 * W - pileWidth / 2, y: y + 0.01 * ringFloor - pileHeight, width: pileWidth, height: pileHeight, glyphs }
      : { x: stage.x + 0.54 * width, y: stage.y + 0.98 * height - pileHeight, width: pileWidth, height: pileHeight };
    /* a tag's width from its text, measured as the scatter page measures it */
    const name = critter.own ? copy['scatter.own.short'] : critter.name, style = tagStyle(slot === 0 && desktop, crowded);
    const text = (value: string) => input.measure?.(value, style.font, critter.own ? 700 : 800) ?? nameWidth(value) * style.font / 14;
    const count = style.counted && !critter.own ? style.gap + text(String(critter.count)) : 0;
    const fullWidth = Math.ceil(text(name) + style.frame + count) + 2, shortWidth = Math.ceil(text(shortName(name)) + style.frame + count) + 2;
    /* a thought bubble rides just right of the top of the drawing (the flow page's .cr .bubble) */
    const bubbleWidth = desktop ? 46 : 34;
    const ownBubble: Rect = { x: stage.x + 0.62 * width, y: figure.y - bubbleWidth * 0.85 * 0.78, width: bubbleWidth, height: bubbleWidth * 0.85 };
    return { index, slot, away, stage, figure, pile, foot: { x, y }, depth, face, fullWidth, shortWidth, name, ownBubble,
      tag: { x: x - fullWidth / 2, y: figure.y - 4 - style.height, width: fullWidth, height: style.height, hidden: !input.scene.tags || gathered || slot === 0 && !desktop, short: false } };
  });
  const focused = slots.find(it => it.slot === 0)!, extent = input.critters[focused.index]!.extent;
  const headR = extent.headRadius * focused.stage.width, headY = focused.stage.y + extent.headY * focused.stage.height;
  const obstacles = slots.filter(it => it.pile.width && it.slot !== 0).map(it => it.pile);

  /* the heap of crumbs left, in the middle of the circle where it covers least (heapNode) */
  const full = moundSize(PILE_RULE === 'exact' ? input.issued : Math.ceil(input.issued / 4));
  const top = geo.cy - geo.ry + 12 * geo.u, bottom = desktop ? focused.figure.y - 4 - 28 - 12 : Math.min(focused.figure.y, headY - headR * 1.05 - 56) - 6;
  let ppu = Math.min(geo.ppu, geo.maxHeap / full.width, Math.max(1, bottom - top) / full.height), heapWidth = full.width * ppu, heapHeight = full.height * ppu;
  const span = Math.max(0, bottom - top - heapHeight), middle = top + span / 2;
  const heap: Rect = { x: geo.cx - heapWidth / 2, y: middle, width: heapWidth, height: heapHeight };
  const showHeap = input.scene.heap !== 'none' && !gathered;
  if (showHeap && ring) {
    /* in the ring the heap stands at the middle of the floor, its base 55 % down (heapAt(50, 55, …)); empty, it is
       the 60 px of faint outlines the flow page draws */
    if (!input.remaining) { const outline = moundSize(3); ppu = 60 * ringScale / outline.width; heapWidth = outline.width * ppu; heapHeight = outline.height * ppu; }
    else { ppu = 1.9 * ringScale; heapWidth = full.width * ppu; heapHeight = full.height * ppu; }
    Object.assign(heap, { x: W / 2 - heapWidth / 2, y: ringFloor * 0.55 - heapHeight, width: heapWidth, height: heapHeight });
  } else if (showHeap) {
    const around = slots.filter(it => it.slot !== 0).flatMap(it => [it.figure, { x: it.foot.x - it.shortWidth / 2, y: it.figure.y - 32, width: it.shortWidth, height: 28 }]);
    let least = Infinity;
    for (let step = 0; step <= 10; step++) {
      const y = top + span * step / 10, box = { ...heap, y }, cost = around.reduce((sum, other) => sum + overlapArea(box, other), 0) + Math.abs(y - middle) * 0.5;
      if (cost < least) { least = cost; heap.y = y; }
    }
    if (!input.reading) obstacles.push(heap);
  }

  /* the focused critter's bubble on the phone; every critter's but your own when statements open */
  const bubble: Rect = { x: Math.min(focused.foot.x + Math.max(headR * 0.55, desktop ? focused.fullWidth / 2 + 6 : 0), W - 58), y: headY - headR * 1.05 - 40, width: 52, height: 44 };
  const candidates = [bubble, { ...bubble, x: Math.max(focused.foot.x - Math.max(headR * 0.55, desktop ? focused.fullWidth / 2 + 6 : 0) - 52, 6) }, { ...bubble, y: bubble.y - 16 }];
  const bestBubble = candidates.map((box, index) => ({ box, cost: slots.reduce((sum, it) => sum + (it.slot === 0 ? 0 : overlapArea(box, it.figure)), 0) + index * 40 })).sort((a, b) => a.cost - b.cost)[0]!.box;
  if (input.scene.bubbles === 'focus' && !input.reading) obstacles.push(bestBubble);
  const bubbles = input.scene.bubbles === 'all' ? slots.filter((_, index) => !input.critters[index]!.own).map(it => ({ index: it.index, rect: it.ownBubble }))
    : input.scene.bubbles === 'focus' ? [{ index: focused.index, rect: bestBubble }] : [];

  /* open on the phone, the statement is a bubble across the top, three puffs rising to it from the focused head */
  const statement: Rect = { x: STATEMENT.inset, y: STATEMENT.inset, width: W - STATEMENT.inset * 2, height: STATEMENT.height };
  const trailFrom = { x: focused.foot.x + headR * 0.8, y: headY - headR - 6 }, trailTo = { x: Math.min(focused.foot.x + headR + 36, W - 40), y: statement.y + statement.height + 6 };
  const trail: Rect[] = !desktop && input.reading ? [0.18, 0.5, 0.8].map((along, i) => { const size = [8, 11, 15][i]!; return { x: trailFrom.x + (trailTo.x - trailFrom.x) * along - size / 2, y: trailFrom.y + (trailTo.y - trailFrom.y) * along - size / 2, width: size, height: size }; }) : [];

  /* the tags, centred above each head and solved together so a tall back critter leaves room (layoutRing). Each tag
     first looks for room near its own critter rather than drifting up the room to find it, which left tags naming
     nobody on short phones and on 1280 px desktops (QA lifecycle-03) */
  const visible = slots.filter(it => !it.tag.hidden), tolerance = desktop ? (input.viewport.width === 1280 ? 161 : 0) : n > 8 ? 123 : 0;
  // On short floors portrait bounds are soft obstacles; readable tags, crumbs and controls retain priority.
  const compactLabels = !desktop && H - dockH < 550;
  const blocked = (box: Rect) => (showHeap && overlapArea(box, { x: heap.x - 2, y: heap.y - 2, width: heap.width + 4, height: heap.height + 4 }) > 0) || obstacles.some(other => overlapArea(box, other) > 0) || box.y + box.height > dock.y;
  const widthsOf = (it: typeof visible[number]) => it.shortWidth < it.fullWidth && !(it.slot === 0 && desktop) ? [it.fullWidth, it.shortWidth] : [it.fullWidth];
  type Candidate = { box: Rect; short: boolean; cost: number };
  const distinct = (options: (Candidate & { valid?: boolean })[]) => {
    const seen = new Set<string>();
    return options.filter(option => {
      const key = `${option.box.x},${option.box.y},${option.box.width}`;
      if (option.valid === false || seen.has(key)) return false;
      seen.add(key); return true;
    }).sort((a, b) => a.cost - b.cost);
  };
  /** Spots within `reach` tag heights of the tag's own critter: centred above it or under its feet, and with `nudge`
   *  also shifted sideways or beside the body. Sitting over a neighbour costs less than drifting away from its own. */
  const near = (it: typeof visible[number], reach: number, nudge: boolean, strict: boolean) => distinct(widthsOf(it).flatMap((width, shortIndex) => {
    const height = it.tag.height, limit = height * reach, centre = it.foot.x - width / 2, above = it.figure.y - 4 - height, options: Candidate[] = [];
    const place = (x: number, y: number, preference: number) => {
      const box: Rect = { x: Math.min(Math.max(x, 6), W - 6 - width), y: Math.max(2, y), width, height }, distance = rectGap(box, it.figure);
      if (distance > limit || width > W - 12 || blocked(box)) return;
      const others = slots.reduce((sum, other) => other === it ? sum : sum + overlapArea(box, other.figure), 0);
      // strict: no more over a neighbour than the scatter page allows (its tolerance), as long as that keeps tags near
      if (strict && !compactLabels && slots.some(other => other !== it && overlapArea(box, other.figure) > tolerance)) return;
      options.push({ box, short: shortIndex > 0, cost: distance / 2 + preference + shortIndex * 20 + others / 40 + overlapArea(box, it.figure) / 8 });
    };
    for (let lift = 0; lift <= limit; lift += 4) for (const shift of nudge ? [0, -0.25, 0.25, -0.5, 0.5] : [0]) place(centre + shift * width, above - lift, lift / 4 + Math.abs(shift) * 12);
    if (nudge) for (const along of [0, 0.25, 0.5]) {
      const y = it.figure.y + it.figure.height * along;
      place(it.figure.x - width - 4, y, 8 + along * 8); place(it.figure.x + it.figure.width + 4, y, 8 + along * 8);
    }
    const below = Math.max(it.foot.y + 6, it.pile.y + it.pile.height + 6);
    for (let drop = 0; drop <= limit; drop += 4) place(centre, below + drop, 12 + drop / 4);
    return options;
  })).slice(0, 24);
  const wide = (it: typeof visible[number]) => {
    const above = it.figure.y - 4 - it.tag.height;
    const positions = Array.from({ length: 65 }, (_, i) => above - i * 4);
    if (compactLabels) {
      const below = Math.max(it.foot.y + 6, it.pile.y + it.pile.height + 6);
      positions.push(...Array.from({ length: 9 }, (_, i) => below + i * 4));
    }
    return distinct(widthsOf(it).flatMap((width, shortIndex) => positions.map(y => {
      const box: Rect = { x: Math.min(Math.max(it.foot.x - width / 2, 6), W - 6 - width), y: Math.max(2, y), width, height: it.tag.height };
      const hit = slots.reduce((maximum, other) => other === it ? maximum : Math.max(maximum, overlapArea(box, other.figure)), 0);
      return { box, short: shortIndex > 0, cost: Math.abs(y - above) / 4 + (y > above ? 10 : 0) + shortIndex * 20 + hit, valid: width <= W - 12 && !blocked(box) && (hit <= tolerance || compactLabels) };
    })));
  };
  /* the tightest tag is placed first, every choice re-checked against the tags already placed, backing off when stuck */
  function solve(choices: { it: typeof visible[number]; candidates: Candidate[] }[], budget: number) {
    const assigned: Rect[] = [], selected = new Map<number, Candidate>();
    let attempts = 0;
    function fit(index: number): boolean {
      if (index === choices.length) return true;
      if (++attempts > budget) return false;
      // Re-evaluate the tightest remaining tag after each placement. A fixed order exhausts the search on short floors.
      const remaining = choices.filter(choice => !selected.has(choice.it.index)).map(choice => ({
        it: choice.it, candidates: choice.candidates.filter(candidate => !assigned.some(other => overlapArea(candidate.box, other) > 0)),
      })).sort((a, b) => a.candidates.length - b.candidates.length);
      const { it, candidates: options } = remaining[0]!;
      if (!options.length) return false;
      for (const candidate of options) {
        if (assigned.some(other => overlapArea(candidate.box, other) > 0)) continue;
        assigned.push(candidate.box); selected.set(it.index, candidate);
        if (fit(index + 1)) return true;
        assigned.pop(); selected.delete(it.index);
      }
      return false;
    }
    return { fitted: fit(0), selected };
  }
  /* Near first, widening only as far as it must: centred (the review page's tags) within one tag height, then one and
     a half, then nudged sideways or beside, all clear of other critters as the review page asks; then over part of a
     neighbour rather than away from its own; still stuck, the wide search's spots, far dearer, join for the tags that
     need them, so only those drift */
  let choices: { it: typeof visible[number]; candidates: Candidate[] }[] = [], fitted = false, selected = new Map<number, Candidate>();
  // each stage gets a search budget; a strict stage that would take long to fail gives way to the next, which is cheap
  for (const [candidatesOf, budget] of [[(it: typeof visible[number]) => near(it, 1, false, true), 300], [(it: typeof visible[number]) => near(it, 1.5, false, true), 1000],
    [(it: typeof visible[number]) => near(it, 1.5, true, true), 1000], [(it: typeof visible[number]) => near(it, 1.5, true, false), 2000],
    [(it: typeof visible[number]) => distinct([...near(it, 1.5, true, false), ...wide(it).map(option => ({ ...option, cost: option.cost + 100 }))]), 4000]] as const) {
    choices = visible.map(it => ({ it, candidates: candidatesOf(it) }));
    ({ fitted, selected } = solve(choices, budget));
    if (fitted) break;
  }
  for (const it of visible) {
    const choice = selected.get(it.index) ?? choices.find(entry => entry.it === it)?.candidates[0];
    if (choice) it.tag = { ...choice.box, short: choice.short, hidden: !!input.reading && !desktop && overlapArea(choice.box, statement) > 0 };
    else if (!fitted) it.tag = { ...it.tag, y: Math.max(2, it.tag.y) };
  }
  return { desktop, crowded, scene: { x: 0, y: HEADER_HEIGHT, width: W, height: H }, dock, statement, heap: showHeap ? heap : null, bubble: bestBubble, bubbles, trail, slots, ppu, unit: geo.u };
}
