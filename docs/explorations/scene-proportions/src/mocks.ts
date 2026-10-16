/**
 * Two proposed screens on the room rule (README): the first meeting as one surface, and a fourth first step that
 * shows a feast's result with a worked example. Static compositions for review, not app code: Codex owns the
 * behaviour, the copy IDs and the layout; the critters are the app's version 2 painter, unchanged.
 */
import { generate2 } from '../../critter-directions/src/core-shim.ts';
import { paintV2 } from '../../../../packages/app/src/portraits/painter-v2.ts';
import { MOSS, CLOVER, JUNIPER, FERN } from '../../../../packages/app/src/app/painted-scene.ts';

const ROOM = { w: 1600, h: 897 };
const h = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string | null)[]) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); el.append(...children.filter(Boolean) as (Node | string)[]); return el; };
type Device = { name: string; width: number; height: number; desktop: boolean };
const DEVICES: Device[] = [{ name: '390 × 844', width: 390, height: 844, desktop: false }, { name: '375 × 667', width: 375, height: 667, desktop: false }, { name: '1280 × 720', width: 1280, height: 720, desktop: true }];
/** The room rule: the painting at the launcher's zoom, its foot on the floor's foot, critters placed in painting coordinates. */
const roomHeight = (d: Device) => d.desktop ? Math.max(d.width / 1.7837, d.height - 36) : 0.8 * d.height;
function room(d: Device, floor: { width: number; height: number }, painting: 'window' | 'dusk', light: 'day' | 'feast') {
  const rh = roomHeight(d), rw = rh * ROOM.w / ROOM.h;
  const el = h('div', { class: `room light-${light}`, style: `width:${floor.width}px;height:${floor.height}px` }, h('div', { class: 'paint', style: `background-image:url(../../../packages/app/public/scenes/${painting}.webp);background-size:auto ${rh}px` }), h('div', { class: 'wash' }));
  const at = (x: number, y: number) => ({ left: floor.width / 2 + (x / 100 - 0.5) * rw, top: floor.height - (1 - y / 100) * rh });
  return { el, at, k: rh / ROOM.h };
}
function critter(address: string, variant: number, opts: { size: number; k: number; x: number; y: number; at: (x: number, y: number) => { left: number; top: number }; asleep?: boolean; delighted?: boolean; fed?: number; face?: 'left' | 'right' }) {
  const p = generate2(address, variant), svg = paintV2(document, p, { name: '', decorative: true, size: 'stage', asleep: !!opts.asleep, fed: opts.fed ?? 0 });
  svg.style.setProperty('--mouth', opts.delighted ? '1' : '0'); svg.style.setProperty('--cheeks', opts.delighted ? '1' : '0');
  const { left, top } = opts.at(opts.x, opts.y), width = opts.size * opts.k;
  const node = h('div', { class: 'crit', style: `left:${left}px;top:${top}px;width:${width}px` }); if (opts.face === 'left') svg.style.transform = 'scaleX(-1)';
  node.append(svg); return { node, params: p };
}
function heap(n: number, x: number, y: number, size: number, r: ReturnType<typeof room>) {
  const NS = 'http://www.w3.org/2000/svg', s = (tag: string, a: Record<string, string | number>, parent?: Element) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v)); parent?.append(e); return e; };
  let k = 0; while (k * (k + 1) / 2 < n) k++;
  const w = k * 5.2 + 8, hh = k * 3.4 + 9, svg = s('svg', { viewBox: `${-w / 2} ${-hh + 4.5} ${w} ${hh}`, 'aria-hidden': 'true' });
  s('ellipse', { cx: 0, cy: 2, rx: w / 2 - 1.5, ry: 2.4, fill: '#2E2226', opacity: 0.16 }, svg);
  let placed = 0;
  for (let row = 0; row < k && placed < n; row++) { const count = Math.min(k - row, n - placed); for (let i = 0; i < count; i++, placed++) { const g = s('g', { transform: `translate(${(i - (count - 1) / 2) * 5.2} ${-row * 3.4 - 1}) rotate(${((placed * 37) % 70) - 35}) scale(.4)` }, svg); s('path', { d: 'M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z', fill: '#CFA552', stroke: '#2E2226', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, g); s('ellipse', { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: '#F2DD8E' }, g); } }
  const { left, top } = r.at(x, y), width = size * r.k * Math.max(1, k / 4);
  const node = h('div', { class: 'prop', style: `left:${left}px;top:${top}px;width:${width}px` }); node.append(svg); return node;
}
function frame(d: Device, title: string, scene: (floor: { width: number; height: number }) => HTMLElement, sheet: HTMLElement[], sheetH: number) {
  const header = h('header', { class: 'bar' }, h('b', { class: 'wordmark' }, 'Critter Crumbs'), h('span', { class: 'music', 'aria-hidden': 'true' }, '♪'));
  const f = h('div', { class: `frame ${d.desktop ? 'desktop' : 'phone'}`, style: `width:${d.width}px;height:${d.height}px`, 'aria-label': `${title}, ${d.name}` });
  const body = h('div', { class: 'mock-content' }, ...sheet.slice(0, -1));
  const actions = h('div', { class: 'mock-actions' }, sheet[sheet.length - 1]!);
  if (d.desktop) {
    const panel = Math.min(480, Math.max(400, d.width * 0.25)), floor = { width: d.width - panel, height: d.height - 64 };
    f.append(header, h('div', { class: 'body desktop' }, h('div', { class: 'floor' }, scene(floor)), h('section', { class: 'panel', style: `width:${panel}px` }, body, actions)));
  } else {
    const sheetPx = Math.min(sheetH, 0.58 * d.height), floor = { width: d.width, height: d.height - 64 - sheetPx + 24 };
    f.append(header, h('div', { class: 'floor', style: `height:${floor.height}px` }, scene(floor)), h('section', { class: 'sheet', style: `height:${sheetPx}px` }, body, actions));
  }
  return f;
}
const field = (label: string, value: string, count: string) => h('label', { class: 'field' }, h('span', {}, label), h('span', { class: 'input' }, h('span', {}, value), h('i', {}, count)));

/* ------------------------------------------------------------------ the first meeting, one surface */
function meeting(d: Device) {
  const sheet = [
    h('div', { class: 'between' }, h('h2', {}, 'Meet your critter'), h('span', { class: 'chip' }, 'Earth')),
    h('p', {}, 'Made from your address. Re-roll up to 4 times, then it\'s yours.'),
    field('What should the burrow call you?', 'Moss', '4 / 40'),
    h('div', { class: 'grow' }),
    h('div', { class: 'actions' }, h('button', { class: 'soft' }, 'Re-roll (4 left)'), h('button', { class: 'pill' }, 'Keep this one')),
  ];
  return frame(d, 'First meeting', floor => {
    const r = room(d, floor, 'window', 'day');
    // the hero spot: centre front, a fifth larger than the launcher's front pair
    r.el.append(critter(MOSS, 0, { size: 230, k: r.k, x: 50, y: 94, at: r.at, delighted: false }).node);
    return r.el;
  }, sheet, 330);
}
/* ------------------------------------------------------------------ the fourth first step: a feast's result, worked */
function feastStep(d: Device) {
  // A, B and C each give 60 / 30 / 10 to the other three; D does not scatter. 300 crumbs given.
  const rows: [string, string, number][] = [[MOSS, 'Moss', 120], [CLOVER, 'Clover', 90], [JUNIPER, 'Juniper', 60], [FERN, 'Fern', 30]];
  const table = h('div', { class: 'mini-results' }, ...rows.map(([, name, n]) => h('div', { class: 'row' }, h('span', {}, name), h('b', {}, String(n)), h('span', { class: 'share' }, `${Math.round(n / 3)}%`))));
  const sheet = [
    h('div', { class: 'dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i', { 'data-on': 'true' })),
    h('h2', {}, 'When the feast opens'),
    h('p', {}, 'Every scatter opens at once. A critter\'s share is what it received out of every crumb given.'),
    table,
    h('p', { class: 'help' }, 'Fern didn\'t scatter and still received 30. Shares count the 300 crumbs given.'),
    h('div', { class: 'grow' }),
    h('button', { class: 'pill wide' }, 'Got it'),
  ];
  return frame(d, 'First steps, a feast', floor => {
    const r = room(d, floor, 'window', 'feast');
    // growth as Game Design §3.4: fed = clamp(share × 4 / 2.5)^0.75, the drawing 1 + 0.2 × fed (the painter's own)
    const spots: [number, number, number, 'left' | 'right' | undefined][] = [[39.4, 90, 165, 'right'], [46.1, 94, 190, undefined], [54.5, 93, 190, 'left'], [61, 89, 165, 'left']];
    rows.forEach(([address, , n], i) => {
      const fed = Math.min(1, (n / 300 * 4) / 2.5) ** 0.75, [x, y, size, face] = spots[i]!;
      r.el.append(critter(address, 0, { size, k: r.k, x, y, at: r.at, delighted: true, fed, ...(face ? { face } : {}) }).node);
      r.el.append(heap(Math.round(n / 10), x + 3.4, y + 1, 30, r));
    });
    return r.el;
  }, sheet, 380);
}

const root = document.getElementById('mocks')!;
for (const [title, make] of [['The first meeting, one surface', meeting], ['A fourth first step: the feast, worked through', feastStep]] as const) {
  const row = h('div', { class: 'row-frames' });
  for (const d of DEVICES) row.append(h('figure', {}, make(d), h('figcaption', {}, d.name)));
  root.append(h('section', {}, h('h2', {}, title), row));
}
