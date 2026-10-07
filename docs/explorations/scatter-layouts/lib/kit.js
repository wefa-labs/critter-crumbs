/* Shared by the review pages in docs/explorations: the looks, the seed burrow, the critter painter, crumbs and
   mounds, and the SVG filters and icons they use. Not app code; the app's renderer lives in packages/app. */
import { generate2, layout, palette } from './generator.js';

/* ------------------------------------------------------------------ filters, patterns and icons, added to the page once */
const DEFS = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="loose" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="loose2" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="fur" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .14  0 0 0 0 .11  0 0 0 0 .15  0 0 0 .16 0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/><feBlend in="SourceGraphic" in2="gi" mode="multiply"/></filter>
    <filter id="poster" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncG type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncB type="discrete" tableValues="0 .2 .4 .6 .8 1"/></feComponentTransfer></filter>
    <pattern id="strokes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><path d="M0 3.5 H4.6" stroke="#1a1016" stroke-width="1.7" stroke-linecap="round" opacity=".28"/></pattern>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 0 L0 4" stroke="#1F2426" stroke-width="1.1" opacity=".5"/></pattern>
    <symbol id="ic-leaf" viewBox="0 0 16 16"><path d="M13.5 2.5c-6 0-10 3-10.5 9.5 3-5 7-6 8-6.5-1.5 2.5-5 4.5-8 5.5 4 1.5 9 0 10.5-8.5z" fill="currentColor"/></symbol>
    <symbol id="ic-drop" viewBox="0 0 16 16"><path d="M8 1.5C8 1.5 3 7 3 10a5 5 0 0 0 10 0c0-3-5-8.5-5-8.5z" fill="currentColor"/></symbol>
    <symbol id="ic-flame" viewBox="0 0 16 16"><path d="M8.5 1.5C9 5 12 6 12 10a4 4 0 0 1-8 0c0-1.5.6-2.5 1.3-3.3.1 1.2.8 1.8 1.5 1.8-.3-2.5.7-5 1.7-7z" fill="currentColor"/></symbol>
    <symbol id="ic-cloud" viewBox="0 0 16 16"><path d="M4.5 12.5a3 3 0 0 1-.4-6 4 4 0 0 1 7.6-1 3.5 3.5 0 0 1 .3 7z" fill="currentColor"/></symbol>
    <symbol id="ic-x" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
    <symbol id="ic-left" viewBox="0 0 20 20"><path d="M12.5 4l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="ic-right" viewBox="0 0 20 20"><path d="M7.5 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  </defs></svg>`;
export function installDefs() {
  if (document.getElementById('kit-defs')) return;
  const svg = document.importNode(new DOMParser().parseFromString(DEFS, 'image/svg+xml').documentElement, true);
  svg.id = 'kit-defs';
  document.body.prepend(svg);
}

/* ------------------------------------------------------------------ the seed: ten members, yours third so every burrow size includes it */
const BURROW = 'Rehearsal burrow', FEAST = 'Our shared work', ISSUED = 100, VIEWER = 2;
const MEMBERS = [
  ['Moss', '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', 24, 142, 'I planted six fruit trees and kept the shared garden watered through the dry weeks. The two apple trees by the gate are from the cuttings we took in March, and both carried fruit this year for the first time.\n\nI also set up the watering rota after the July heat. Eleven people signed up, and the rota is pinned inside the shed door so anyone can see who has the evening slot. When the hose split in August I patched it twice and then bought a new one from the shared fund, with the receipt in the folder.\n\nThe compost bays were overflowing in spring, so I turned all three, built a fourth from pallets, and wrote a short note on what goes in which bay. Since then the kitchen scraps from the community lunch have gone into the garden instead of the bin.\n\nNext year I would like to try a small nursery bed so we can grow our own cuttings instead of buying them, and to run two afternoons on pruning for anyone who wants to learn.'],
  ['Fern', '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF', 20, 118, 'I repaired the library shelves and organised our book swap. Forty-one books went out and thirty came back, which I count as a win. The children’s shelf is now at a height children can reach.'],
  ['Juniper', '0xF1F6619B38A98d6De0800F1DefC0a6399eB6d30C', 0, 74, 'I welcomed three new neighbours, walked them round the garden and the library, and shared our meeting notes every week so nobody had to ask what was decided.'],
  ['Clover', '0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718', 14, 96, 'I checked in with neighbours each week and arranged two accessible lifts to the clinic.'],
  ['Acorn', '0xd41c057fd1c78805AAC12B0A94a405c0461A6FBb', 0, 58, 'I gathered supplies and helped prepare the next planting day.'],
  ['Hazel Montgomery', '0xe1AB8145F7E55DC933D51a18c793F901A3A0b276', 12, 88, 'I balanced the shared expenses and published clear receipts every month, with a summary anyone can read in two minutes.'],
  ['Pebble', '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69', 10, 81, 'I cooked lunch for the workshop and cleaned the community kitchen afterwards, including the oven nobody wanted to touch. We now have a rota for it, and the rota has held for six weeks.'],
  ['Willow', '0xE57bFE9F44b819898F47BF37E5AF72a0783e1141', 8, 67, 'I hosted the repair afternoon and fixed four bicycles, one of them twice.'],
  ['Bramble', '0x000000000000000000000001daa66d2c7ddf743f', 6, 50, 'I cleared the bramble from the back path and built two raised beds from the old fence boards.'],
  ['Sorrel', '0x00000000000000000000000d98c475f0f066a9ce', 5, 46, 'I ran the seed swap at the spring fair and kept the sign-up sheet for next year.'],
].map(([name, address, weight, received, statement], index) => ({ index, name, address, weight, received, statement, own: index === VIEWER, params: generate2(address, 0) }));

/* ------------------------------------------------------------------ elements, scenes, looks */
const ELEMENT = {
  fire: { shadow: '#852318', base: '#EB521D', light: '#F5A95D', soft: '#FCE7DE', label: 'Fire', icon: 'ic-flame' },
  earth: { shadow: '#156152', base: '#289946', light: '#ACE676', soft: '#DEF5DA', label: 'Earth', icon: 'ic-leaf' },
  water: { shadow: '#263580', base: '#2564B8', light: '#84D3F0', soft: '#E1EDFC', label: 'Water', icon: 'ic-drop' },
  air: { shadow: '#52366B', base: '#B26ACC', light: '#E9BBF0', soft: '#F1E3FA', label: 'Air', icon: 'ic-cloud' },
};
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .2 0 0 0 0 .15 0 0 0 0 .2 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const SYS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
/* Daylight's palette, type and pill shape; Inked daylight adds Ink & Ember's outlines and critter line to them */
const DAYLIGHT = { page: '#F6F0E4', ink: '#2E2226', muted: '#6B5B5E', soft: '#EADFD2', rule: 'rgb(46 34 38 / .14)', gold: '#CFA552', goldHi: '#F3DF95', action: '#D9A441', actionText: '#2E2226', edge: '0px', edgePlate: '0px', edgeColour: 'transparent', radius: '999px', hard: '0 0 0 transparent', hardSmall: '0 0 0 transparent', display: SYS, body: SYS, dw: 800, bw: 400, floorBase: '#D9CBB2',
  imgFilter: 'saturate(.82) brightness(1.05) sepia(.1)', wash: 'linear-gradient(to bottom, rgb(246 240 228 / .05), rgb(246 240 228 / .2) 55%, rgb(246 240 228 / .42))', tint: 'transparent', light: 'transparent', grain: .12, dots: 0 };
const DAYLIGHT_TONES = [{ base: '#CDB3A9', shadow: '#9A7A80', light: '#EBD9CF', soft: '#F3EAE4' }, { base: '#B69993', shadow: '#86686E', light: '#DDC2B7', soft: '#EFE4DF' }, { base: '#A3837F', shadow: '#74585F', light: '#CCAFA6', soft: '#E6D5CF' }];
const LOOKS = [
  { key: 'inked', name: 'Inked daylight', on: true, thesis: 'Daylight’s type, palette and pill buttons, with Ink & Ember’s inked outlines, hard shadow and heavier critter line.',
    tokens: { ...DAYLIGHT, edge: '1.5px', edgePlate: '1.5px', edgeColour: '#2E2226', hard: '3px 3px 0 rgb(46 107 114 / .32)', hardSmall: '2px 2px 0 rgb(46 107 114 / .32)' },
    critter: { line: '#2E2226', lineW: 2.1, shading: 'paint', hatch: true, grain: true, cream: '#F3E6D6', tones: DAYLIGHT_TONES } },
  { key: 'daylight', name: 'Daylight', on: true, thesis: 'The brief, warmer: a warm page, a browner ink, gold for the one action, a light wash over the floor.',
    tokens: DAYLIGHT,
    critter: { line: '#2E2226', lineW: 1.7, shading: 'paint', hatch: false, grain: true, cream: '#F3E6D6', tones: DAYLIGHT_TONES } },
  { key: 'ink', name: 'Ink & Ember', on: true, thesis: 'Avatar’s ink and parchment, warmer: a heavier line with hatching in the shadows, ember for the one action, teal shade on the floor.',
    tokens: { page: '#F1E6D0', ink: '#2A2522', muted: '#6A5744', soft: '#E6D8BE', rule: 'rgb(42 37 34 / .18)', gold: '#D08A3E', goldHi: '#F0C98E', action: '#A84A22', actionText: '#F8F0DF', edge: '1.5px', edgePlate: '1.5px', edgeColour: '#2A2522', radius: '10px', hard: '3px 3px 0 rgb(46 107 114 / .32)', hardSmall: '2px 2px 0 rgb(46 107 114 / .32)', display: '"Shippori Mincho", "Hiragino Mincho ProN", serif', body: '"Atkinson Hyperlegible", system-ui, sans-serif', dw: 700, bw: 400, floorBase: '#CFC2A6',
      imgFilter: 'sepia(.22) saturate(.82) contrast(1.02)', wash: 'linear-gradient(to bottom, rgb(241 230 208 / .08), rgb(241 230 208 / .26) 60%, rgb(241 230 208 / .44))', tint: 'linear-gradient(to top, rgb(46 107 114 / .35), transparent 50%)', light: 'transparent', grain: .2, dots: 0 },
    critter: { line: '#2A2522', lineW: 2.2, shading: 'paint', hatch: true, grain: true, cream: '#EEDFC4', tones: [{ base: '#C9B49C', shadow: '#94806C', light: '#E4D6BE', soft: '#F2E8D6' }, { base: '#B69F8A', shadow: '#82705F', light: '#D6C5B0', soft: '#ECE0CE' }, { base: '#A58C7E', shadow: '#76635A', light: '#C9B4A7', soft: '#E6D8CC' }] } },
  { key: 'dusk', name: 'Dusk glow', on: false, thesis: 'Arcane’s coloured light, not its palette: violet shade and a warm screen of lantern light. A dark look.',
    tokens: { page: '#2B2638', ink: '#EDE6D6', muted: '#B8AFC0', soft: '#3B3550', rule: 'rgb(237 230 214 / .14)', gold: '#E0A83A', goldHi: '#F6D37A', action: '#E0A83A', actionText: '#2B2638', edge: '0px', edgePlate: '0px', edgeColour: 'transparent', radius: '16px', hard: '0 0 0 transparent', hardSmall: '0 0 0 transparent', display: '"Josefin Sans", Futura, system-ui, sans-serif', body: '"Public Sans", system-ui, sans-serif', dw: 700, bw: 400, floorBase: '#2A4B52',
      imgFilter: 'saturate(1.05) brightness(.96)', wash: 'linear-gradient(to bottom, rgb(43 38 56 / .25), rgb(43 38 56 / .05) 45%, rgb(43 38 56 / .45))', tint: 'linear-gradient(to bottom, rgb(82 54 107 / .5), transparent 60%)', light: 'radial-gradient(45% 40% at 68% 30%, rgb(246 211 122 / .5), transparent 70%)', grain: .1, dots: 0 },
    critter: { line: '#251C25', lineW: 1.6, shading: 'paint', hatch: false, grain: true, cream: '#E4D7DA', tones: [{ base: '#B9A4A4', shadow: '#7E6678', light: '#E2CFCB', soft: '#EFE2DE' }, { base: '#A6919A', shadow: '#6E5A6C', light: '#D0BFC2', soft: '#E6D8DA' }, { base: '#978088', shadow: '#5F4C5E', light: '#C2ADB2', soft: '#DDCBCF' }] } },
  { key: 'cel', name: 'Cel', on: false, thesis: 'X-Men ’97’s confidence: a thick line, flat two-tone shading, halftone, each critter in its element colour.',
    tokens: { page: '#FFF8E8', ink: '#22182E', muted: '#4E4658', soft: '#F3EBD9', rule: '#22182E', gold: '#F7C531', goldHi: '#FFE8A3', action: '#2F6BD9', actionText: '#FFFFFF', edge: '2.5px', edgePlate: '2px', edgeColour: '#22182E', radius: '14px', hard: '4px 4px 0 #22182E', hardSmall: '2px 2px 0 #22182E', display: '"Lilita One", "Arial Rounded MT Bold", sans-serif', body: 'Nunito, system-ui, sans-serif', dw: 400, bw: 600, floorBase: '#E8DCC4',
      imgFilter: 'url(#poster) contrast(1.15) saturate(1.3)', wash: 'linear-gradient(to bottom, rgb(255 248 232 / 0), rgb(255 248 232 / .25) 70%, rgb(255 248 232 / .45))', tint: 'transparent', light: 'transparent', grain: 0, dots: .18 },
    critter: { line: '#22182E', lineW: 3, shading: 'flat', hatch: false, grain: false, element: true } },
];

/* ------------------------------------------------------------------ helpers */
const NS = 'http://www.w3.org/2000/svg';
let serial = 0;
function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) { if (value === false || value === null || value === undefined) continue; if (key === 'class') node.className = value; else if (key === 'style') node.style.cssText = value; else node.setAttribute(key, value === true ? '' : String(value)); }
  for (const child of children.flat(Infinity)) if (child !== null && child !== undefined && child !== false) node.append(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
  return node;
}
function s(tag, attrs = {}, parent) { const node = document.createElementNS(NS, tag); for (const [key, value] of Object.entries(attrs)) if (value !== null && value !== undefined && value !== false) node.setAttribute(key, String(value)); parent?.append(node); return node; }
function use(id, parent) { const node = s('use', {}, parent); node.setAttribute('href', `#${id}`); return node; }
function mix(a, b, amount) { const rgb = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = rgb(a), B = rgb(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * amount).toString(16).padStart(2, '0')).join('')}`; }
function applyLook(node, look) {
  const k = look.tokens;
  const vars = { page: k.page, ink: k.ink, muted: k.muted, soft: k.soft, rule: k.rule, gold: k.gold, 'gold-hi': k.goldHi, action: k.action, 'action-text': k.actionText, edge: k.edge, 'edge-plate': k.edgePlate, 'edge-colour': k.edgeColour, radius: k.radius, hard: k.hard, 'hard-small': k.hardSmall, display: k.display, body: k.body, dw: k.dw, bw: k.bw, 'img-filter': k.imgFilter, wash: k.wash, tint: k.tint, light: k.light, grain: k.grain, dots: k.dots, 'floor-base': k.floorBase };
  for (const [key, value] of Object.entries(vars)) node.style.setProperty(`--l-${key}`, String(value));
  node.style.setProperty('--grain', GRAIN); node.style.setProperty('--ease', 'cubic-bezier(.2,.8,.2,1)');
}
function paragraphs(text) { return text.split(/\n{2,}/).map(part => h('p', {}, part)); }
/* replaceChildren turns a null into the text "null", so empty slots are dropped first */
function fill(node, ...children) { node.replaceChildren(...children.filter(child => child !== null && child !== undefined && child !== false)); }

/* ------------------------------------------------------------------ painting critters: round, big-eyed, the reference painting's surface */
const UNIT = 54, FOOT = 140, CENTER = 60, BOX_H = 150;
function paintedFill(defs, id, tone) {
  const grad = s('radialGradient', { id: `${id}-g${++serial}`, cx: .34, cy: .28, r: .95 }, defs);
  s('stop', { offset: 0, 'stop-color': tone.light }, grad); s('stop', { offset: .46, 'stop-color': tone.base }, grad); s('stop', { offset: 1, 'stop-color': tone.shadow }, grad);
  return `url(#${grad.id})`;
}
function shaded(parent, defs, id, e, tone, st, strokeWidth, extra = {}) {
  const fill = st.shading === 'paint' ? paintedFill(defs, id, tone) : tone.base;
  s('ellipse', { ...e, fill, ...extra }, parent);
  const clip = s('clipPath', { id: `${id}-c${++serial}` }, defs); s('ellipse', e, clip);
  const inner = s('g', { 'clip-path': `url(#${clip.id})`, ...extra }, parent);
  if (st.shading === 'flat') { s('ellipse', { cx: e.cx + e.rx * .42, cy: e.cy + e.ry * .5, rx: e.rx * 1.05, ry: e.ry, fill: tone.shadow }, inner); }
  else {
    const crescent = s('clipPath', { id: `${id}-k${++serial}` }, defs); s('ellipse', { cx: e.cx + e.rx * .5, cy: e.cy + e.ry * .58, rx: e.rx * 1.02, ry: e.ry * .98 }, crescent);
    const cel = s('g', { 'clip-path': `url(#${crescent.id})` }, inner);
    s('rect', { x: e.cx - e.rx * 1.2, y: e.cy - e.ry * 1.2, width: e.rx * 2.4, height: e.ry * 2.4, fill: tone.shadow, opacity: .5 }, cel);
    s('rect', { x: e.cx - e.rx * 1.2, y: e.cy - e.ry * 1.2, width: e.rx * 2.4, height: e.ry * 2.4, fill: st.hatch ? 'url(#hatch)' : 'url(#strokes)' }, cel);
  }
  s('ellipse', { ...e, fill: 'none', stroke: st.line, 'stroke-width': strokeWidth * .55, opacity: .32, filter: 'url(#loose2)', transform: `${extra.transform ?? ''} translate(1.2 .8)` }, parent);
  s('ellipse', { ...e, fill: 'none', stroke: st.line, 'stroke-width': strokeWidth, opacity: .9, filter: 'url(#loose)', ...extra }, parent);
}
const TAIL_REACH = { puff: [.95, .46], stub: [1.02, .5], branch: [.9, 1.51], tadpole: [.9, 1.34], spark: [.9, 1.27], emberwisp: [.9, 1.07], cloudwisp: [.9, 1.25], longwisp: [.9, 1.95] };
const CREST_HEIGHT = { sapling: .62, droplet: .72, reed: .85, ember: .78, seedpods: .45 };
function paint(params, st, { size = 0, delighted = false, fed = 0, asleep = false } = {}) {
  const g = layout(params), el = ELEMENT[params.element], id = `pc${++serial}`;
  const own = palette(params).body.css;
  const base = st.element ? { base: el.light, shadow: el.base, light: el.soft, soft: el.soft } : st.tones[Math.floor(params.idlePhase * 3) % 3];
  const PAGE = '#F6F0E4', LINE = st.line, PEACH = '#F5A95D', EYE = '#2C2129', lw = st.lineW;
  /* the critter's own colour, softened toward the look's cream: lights warm, shadows cool (Appendix A) */
  const softened = st.element ? null : mix(own, st.cream, .55);
  const tone = st.element ? base : { base: mix(softened, base.base, .25), shadow: mix(mix(own, LINE, .3), base.shadow, .3), light: mix(softened, '#FBF0DC', .45), soft: base.soft };
  const svg = s('svg', { viewBox: `0 0 120 ${BOX_H}`, class: `critter${delighted ? ' delighted' : ''}${asleep ? ' asleep' : ''}`, 'aria-hidden': 'true' });
  if (size) svg.style.width = `${size}px`;
  svg.style.setProperty('--d', `${(params.idlePhase * 5).toFixed(2)}s`);
  const defs = s('defs', {}, svg);
  /* a round head nearly as wide as the body, sitting into it; short legs hidden under big paws */
  const R = g.hr * UNIT * 1.22, W = g.bw * UNIT * 1.04, H = g.bh * UNIT * .9, Rt = R * .8;
  const bodyY = FOOT - H * .96 - 2, headY = bodyY - H * .8 - R * .45;
  const earLength = g.earLen * UNIT * .78;
  const headTop = headY - R * (params.headShape === 'egg' ? 1.12 : 1);
  const earAngle = (params.earSpread + (params.earType === 'floppy' ? 70 : 0)) * Math.PI / 180;
  const earTop = params.earType === 'none' ? headTop : headY - R * .62 - earLength * .95 * Math.max(0, Math.cos(earAngle));
  const topY = Math.min(headTop - (CREST_HEIGHT[params.crest] ?? (params.element === 'air' ? .3 : 0)) * R, earTop, headTop) - 2;
  const [wReach, rReach] = TAIL_REACH[params.tailType] ?? [1, 0];
  const rightX = CENTER + wReach * W + rReach * Rt;
  const grow = 1 + .2 * fed, fit = Math.min(1, (FOOT - 6) / ((FOOT - topY) * grow), (116 - CENTER) / ((rightX - CENTER) * grow));
  /* the drawing's extent as fractions of the box, so tags can be placed before the circle finishes turning */
  const earX = params.earType === 'none' ? 0 : R * .64 + earLength * .95 * Math.abs(Math.sin(earAngle));
  const halfW = Math.max(R, W * .86, earX) + 2, scale = fit * grow;
  svg.dataset.top = ((FOOT - (FOOT - topY) * scale) / BOX_H).toFixed(3);
  svg.dataset.left = ((CENTER - halfW * scale) / 120).toFixed(3);
  svg.dataset.right = ((CENTER + Math.max(halfW, rightX - CENTER + 2) * scale) / 120).toFixed(3);
  /* the head: its centre as a fraction of the box height, its radius as a fraction of the width */
  svg.dataset.hy = ((FOOT - (FOOT - headY) * scale) / BOX_H).toFixed(3);
  svg.dataset.hr = (R * scale / 120).toFixed(3);
  s('ellipse', { cx: CENTER, cy: FOOT + 2, rx: W * 1.3 * fit, ry: 4.5, fill: LINE, opacity: .14 }, svg);
  const fitGroup = s('g', { transform: fit < 1 ? `translate(${CENTER} ${FOOT}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-FOOT})` : null }, svg);
  const figure = s('g', { class: 'p-figure' }, fitGroup);
  const body = s('g', { transform: fed ? `translate(${CENTER} ${FOOT}) scale(${(1 + .2 * fed).toFixed(3)}) translate(${-CENTER} ${-FOOT})` : null }, figure);
  const tx = CENTER + W * .9, ty = bodyY + H * .3;
  const tails = {
    puff: () => shaded(body, defs, id, { cx: CENTER + W * .95, cy: bodyY + H * .45, rx: Rt * .46, ry: Rt * .42 }, tone, st, lw * .8),
    stub: () => shaded(body, defs, id, { cx: CENTER + W * 1.02, cy: bodyY + H * .5, rx: Rt * .5, ry: Rt * .26 }, tone, st, lw * .75),
    branch: () => { s('path', { d: `M${tx} ${ty} q${Rt * .9} ${-Rt * .2} ${Rt * 1.3} ${-Rt * 1.4}`, fill: 'none', stroke: tone.shadow, 'stroke-width': Rt * .14, 'stroke-linecap': 'round' }, body); for (const [dx, dy, sz, turn] of [[.5, -.3, .34, -35], [1.0, -.8, .3, -60], [1.25, -1.35, .26, -80]]) s('ellipse', { cx: tx + dx * Rt, cy: ty + dy * Rt, rx: sz * Rt, ry: sz * Rt * .55, transform: `rotate(${turn} ${tx + dx * Rt} ${ty + dy * Rt})`, fill: el.base, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, body); },
    tadpole: () => { s('path', { d: `M${tx - Rt * .2} ${ty - Rt * .15} q${Rt * 1.1} ${-Rt * .1} ${Rt * 1.5} ${-Rt * .9} q${-Rt * .2} ${Rt * .7} ${-Rt * 1.2} ${Rt * 1.15} z`, fill: tone.base, stroke: LINE, 'stroke-width': lw * .7, filter: 'url(#loose)' }, body); s('circle', { cx: tx + Rt * 1.2, cy: ty - Rt * .85, r: Rt * .14, fill: el.light }, body); },
    spark: () => { for (const [dx, dy, sz] of [[.45, -.5, .2], [.85, -1.0, .16], [1.15, -1.55, .12]]) s('circle', { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: el.light, stroke: el.base, 'stroke-width': .8 }, body); },
    emberwisp: () => { s('path', { d: `M${tx - Rt * .2} ${ty - Rt * .1} q${Rt * .9} ${-Rt * .4} ${Rt * 1.1} ${-Rt * 1.4} q${-Rt * .05} ${Rt * .8} ${-Rt * .8} ${Rt * 1.25} z`, fill: tone.base, stroke: LINE, 'stroke-width': lw * .7, filter: 'url(#loose)' }, body); s('circle', { cx: tx + Rt * .9, cy: ty - Rt * 1.45, r: Rt * .17, fill: el.light, stroke: el.base, 'stroke-width': .8 }, body); },
    cloudwisp: () => { for (const [dx, dy, sz] of [[.4, 0, .4], [.95, -.28, .3]]) s('circle', { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: tone.light, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, body); },
    longwisp: () => s('path', { d: `M${tx - Rt * .2} ${ty} q${Rt * 1.2} ${-Rt * .1} ${Rt * 1.7} ${-Rt * .8} q${Rt * .15} ${-Rt * .45} ${Rt * .45} ${-Rt * .8} q${-Rt * .6} ${Rt * .9} ${-Rt * 1.95} ${Rt * 1.75} z`, fill: tone.light, stroke: LINE, 'stroke-width': lw * .65, filter: 'url(#loose)' }, body),
  };
  tails[params.tailType]?.();
  const furGroup = s('g', { filter: st.grain ? 'url(#fur)' : null }, body);
  shaded(furGroup, defs, id, { cx: CENTER, cy: bodyY, rx: W, ry: H }, tone, st, lw);
  const belly = params.markings === 'belly' ? mix(tone.soft, el.light, .45) : tone.soft;
  s('ellipse', { cx: CENTER + W * .05, cy: bodyY + H * .32, rx: W * .56, ry: H * .52, fill: belly, opacity: .9 }, body);
  if (['moss', 'dew', 'sky'].includes(params.markings)) for (const [x, y, r] of [[-.52, -.18, .17], [.44, .06, .14], [-.3, .5, .11]]) s('ellipse', { cx: CENTER + x * W, cy: bodyY + y * H, rx: W * r, ry: H * r * .7, fill: el.light, opacity: .78 }, body);
  /* one soft glow point: chest, throat or brow */
  const glowAt = params.spot === 'throat' ? [CENTER, bodyY - H * .55] : params.spot === 'brow' ? null : [CENTER + W * .05, bodyY + H * .05];
  if (glowAt) { const glow = s('radialGradient', { id: `${id}-w${++serial}` }, defs); s('stop', { offset: 0, 'stop-color': params.glow, 'stop-opacity': .75 }, glow); s('stop', { offset: 1, 'stop-color': params.glow, 'stop-opacity': 0 }, glow); s('circle', { cx: glowAt[0], cy: glowAt[1], r: W * .42, fill: `url(#${glow.id})` }, body); }
  /* front paws on the belly, and slightly oversized feet */
  for (const side of [-1, 1]) shaded(body, defs, id, { cx: CENTER + side * W * .6, cy: bodyY + H * .1, rx: R * .24, ry: R * .32 }, tone, st, lw * .75, { transform: `rotate(${side * -22} ${CENTER + side * W * .6} ${bodyY + H * .1})` });
  for (const side of [-1, 1]) {
    s('ellipse', { cx: CENTER + side * W * .46, cy: FOOT - 3.5, rx: W * .36, ry: W * .21, fill: tone.base, stroke: LINE, 'stroke-width': lw * .8, filter: 'url(#loose)' }, body);
    s('ellipse', { cx: CENTER + side * W * .46, cy: FOOT - 3, rx: W * .2, ry: W * .1, fill: mix(tone.base, tone.shadow, .35) }, body);
  }
  const head = s('g', { class: 'p-head', transform: `translate(${CENTER} ${headY}) rotate(${params.headTilt})` }, body);
  if (params.earType !== 'none') for (const side of [-1, 1]) {
    const anchor = s('g', { transform: `translate(${side * R * .64} ${-R * .62}) rotate(${side * (params.earSpread + (params.earType === 'floppy' ? 70 : 0))})`, class: side < 0 ? 'p-ear-l' : 'p-ear-r' }, head);
    const w = earLength * (params.earType === 'long' ? .27 : .46), L = earLength * .95;
    const shapes = {
      pointed: `M${-w} 0 Q${-w * .8} ${-L * .55} 0 ${-L} Q${w * .8} ${-L * .55} ${w} 0 Z`,
      tufts: `M${-w} 0 L${-w * .8} ${-L * .65} L${-w * .15} ${-L * .5} L0 ${-L} L${w * .35} ${-L * .55} L${w} ${-L * .7} L${w} 0 Z`,
      leaf: `M0 0 C${-w * 1.3} ${-L * .35} ${-w * .7} ${-L * .8} 0 ${-L} C${w * .7} ${-L * .8} ${w * 1.3} ${-L * .35} 0 0 Z`,
      fin: `M${-w * .9} 0 C${-w * .6} ${-L * .5} ${w * .1} ${-L * .9} ${w * .7} ${-L} C${w * .5} ${-L * .6} ${w * .8} ${-L * .25} ${w} 0 Z`,
      flame: [[-w * .55, .7], [0, 1], [w * .55, .75]].map(([dx, hh]) => `M${dx - w * .4} 0 C${dx - w * .45} ${-L * hh * .5} ${dx - w * .1} ${-L * hh * .7} ${dx} ${-L * hh} C${dx + w * .1} ${-L * hh * .7} ${dx + w * .45} ${-L * hh * .5} ${dx + w * .4} 0 Z`).join(' '),
      cloud: [[0, -L * .42, L * .42], [w * .55, -L * .78, L * .28]].map(([cx, cy, sz]) => `M${cx - sz} ${cy} a${sz} ${sz} 0 1 0 ${2 * sz} 0 a${sz} ${sz} 0 1 0 ${-2 * sz} 0`).join(' '),
      fern: `M${-w * .45} 0 C${-w * .7} ${-L * .45} ${-w * .35} ${-L * .85} ${w * .15} ${-L * .95} C${w * .75} ${-L * 1.02} ${w * .8} ${-L * .62} ${w * .3} ${-L * .62} C${w * .05} ${-L * .62} ${w * .05} ${-L * .78} ${w * .25} ${-L * .78} C${w * .1} ${-L * .55} ${w * .45} ${-L * .3} ${w * .45} 0 Z`,
    };
    const d = shapes[params.earType] ?? `M${-w} 0 C${-w * 1.4} ${-L * .7} ${-w * .7} ${-L} 0 ${-L} C${w * .9} ${-L} ${w * 1.3} ${-L * .6} ${w} 0 Z`;
    const mirror = side < 0 ? s('g', { transform: 'scale(-1 1)' }, anchor) : anchor;
    s('path', { d, fill: tone.base, stroke: LINE, 'stroke-width': lw * .8, 'stroke-linejoin': 'round', filter: 'url(#loose)' }, mirror);
    s('path', { d, fill: mix(el.soft, el.light, .35), opacity: .9, transform: 'scale(.56 .68)' }, mirror);
  }
  shaded(head, defs, id, { cx: 0, cy: 0, rx: R, ry: R * (params.headShape === 'egg' ? 1.12 : params.headShape === 'squarish' ? .95 : 1) }, tone, st, lw);
  const top = -R * (params.headShape === 'egg' ? 1.12 : .98);
  const crests = {
    sapling: () => { s('rect', { x: -R * .05, y: top - R * .5, width: R * .1, height: R * .58, rx: R * .05, fill: el.shadow }, head); for (const [cx, cy, turn] of [[-R * .24, top - R * .5, -28], [R * .24, top - R * .36, 24]]) { s('ellipse', { cx, cy, rx: R * .26, ry: R * .13, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.base, stroke: LINE, 'stroke-width': lw * .55, filter: 'url(#loose)' }, head); s('ellipse', { cx: cx - R * .06, cy: cy - R * .04, rx: R * .12, ry: R * .05, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.light }, head); } },
    droplet: () => { s('path', { d: `M0 ${top - R * .72} C${R * .27} ${top - R * .35} ${R * .24} ${top + R * .06} 0 ${top + R * .06} C${-R * .24} ${top + R * .06} ${-R * .27} ${top - R * .35} 0 ${top - R * .72} Z`, fill: el.base, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, head); s('circle', { cx: -R * .07, cy: top - R * .3, r: R * .07, fill: el.light }, head); },
    reed: () => { s('rect', { x: -R * .04, y: top - R * .8, width: R * .08, height: R * .85, rx: R * .04, fill: el.shadow }, head); s('ellipse', { cx: 0, cy: top - R * .78, rx: R * .1, ry: R * .2, fill: el.base, stroke: LINE, 'stroke-width': lw * .5 }, head); },
    ember: () => { s('path', { d: `M${-R * .17} ${top + R * .05} C${-R * .22} ${top - R * .3} ${-R * .02} ${top - R * .45} ${R * .05} ${top - R * .78} C${R * .13} ${top - R * .4} ${R * .27} ${top - R * .25} ${R * .19} ${top + R * .05} Z`, fill: el.base, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, head); s('path', { d: `M${-R * .07} ${top + R * .02} C${-R * .09} ${top - R * .2} ${R * .02} ${top - R * .3} ${R * .04} ${top - R * .5} C${R * .07} ${top - R * .25} ${R * .12} ${top - R * .15} ${R * .09} ${top + R * .02} Z`, fill: el.light }, head); },
    seedpods: () => { for (const dx of [-.3, 0, .3]) { s('circle', { cx: dx * R, cy: top - R * (dx === 0 ? .28 : .13), r: R * .16, fill: el.base, stroke: LINE, 'stroke-width': lw * .5 }, head); s('circle', { cx: dx * R - R * .05, cy: top - R * (dx === 0 ? .33 : .18), r: R * .06, fill: el.light }, head); } },
  };
  crests[params.crest]?.();
  if (params.element === 'air') for (const [dx, sz] of [[-.12, .2], [.14, .15]]) s('circle', { cx: dx * R, cy: top - R * .08, r: sz * R, fill: el.light, stroke: LINE, 'stroke-width': lw * .5, filter: 'url(#loose)' }, head);
  if (params.markings !== 'none') s('ellipse', { cx: R * .14, cy: -R * .6, rx: R * .17, ry: R * .11, transform: `rotate(-12 ${R * .14} ${-R * .6})`, fill: el.light, opacity: .8 }, head);
  if (params.spot === 'brow') { const glow = s('radialGradient', { id: `${id}-b${++serial}` }, defs); s('stop', { offset: 0, 'stop-color': params.glow, 'stop-opacity': .8 }, glow); s('stop', { offset: 1, 'stop-color': params.glow, 'stop-opacity': 0 }, glow); s('circle', { cx: 0, cy: -R * .55, r: R * .4, fill: `url(#${glow.id})` }, head); }
  if (params.snout === 'muzzle') s('ellipse', { cx: R * .04, cy: R * .42, rx: R * .22, ry: R * .14, fill: tone.soft, stroke: LINE, 'stroke-width': lw * .45, filter: 'url(#loose)' }, head);
  /* big round dark matte eyes, one small highlight; asleep, two closed lids */
  const eyeR = R * (.24 + params.eyeSize * .8), spread = Math.min(1, Math.max(0, (params.eyeSpacing - .32) / .3));
  const ex = Math.max(eyeR + R * .1, R * (.38 + .16 * spread)), ey = R * (-.02 + (.5 - params.eyeHeight) * 1.2);
  for (const side of [-1, 1]) {
    const eye = s('g', { transform: `translate(${side * ex} ${ey})` }, head);
    if (asleep) { s('path', { d: `M${-eyeR * .78} ${eyeR * .05} Q0 ${eyeR * .62} ${eyeR * .78} ${eyeR * .05}`, fill: 'none', stroke: LINE, 'stroke-width': lw * .85, 'stroke-linecap': 'round' }, eye); continue; }
    const open = s('g', { class: 'p-eye' }, eye);
    const clip = s('clipPath', { id: `${id}-e${++serial}` }, defs); s('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06 }, clip);
    s('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: EYE }, open);
    s('ellipse', { cx: eyeR * .05, cy: eyeR * .5, rx: eyeR * .72, ry: eyeR * .42, fill: '#5B4350', opacity: .55, 'clip-path': `url(#${clip.id})` }, open);
    s('circle', { cx: -eyeR * .34, cy: -eyeR * .38, r: eyeR * .2, fill: PAGE }, open);
    s('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: 'none', stroke: LINE, 'stroke-width': lw * .5 }, open);
  }
  for (const side of [-1, 1]) s('ellipse', { cx: side * R * .74, cy: R * .52, rx: R * .14, ry: R * .08, fill: PEACH, class: 'p-cheek', style: params.cheeks ? 'opacity:.5' : '' }, head);
  if (params.snout === 'button') s('ellipse', { cx: R * .02, cy: R * .32, rx: R * .09, ry: R * .06, fill: tone.shadow }, head);
  s('path', { d: `M${-R * .1} ${R * .52} Q0 ${R * .58} ${R * .1} ${R * .52}`, fill: 'none', stroke: LINE, 'stroke-width': lw * .6, 'stroke-linecap': 'round', class: 'p-calm' }, head);
  s('path', { d: `M${-R * .13} ${R * .5} Q0 ${R * .68} ${R * .13} ${R * .5}`, fill: 'none', stroke: LINE, 'stroke-width': lw * .65, 'stroke-linecap': 'round', class: 'p-smile' }, head);
  return svg;
}
function crumbSvg(look, size = 20) {
  const k = look.tokens, svg = s('svg', { viewBox: '-9 -9 18 18', class: 'crumb', 'aria-hidden': 'true' }); svg.style.width = `${size}px`; svg.style.height = `${size}px`;
  const g = s('g', { filter: 'url(#fur)', class: 'cf' }, svg);
  s('path', { d: 'M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z', fill: k.gold }, g);
  s('ellipse', { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: k.goldHi, transform: 'rotate(-25 -2 -2.5)', class: 'ch' }, svg);
  s('path', { d: 'M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z', fill: 'none', stroke: look.critter.line, 'stroke-width': Math.min(1.6, look.critter.lineW * .6), 'stroke-linejoin': 'round', filter: 'url(#loose)', class: 'co' }, svg);
  return svg;
}
function crumbAt(svg, look, x, y, turn, scale) { const g = s('g', { transform: `translate(${x} ${y}) rotate(${turn}) scale(${scale})` }, svg); s('path', { d: 'M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z', fill: look.tokens.gold, stroke: look.critter.line, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, g); s('ellipse', { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: look.tokens.goldHi }, g); }
/* a mound of n crumbs, widest at the bottom; w and h are its size in viewBox units */
function moundSize(n) { let k = 0; while (k * (k + 1) / 2 < n) k++; return { k, w: Math.max(1, k) * 5.2 + 8, h: Math.max(1, k) * 3.4 + 9 }; }
function moundSvg(look, n, outlines = false) {
  const { k, w, h: hh } = moundSize(n || (outlines ? 3 : 0)), step = 5.2, rise = 3.4;
  const svg = s('svg', { viewBox: `${(-w / 2).toFixed(1)} ${(-hh + 4.5).toFixed(1)} ${w.toFixed(1)} ${hh.toFixed(1)}`, 'aria-hidden': 'true' });
  if (n) s('ellipse', { cx: 0, cy: 2, rx: w / 2 - 1.5, ry: 2.4, fill: look.critter.line, opacity: .16 }, svg);
  let placed = 0;
  for (let row = 0; row < k && placed < n; row++) {
    const count = Math.min(k - row, n - placed);
    for (let i = 0; i < count; i++, placed++) crumbAt(svg, look, (i - (count - 1) / 2) * step + ((placed * 13) % 5 - 2) * .3, -row * rise - 1, ((placed * 37) % 70) - 35, .4);
  }
  /* empty: three faint outlines where the heap was (Design System §7.4) */
  if (!n && outlines) for (const [x, turn] of [[-5.2, -12], [0, 18], [5.2, -4]]) s('path', { d: 'M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z', transform: `translate(${x} -1) rotate(${turn}) scale(.4)`, fill: 'none', stroke: look.critter.line, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: .4 }, svg);
  return { svg, w, h: hh };
}
function elementChip(element) { const e = ELEMENT[element]; const chip = h('span', { class: 'el', style: `--el-soft:${e.soft};--el-shadow:${e.shadow}` }); const icon = s('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true' }); use(e.icon, icon); chip.append(icon, e.label); return chip; }
function iconSvg(id, box = '0 0 20 20') { const svg = s('svg', { viewBox: box, 'aria-hidden': 'true' }); use(id, svg); return svg; }

export { BURROW, FEAST, ISSUED, VIEWER, MEMBERS, ELEMENT, GRAIN, SYS, DAYLIGHT, DAYLIGHT_TONES, LOOKS, NS, h, s, use, mix, applyLook, paragraphs, fill, UNIT, FOOT, CENTER, BOX_H, paint, crumbSvg, crumbAt, moundSize, moundSvg, elementChip, iconSvg };
