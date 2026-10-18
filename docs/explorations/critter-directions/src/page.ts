/**
 * The critter direction review page: production today (version 1), faithful version 2 and the two exploration
 * directions, side by side on the same addresses and variants, at the app's own sizes and in its own layouts.
 * Built into ../lib/directions.js by build.mjs; nothing here is app code.
 */
import { generate, generate2, type CritterV2 } from './core-shim.ts';
import { createPortrait } from '../../../../packages/app/src/portraits/index.ts';
import { paintV2 } from '../../../../packages/app/src/portraits/painter-v2.ts';
import { portraitMetrics, type PortraitExtent } from '../../../../packages/app/src/portraits/metrics.ts';
import { layoutGame, circleBackRow, HEADER_HEIGHT } from '../../../../packages/app/src/game/layout.ts';
import { plateLift } from '../../../../packages/app/src/game/plate.ts';
import { faceCrop } from '../../../../packages/app/src/game/styles.ts';
import members from '../../../../packages/app/src/dev/game-members.ts';
import { paintGarden, gardenDraw, gardenLayout, SPECIES_NAMES } from './garden.ts';
import { paintCompanion, companionDraw, companionLayout, PLAN_NAMES } from './companions.ts';

type State = { asleep?: boolean; delighted?: boolean; fed?: number };
interface Direction { id: string; name: string; note: string; paint: (m: Member, s?: State) => SVGSVGElement; extent: (m: Member, fed?: number) => PortraitExtent; kind: (m: Member) => string }
interface Member { name: string; address: string; variant: number; p2: CritterV2 }

const cast: Member[] = members.map(m => ({ name: m.name, address: m.address, variant: 0, p2: generate2(m.address, 0) }));
const ownIndex = members.findIndex(m => m.own);
const v1Paint = (m: Member, s: State = {}) => createPortrait(document, generate(m.address, m.variant), { name: m.name, decorative: true, size: 'stage', asleep: !!s.asleep, fed: s.fed ?? (s.delighted ? 0.6 : 0) });
const DIRECTIONS: Direction[] = [
  { id: 'v1', name: 'Production today', note: 'Version 1, as every production build draws it', paint: v1Paint, extent: (m, fed = 0) => portraitMetrics({ ...generate(m.address, m.variant), version: '1' }, fed).extent, kind: m => { const p = generate(m.address, m.variant); return `${p.bodyShape} · ${p.earType} ears`; } },
  { id: 'v2', name: 'Faithful version 2', note: 'The October draw, as development builds draw it', paint: (m, s = {}) => { const svg = paintV2(document, m.p2, { name: m.name, decorative: true, size: 'stage', asleep: !!s.asleep, fed: s.fed ?? 0 }); svg.style.setProperty('--mouth', s.delighted ? '1' : '0'); svg.style.setProperty('--cheeks', s.delighted || m.p2.cheeks ? '1' : '0'); return svg; }, extent: (m, fed = 0) => portraitMetrics(m.p2, fed).extent, kind: m => `${m.p2.element} · ${m.p2.earType} · ${m.p2.crest}` },
  { id: 'garden', name: 'Garden spirits', note: 'Eight species, two to an element, half of them in the air', paint: (m, s = {}) => paintGarden(document, m.p2, s), extent: (m, fed = 0) => gardenLayout(gardenDraw(m.p2), fed).extent, kind: m => `${m.p2.element} · ${SPECIES_NAMES[gardenDraw(m.p2).species]}` },
  { id: 'recommended', name: 'Recommended: garden spirits, painted finish', note: 'The eight species, with the companions\' larger heads, softer shading and washed shadow', paint: (m, s = {}) => paintGarden(document, m.p2, { ...s, finish: 'painted' }), extent: (m, fed = 0) => gardenLayout(gardenDraw(m.p2, 'painted'), fed).extent, kind: m => `${m.p2.element} · ${SPECIES_NAMES[gardenDraw(m.p2).species]}` },
  { id: 'companions', name: 'Painted companions', note: 'Three authored bodies, close to the element paintings', paint: (m, s = {}) => paintCompanion(document, m.p2, s), extent: (m, fed = 0) => companionLayout(companionDraw(m.p2), fed).extent, kind: m => `${m.p2.element} · ${PLAN_NAMES[companionDraw(m.p2).plan]}` },
];

const params = new URLSearchParams(location.search), only = params.get('only'), still = params.has('still');
if (still) document.documentElement.dataset.still = 'true';
document.getElementById('still')?.setAttribute('aria-pressed', String(still));
if (params.has('true')) document.documentElement.dataset.true = '';
const h = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string | null)[]) => {
  const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); el.append(...children.filter(Boolean) as (Node | string)[]); return el;
};
const main = document.getElementById('main')!;
const section = (id: string, title: string, lede: string) => { const s = h('section', { id, 'aria-labelledby': `h-${id}` }, h('h2', { id: `h-${id}` }, title), h('p', { class: 'lede' }, lede)); if (!only || only === id) main.append(s); return s; };
const shortName = (n: string) => n.length > 12 ? n.slice(0, 11) + '…' : n;

/* ------------------------------------------------------------------ faces */
{
  const s = section('faces', 'Faces at list sizes', 'Every fixture critter at 40 px and 64 px wide (members, rows, the read pass) and cropped to a 44 px face (the profile button), as the app crops it. Same addresses, variant 0, in every row.');
  for (const d of DIRECTIONS) {
    const block = h('div', { class: 'block' }, h('h3', {}, d.name, h('span', {}, d.note)));
    for (const size of [40, 64]) {
      const row = h('div', { class: 'strip', 'data-label': `${size} px` });
      for (const m of cast) { const svg = d.paint(m); svg.setAttribute('width', String(size)); svg.setAttribute('height', String(size * 1.25)); row.append(h('figure', { class: 'mini' }, svg, h('figcaption', {}, shortName(m.name)))); }
      block.append(row);
    }
    const row = h('div', { class: 'strip', 'data-label': '44 px face' });
    for (const m of cast) {
      const e = d.extent(m), face = h('span', { class: 'face' }), svg = d.paint(m);
      const style = faceCrop(44, e.headY) as Record<string, string>; for (const [k, v] of Object.entries(style)) face.style.setProperty(k, v);
      // a head that is not centred in its drawing (some garden species) is moved to the middle of the circle
      const hx = (e as PortraitExtent & { headX?: number }).headX; if (hx !== undefined) face.style.setProperty('--face-dx', `${-(hx - 0.5) * 44 * 1.9}px`);
      face.append(svg); row.append(h('figure', { class: 'mini' }, face));
    }
    block.append(row);
    if (d.id === 'recommended') {
      // proposed for 40 px rows: a face crop, so a wide species' face is as large as anyone's
      const crops = h('div', { class: 'strip', 'data-label': '40 px rows, face crop (proposed)' });
      for (const m of cast) { const e = d.extent(m), face = h('span', { class: 'face' }), style = faceCrop(40, e.headY) as Record<string, string>; for (const [k, v] of Object.entries(style)) face.style.setProperty(k, v); const hx = (e as PortraitExtent & { headX?: number }).headX; if (hx !== undefined) face.style.setProperty('--face-dx', `${-(hx - 0.5) * 40 * 1.9}px`); face.append(d.paint(m)); crops.append(h('figure', { class: 'mini' }, face, h('figcaption', {}, shortName(m.name)))); }
      block.append(crops);
    }
    s.append(block);
  }
}

/* ------------------------------------------------------------------ bodies at scene sizes */
{
  const s = section('sizes', 'Whole bodies at scene sizes', 'The sizes the scattering circle uses: 66 px (phone back row), 100 px (phone front row), 140 px (phone, the critter in focus), 172 px and 248 px (desktop front row and focus at 1440 × 900). The line is where the feet stand.');
  for (const d of DIRECTIONS) {
    const block = h('div', { class: 'block' }, h('h3', {}, d.name, h('span', {}, d.note)));
    for (const [size, count] of [[66, 10], [100, 10], [140, 6], [172, 5], [248, 4]] as const) {
      const row = h('div', { class: 'strip floor', 'data-label': `${size} px` });
      for (const m of cast.slice(0, count)) { const svg = d.paint(m); svg.style.width = `${size}px`; row.append(h('figure', { class: 'body' }, svg)); }
      block.append(row);
    }
    s.append(block);
  }
}

/* ------------------------------------------------------------------ silhouettes */
{
  const s = section('silhouettes', 'Silhouettes', 'The same ten at 100 px, filled solid. Two critters that share a silhouette can only be told apart by colour, which fails for colour-blind members and in the dusk light.');
  for (const d of DIRECTIONS) {
    const row = h('div', { class: 'strip floor sil', 'data-label': d.name });
    for (const m of cast) { const svg = d.paint(m); svg.style.width = '100px'; row.append(h('figure', { class: 'body' }, svg)); }
    s.append(row);
  }
}

/* ------------------------------------------------------------------ groups in the app's own layouts */
type Frame = { device: 'phone' | 'desktop'; width: number; height: number; count: number; kind: 'scatter' | 'results' };
/** A heap of crumbs, as the review pages draw one: rows of the crumb glyph, widest at the bottom. */
function mound(n: number) {
  const NS = 'http://www.w3.org/2000/svg', s = (tag: string, attrs: Record<string, string | number>, parent?: Element) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v)); parent?.append(el); return el; };
  let k = 0; while (k * (k + 1) / 2 < n) k++;
  const w = k * 5.2 + 8, hh = k * 3.4 + 9, svg = s('svg', { viewBox: `${-w / 2} ${-hh + 4.5} ${w} ${hh}`, preserveAspectRatio: 'xMidYMax meet', 'aria-hidden': 'true' });
  s('ellipse', { cx: 0, cy: 2, rx: w / 2 - 1.5, ry: 2.4, fill: '#2E2226', opacity: 0.16 }, svg);
  let placed = 0;
  for (let row = 0; row < k && placed < n; row++) { const count = Math.min(k - row, n - placed); for (let i = 0; i < count; i++, placed++) { const g = s('g', { transform: `translate(${(i - (count - 1) / 2) * 5.2 + ((placed * 13) % 5 - 2) * 0.3} ${-row * 3.4 - 1}) rotate(${((placed * 37) % 70) - 35}) scale(.4)` }, svg); s('path', { d: 'M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z', fill: '#CFA552', stroke: '#2E2226', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, g); s('ellipse', { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: '#F2DD8E' }, g); } }
  return svg;
}
function scene(d: Direction, f: Frame) {
  const viewport = { width: f.width, height: f.height }, members = cast.slice(0, f.count);
  const gathered = f.kind === 'results', fed = (i: number) => gathered ? [0.85, 0.7, 0.45, 0.6, 0.3, 0.5, 0.4, 0.35, 0.2, 0.25][i]! : 0;
  const critters = members.map((m, i) => ({ name: m.name, own: i === ownIndex, count: gathered ? 0 : [24, 20, 0, 14, 0, 12, 10, 8, 6, 5][i]!, extent: d.extent(m, fed(i)) }));
  const layout = layoutGame({ viewport, critters, focus: 0, issued: 100, remaining: 12, surface: gathered ? { kind: 'results' } : { kind: 'dock' }, scene: gathered ? { grown: true, bubbles: 'none', tags: false, heap: 'none', huddle: true } : { grown: false, bubbles: 'focus', tags: true, heap: 'remaining', huddle: false } });
  const W = layout.scene.width, H = layout.scene.height, desktop = f.device === 'desktop';
  const frame = h('div', { class: `frame ${f.device} ${f.kind}`, style: `width:${f.width}px;height:${f.height}px` });
  const plate = { aspect: desktop ? 1.5 : 0.5, wallFoot: desktop ? 0.215 : 0.16 }, lift = plateLift({ width: W, height: H }, plate, circleBackRow(viewport, f.count));
  const stage = h('div', { class: 'stage-area', style: `top:${HEADER_HEIGHT}px;width:${W}px;height:${H}px` }, h('div', { class: 'plate', style: `top:${-lift}px;background-image:url(../../../packages/app/public/scenes/window-plate-${f.device}.webp)` }), h('div', { class: 'wash' }));
  frame.append(h('header', { class: 'fake-header' }, h('b', {}, 'Rehearsal burrow'), h('span', {}, 'Our shared work')), stage);
  const order = layout.slots.map((sl, i) => ({ sl, i })).sort((a, b) => a.sl.depth - b.sl.depth);
  order.forEach(({ sl, i }, k) => {
    if (sl.away) return;
    const m = members[i]!, svg = d.paint(m, { asleep: i === ownIndex && !gathered, delighted: gathered, fed: fed(i) });
    const spot = h('div', { class: `spot${gathered ? ' play' : ''}`, style: `left:${sl.stage.x}px;top:${sl.stage.y}px;width:${sl.stage.width}px;height:${sl.stage.height}px;--k:${k};z-index:${10 + k}` });
    if (sl.face === 'left') svg.style.transform = 'scaleX(-1)';
    spot.append(svg); stage.append(spot);
    if (!sl.tag.hidden) stage.append(h('span', { class: 'tag', style: `left:${sl.tag.x}px;top:${sl.tag.y}px;width:${sl.tag.width}px;height:${sl.tag.height}px` }, i === ownIndex ? 'You' : sl.tag.short ? shortName(m.name) : m.name, i === ownIndex ? null : h('i', {}, String(critters[i]!.count))));
  });
  if (layout.heap && !gathered) stage.append(h('span', { class: 'heap', style: `left:${layout.heap.x}px;top:${layout.heap.y}px;width:${layout.heap.width}px;height:${layout.heap.height}px` }, mound(12)));
  const dock = layout.dock;
  stage.append(h('div', { class: `dock ${gathered ? 'results-card' : ''}`, style: `left:${dock.x}px;top:${dock.y}px;width:${dock.width}px;height:${dock.height}px` }, gathered ? h('b', {}, 'Results') : h('b', {}, members[0]!.name)));
  if (desktop) frame.append(h('aside', { class: 'side-panel', style: `top:${HEADER_HEIGHT}px;left:${W}px;width:${f.width - W}px;height:${H}px` }, h('b', {}, gathered ? 'Results' : members[0]!.name)));
  return frame;
}
{
  const s = section('groups', 'Groups in the real layouts', 'Eight critters on a 390 × 844 phone and ten on a 1440 × 900 desktop, placed by the app\'s own layout function (game/layout.ts) on the Window plate, raised as the app raises it. Then the results huddle on the card\'s edge, where the critters play. Your critter (Juniper) sleeps while scattering.');
  const frames: Frame[] = [{ device: 'phone', width: 390, height: 844, count: 8, kind: 'scatter' }, { device: 'desktop', width: 1440, height: 900, count: 10, kind: 'scatter' }, { device: 'phone', width: 390, height: 844, count: 8, kind: 'results' }, { device: 'desktop', width: 1440, height: 900, count: 10, kind: 'results' }];
  for (const f of frames) {
    const row = h('div', { class: `frames ${f.device}`, 'data-label': `${f.device} · ${f.count} · ${f.kind}` });
    for (const d of DIRECTIONS) row.append(h('figure', { class: 'framed', 'data-direction': d.id, 'data-frame': `${f.device}-${f.kind}` }, scene(d, f), h('figcaption', {}, d.name)));
    s.append(row);
  }
}

/* ------------------------------------------------------------------ states */
{
  const s = section('states', 'Awake, asleep, a crumb arriving, delighted', 'Three critters each: breathing and blinking; asleep (eyes shut, slower breath, a flier settles lower); a crumb hopping in, met with the Game Design bump (1.08 / 0.92 squash, settled by 260 ms); delighted at the results. Turn on Still to stop the motion; reduced motion stops it too.');
  const pickIdx = [0, 1, 4];
  for (const d of DIRECTIONS) {
    const row = h('div', { class: 'strip floor states', 'data-label': d.name });
    for (const i of pickIdx) {
      const m = cast[i]!;
      for (const [label, st, cls] of [['awake', {}, 'idle'], ['asleep', { asleep: true }, 'sleep'], ['a crumb', {}, 'receive'], ['delighted', { delighted: true, fed: 0.6 }, 'idle happy']] as const) {
        const svg = d.paint(m, st as State); svg.style.width = '120px';
        const fig = h('figure', { class: `body state ${cls}`, style: `--k:${i}` }, svg, h('figcaption', {}, `${shortName(m.name)} · ${label}`));
        if (cls === 'receive') fig.append(h('span', { class: 'hop', 'aria-hidden': 'true' }));
        if (cls === 'sleep') fig.append(h('span', { class: 'zz', 'aria-hidden': 'true' }, 'z'));
        row.append(fig);
      }
    }
    s.append(row);
  }
}

/* ------------------------------------------------------------------ the data */
{
  const s = section('data', 'Exactly what was drawn', 'Version 1 and version 2 are the frozen generators (seed text address:variant:version, cyrb53 into mulberry32). The two explorations take their numbers from the version 2 draw of the same address and variant and keep its element, so a row is the same critter four ways. A shipped direction would get its own draw order and version (see the README).');
  const table = h('table', {}, h('thead', {}, h('tr', {}, ...['Critter', 'Address', 'Variant', 'Seed text (v1 · v2)', 'Version 1', 'Version 2', 'Garden spirits', 'Painted companions'].map(t => h('th', { scope: 'col' }, t)))));
  const body = h('tbody');
  for (const m of cast) {
    const g = gardenDraw(m.p2), c = companionDraw(m.p2), lower = m.address.toLowerCase();
    body.append(h('tr', {}, h('th', { scope: 'row' }, m.name), h('td', { class: 'mono' }, m.address), h('td', {}, String(m.variant)), h('td', { class: 'mono' }, `${lower}:0:1 · ${lower}:0:2`), h('td', {}, DIRECTIONS[0]!.kind(m)), h('td', {}, DIRECTIONS[1]!.kind(m)), h('td', {}, `${SPECIES_NAMES[g.species]} (${g.element})`), h('td', {}, `${PLAN_NAMES[c.plan]} (${c.element})`)));
  }
  table.append(body); s.append(table);
}
document.getElementById('still')?.addEventListener('click', event => { const root = document.documentElement, on = root.dataset.still !== 'true'; root.dataset.still = String(on); (event.currentTarget as HTMLElement).setAttribute('aria-pressed', String(on)); });
