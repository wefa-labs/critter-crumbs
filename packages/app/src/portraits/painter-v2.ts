import type { CritterV2 } from '@critter-crumbs/core';
import { portraitMetrics } from './metrics.js';
import { palette } from './colour.js';
import { tokens } from '../styles/tokens.js';
import { rememberPortrait, type PortraitOptions } from './index.js';

type Attributes = Record<string, string | number | null | undefined>;
type Tone = { base: string; shadow: string; light: string; soft: string };
type Ellipse = { cx: number; cy: number; rx: number; ry: number };
export type PortraitLook = { line: string; lineW: number; shading: 'paint' | 'flat'; hatch: boolean; grain: boolean; cream: string; tones: readonly Tone[]; element?: boolean };
type DrawState = { size?: number; delighted?: boolean; fed?: number; asleep?: boolean };
export const inkedPortraitLook: PortraitLook = { line: tokens.burrow, lineW: tokens['portrait-line-width'], shading: 'paint', hatch: true, grain: true, cream: tokens['portrait-cream'], tones: [
 {base:tokens['portrait-tone-0-base'],shadow:tokens['portrait-tone-0-shadow'],light:tokens['portrait-tone-0-light'],soft:tokens['portrait-tone-0-soft']},
 {base:tokens['portrait-tone-1-base'],shadow:tokens['portrait-tone-1-shadow'],light:tokens['portrait-tone-1-light'],soft:tokens['portrait-tone-1-soft']},
 {base:tokens['portrait-tone-2-base'],shadow:tokens['portrait-tone-2-shadow'],light:tokens['portrait-tone-2-light'],soft:tokens['portrait-tone-2-soft']},
] };
const ELEMENT = {
 earth: {base:tokens['element-earth-base'],shadow:tokens['element-earth-shadow'],light:tokens['element-earth-light'],soft:tokens['element-earth-soft']},
 water: {base:tokens['element-water-base'],shadow:tokens['element-water-shadow'],light:tokens['element-water-light'],soft:tokens['element-water-soft']},
 fire: {base:tokens['element-fire-base'],shadow:tokens['element-fire-shadow'],light:tokens['element-fire-light'],soft:tokens['element-fire-soft']},
 air: {base:tokens['element-air-base'],shadow:tokens['element-air-shadow'],light:tokens['element-air-light'],soft:tokens['element-air-soft']},
};
const paintDefinitions = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="loose" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="loose2" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="fur" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .14  0 0 0 0 .11  0 0 0 0 .15  0 0 0 .16 0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/><feBlend in="SourceGraphic" in2="gi" mode="multiply"/></filter>
    <filter id="poster" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncG type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncB type="discrete" tableValues="0 .2 .4 .6 .8 1"/></feComponentTransfer></filter>
    <pattern id="strokes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><path d="M0 3.5 H4.6" stroke="${tokens.burrow}" stroke-width="1.7" stroke-linecap="round" opacity=".28"/></pattern>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 0 L0 4" stroke="${tokens.burrow}" stroke-width="1.1" opacity=".5"/></pattern>
</defs></svg>`;
let serial = 0;
const FOOT = 140, CENTER = 60, BOX_H = 150;
function mix(a: string, b: string, amount: number) { const rgb = (x: string) => [1,3,5].map(i=>parseInt(x.slice(i,i+2),16)); const A=rgb(a),B=rgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]!-v)*amount).toString(16).padStart(2,'0')).join(''); }
export function paintV2(document: Document, params: CritterV2, state: PortraitOptions & { delighted?: boolean }, look: PortraitLook = inkedPortraitLook): SVGSVGElement {
 function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attributes = {}, parent?: SVGElement): SVGElementTagNameMap[K] { const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))if(value!==null&&value!==undefined)node.setAttribute(key,String(value));parent?.append(node);return node; }
function paintedFill(defs: SVGElement, id: string, tone: Tone) {
  const grad = s('radialGradient', { id: `${id}-g${++serial}`, cx: .34, cy: .28, r: .95 }, defs);
  s('stop', { offset: 0, 'stop-color': tone.light }, grad); s('stop', { offset: .46, 'stop-color': tone.base }, grad); s('stop', { offset: 1, 'stop-color': tone.shadow }, grad);
  return `url(#${grad.id})`;
}
function shaded(parent: SVGElement, defs: SVGElement, id: string, e: Ellipse, tone: Tone, st: PortraitLook, strokeWidth: number, extra: Attributes = {}) {
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
function paint(params: CritterV2, st: PortraitLook, { size = 0, delighted = false, fed = 0, asleep = false }: DrawState = {}) {
  const el = ELEMENT[params.element], id = `pc${++serial}`;
  const own = palette(params).body.css;
  const base = st.element ? { base: el.light, shadow: el.base, light: el.soft, soft: el.soft } : st.tones[Math.floor(params.idlePhase * 3) % 3]!;
  const PAGE = tokens.oat, LINE = st.line, PEACH = tokens['portrait-cheek'], EYE = tokens['portrait-eye'], lw = st.lineW;
  /* the critter's own colour, softened toward the look's cream: lights warm, shadows cool (Appendix A) */
  const softened = mix(own, st.cream, .55);
  const tone = st.element ? base : { base: mix(softened, base.base, .25), shadow: mix(mix(own, LINE, .3), base.shadow, .3), light: mix(softened, tokens['portrait-light'], .45), soft: base.soft };
  const svg = s('svg', { viewBox: `0 0 120 ${BOX_H}`, class: `critter${delighted ? ' delighted' : ''}${asleep ? ' asleep' : ''}`, 'aria-hidden': 'true' });
  if (size) svg.style.width = `${size}px`;
  svg.style.setProperty('--head-tilt', `${params.headTilt}deg`);
  svg.style.setProperty('--cheeks', delighted || params.cheeks ? '1' : '0');
  svg.style.setProperty('--mouth', delighted ? '1' : '0');
  svg.style.setProperty('--d', `${(params.idlePhase * 5).toFixed(2)}s`);
  const defs = s('defs', {}, svg);
  const { R, W, H, Rt, bodyY, headY, earLength, fit, extent } = portraitMetrics(params, fed);
  for (const [key, value] of Object.entries(extent)) svg.dataset[key === 'headY' ? 'hy' : key === 'headRadius' ? 'hr' : key] = value.toFixed(3);
  s('ellipse', { cx: CENTER, cy: FOOT + 2, rx: W * 1.3 * fit, ry: 4.5, fill: LINE, opacity: .14 }, svg);
  const fitGroup = s('g', { transform: fit < 1 ? `translate(${CENTER} ${FOOT}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-FOOT})` : null }, svg);
  const figure = s('g', { class: 'portrait__figure' }, fitGroup);
  const body = s('g', { transform: fed ? `translate(${CENTER} ${FOOT}) scale(${(1 + .2 * fed).toFixed(3)}) translate(${-CENTER} ${-FOOT})` : null }, figure);
  const tx = CENTER + W * .9, ty = bodyY + H * .3;
  const tails: Record<string, () => unknown> = {
    puff: () => shaded(body, defs, id, { cx: CENTER + W * .95, cy: bodyY + H * .45, rx: Rt * .46, ry: Rt * .42 }, tone, st, lw * .8),
    stub: () => shaded(body, defs, id, { cx: CENTER + W * 1.02, cy: bodyY + H * .5, rx: Rt * .5, ry: Rt * .26 }, tone, st, lw * .75),
    branch: () => { s('path', { d: `M${tx} ${ty} q${Rt * .9} ${-Rt * .2} ${Rt * 1.3} ${-Rt * 1.4}`, fill: 'none', stroke: tone.shadow, 'stroke-width': Rt * .14, 'stroke-linecap': 'round' }, body); for (const [dx, dy, sz, turn] of ([[.5, -.3, .34, -35], [1.0, -.8, .3, -60], [1.25, -1.35, .26, -80]] as const)) s('ellipse', { cx: tx + dx * Rt, cy: ty + dy * Rt, rx: sz * Rt, ry: sz * Rt * .55, transform: `rotate(${turn} ${tx + dx * Rt} ${ty + dy * Rt})`, fill: el.base, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, body); },
    tadpole: () => { s('path', { d: `M${tx - Rt * .2} ${ty - Rt * .15} q${Rt * 1.1} ${-Rt * .1} ${Rt * 1.5} ${-Rt * .9} q${-Rt * .2} ${Rt * .7} ${-Rt * 1.2} ${Rt * 1.15} z`, fill: tone.base, stroke: LINE, 'stroke-width': lw * .7, filter: 'url(#loose)' }, body); s('circle', { cx: tx + Rt * 1.2, cy: ty - Rt * .85, r: Rt * .14, fill: el.light }, body); },
    spark: () => { for (const [dx, dy, sz] of ([[.45, -.5, .2], [.85, -1.0, .16], [1.15, -1.55, .12]] as const)) s('circle', { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: el.light, stroke: el.base, 'stroke-width': .8 }, body); },
    emberwisp: () => { s('path', { d: `M${tx - Rt * .2} ${ty - Rt * .1} q${Rt * .9} ${-Rt * .4} ${Rt * 1.1} ${-Rt * 1.4} q${-Rt * .05} ${Rt * .8} ${-Rt * .8} ${Rt * 1.25} z`, fill: tone.base, stroke: LINE, 'stroke-width': lw * .7, filter: 'url(#loose)' }, body); s('circle', { cx: tx + Rt * .9, cy: ty - Rt * 1.45, r: Rt * .17, fill: el.light, stroke: el.base, 'stroke-width': .8 }, body); },
    cloudwisp: () => { for (const [dx, dy, sz] of ([[.4, 0, .4], [.95, -.28, .3]] as const)) s('circle', { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: tone.light, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, body); },
    longwisp: () => s('path', { d: `M${tx - Rt * .2} ${ty} q${Rt * 1.2} ${-Rt * .1} ${Rt * 1.7} ${-Rt * .8} q${Rt * .15} ${-Rt * .45} ${Rt * .45} ${-Rt * .8} q${-Rt * .6} ${Rt * .9} ${-Rt * 1.95} ${Rt * 1.75} z`, fill: tone.light, stroke: LINE, 'stroke-width': lw * .65, filter: 'url(#loose)' }, body),
  };
  tails[params.tailType]?.();
  const furGroup = s('g', { filter: st.grain ? 'url(#fur)' : null }, body);
  shaded(furGroup, defs, id, { cx: CENTER, cy: bodyY, rx: W, ry: H }, tone, st, lw);
  const belly = params.markings === 'belly' ? mix(tone.soft, el.light, .45) : tone.soft;
  s('ellipse', { cx: CENTER + W * .05, cy: bodyY + H * .32, rx: W * .56, ry: H * .52, fill: belly, opacity: .9 }, body);
  if (['moss', 'dew', 'sky'].includes(params.markings)) for (const [x, y, r] of ([[-.52, -.18, .17], [.44, .06, .14], [-.3, .5, .11]] as const)) s('ellipse', { cx: CENTER + x * W, cy: bodyY + y * H, rx: W * r, ry: H * r * .7, fill: el.light, opacity: .78 }, body);
  /* one soft glow point: chest, throat or brow */
  const glowAt = params.spot === 'throat' ? [CENTER, bodyY - H * .55] : params.spot === 'brow' ? null : [CENTER + W * .05, bodyY + H * .05];
  if (glowAt) { const glow = s('radialGradient', { id: `${id}-w${++serial}` }, defs); s('stop', { offset: 0, 'stop-color': params.glow, 'stop-opacity': .75 }, glow); s('stop', { offset: 1, 'stop-color': params.glow, 'stop-opacity': 0 }, glow); s('circle', { cx: glowAt[0], cy: glowAt[1], r: W * .42, fill: `url(#${glow.id})` }, body); }
  /* front paws on the belly, and slightly oversized feet */
  for (const side of [-1, 1]) shaded(body, defs, id, { cx: CENTER + side * W * .6, cy: bodyY + H * .1, rx: R * .24, ry: R * .32 }, tone, st, lw * .75, { transform: `rotate(${side * -22} ${CENTER + side * W * .6} ${bodyY + H * .1})` });
  for (const side of [-1, 1]) {
    s('ellipse', { cx: CENTER + side * W * .46, cy: FOOT - 3.5, rx: W * .36, ry: W * .21, fill: tone.base, stroke: LINE, 'stroke-width': lw * .8, filter: 'url(#loose)' }, body);
    s('ellipse', { cx: CENTER + side * W * .46, cy: FOOT - 3, rx: W * .2, ry: W * .1, fill: mix(tone.base, tone.shadow, .35) }, body);
  }
  const headAnchor=s('g',{transform:`translate(${CENTER} ${headY})`},body);
  const head = s('g', { class: 'portrait__head', transform: `rotate(${params.headTilt})` }, headAnchor);
  for (const side of [-1, 1]) {
    const earAnchor = s('g', { transform: `translate(${side * R * .64} ${-R * .62})` }, head);
    const anchor = s('g', { class: `portrait__ear portrait__ear--${side < 0 ? 'l' : 'r'}`, style: `--ear-base:${side * params.earSpread}deg` }, earAnchor);
    const w = earLength * .46, L = earLength * .95;
    const shapes: Record<string, string> = {
      pointed: `M${-w} 0 Q${-w * .8} ${-L * .55} 0 ${-L} Q${w * .8} ${-L * .55} ${w} 0 Z`,
      tufts: `M${-w} 0 L${-w * .8} ${-L * .65} L${-w * .15} ${-L * .5} L0 ${-L} L${w * .35} ${-L * .55} L${w} ${-L * .7} L${w} 0 Z`,
      leaf: `M0 0 C${-w * 1.3} ${-L * .35} ${-w * .7} ${-L * .8} 0 ${-L} C${w * .7} ${-L * .8} ${w * 1.3} ${-L * .35} 0 0 Z`,
      fin: `M${-w * .9} 0 C${-w * .6} ${-L * .5} ${w * .1} ${-L * .9} ${w * .7} ${-L} C${w * .5} ${-L * .6} ${w * .8} ${-L * .25} ${w} 0 Z`,
      flame: ([[-w * .55, .7], [0, 1], [w * .55, .75]] as const).map(([dx, hh]) => `M${dx - w * .4} 0 C${dx - w * .45} ${-L * hh * .5} ${dx - w * .1} ${-L * hh * .7} ${dx} ${-L * hh} C${dx + w * .1} ${-L * hh * .7} ${dx + w * .45} ${-L * hh * .5} ${dx + w * .4} 0 Z`).join(' '),
      cloud: ([[0, -L * .42, L * .42], [w * .55, -L * .78, L * .28]] as const).map(([cx, cy, sz]) => `M${cx - sz} ${cy} a${sz} ${sz} 0 1 0 ${2 * sz} 0 a${sz} ${sz} 0 1 0 ${-2 * sz} 0`).join(' '),
      fern: `M${-w * .45} 0 C${-w * .7} ${-L * .45} ${-w * .35} ${-L * .85} ${w * .15} ${-L * .95} C${w * .75} ${-L * 1.02} ${w * .8} ${-L * .62} ${w * .3} ${-L * .62} C${w * .05} ${-L * .62} ${w * .05} ${-L * .78} ${w * .25} ${-L * .78} C${w * .1} ${-L * .55} ${w * .45} ${-L * .3} ${w * .45} 0 Z`,
    };
    const d = shapes[params.earType] ?? `M${-w} 0 C${-w * 1.4} ${-L * .7} ${-w * .7} ${-L} 0 ${-L} C${w * .9} ${-L} ${w * 1.3} ${-L * .6} ${w} 0 Z`;
    const mirror = side < 0 ? s('g', { transform: 'scale(-1 1)' }, anchor) : anchor;
    s('path', { d, fill: tone.base, stroke: LINE, 'stroke-width': lw * .8, 'stroke-linejoin': 'round', filter: 'url(#loose)' }, mirror);
    s('path', { d, fill: mix(el.soft, el.light, .35), opacity: .9, transform: 'scale(.56 .68)' }, mirror);
  }
  shaded(head, defs, id, { cx: 0, cy: 0, rx: R, ry: R * (params.headShape === 'egg' ? 1.12 : params.headShape === 'squarish' ? .95 : 1) }, tone, st, lw);
  const top = -R * (params.headShape === 'egg' ? 1.12 : .98);
  const crests: Record<string, () => unknown> = {
    sapling: () => { s('rect', { x: -R * .05, y: top - R * .5, width: R * .1, height: R * .58, rx: R * .05, fill: el.shadow }, head); for (const [cx, cy, turn] of ([[-R * .24, top - R * .5, -28], [R * .24, top - R * .36, 24]] as const)) { s('ellipse', { cx, cy, rx: R * .26, ry: R * .13, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.base, stroke: LINE, 'stroke-width': lw * .55, filter: 'url(#loose)' }, head); s('ellipse', { cx: cx - R * .06, cy: cy - R * .04, rx: R * .12, ry: R * .05, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.light }, head); } },
    droplet: () => { s('path', { d: `M0 ${top - R * .72} C${R * .27} ${top - R * .35} ${R * .24} ${top + R * .06} 0 ${top + R * .06} C${-R * .24} ${top + R * .06} ${-R * .27} ${top - R * .35} 0 ${top - R * .72} Z`, fill: el.base, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, head); s('circle', { cx: -R * .07, cy: top - R * .3, r: R * .07, fill: el.light }, head); },
    reed: () => { s('rect', { x: -R * .04, y: top - R * .8, width: R * .08, height: R * .85, rx: R * .04, fill: el.shadow }, head); s('ellipse', { cx: 0, cy: top - R * .78, rx: R * .1, ry: R * .2, fill: el.base, stroke: LINE, 'stroke-width': lw * .5 }, head); },
    ember: () => { s('path', { d: `M${-R * .17} ${top + R * .05} C${-R * .22} ${top - R * .3} ${-R * .02} ${top - R * .45} ${R * .05} ${top - R * .78} C${R * .13} ${top - R * .4} ${R * .27} ${top - R * .25} ${R * .19} ${top + R * .05} Z`, fill: el.base, stroke: LINE, 'stroke-width': lw * .6, filter: 'url(#loose)' }, head); s('path', { d: `M${-R * .07} ${top + R * .02} C${-R * .09} ${top - R * .2} ${R * .02} ${top - R * .3} ${R * .04} ${top - R * .5} C${R * .07} ${top - R * .25} ${R * .12} ${top - R * .15} ${R * .09} ${top + R * .02} Z`, fill: el.light }, head); },
    seedpods: () => { for (const dx of [-.3, 0, .3]) { s('circle', { cx: dx * R, cy: top - R * (dx === 0 ? .28 : .13), r: R * .16, fill: el.base, stroke: LINE, 'stroke-width': lw * .5 }, head); s('circle', { cx: dx * R - R * .05, cy: top - R * (dx === 0 ? .33 : .18), r: R * .06, fill: el.light }, head); } },
  };
  crests[params.crest]?.();
  if (params.element === 'air') for (const [dx, sz] of ([[-.12, .2], [.14, .15]] as const)) s('circle', { cx: dx * R, cy: top - R * .08, r: sz * R, fill: el.light, stroke: LINE, 'stroke-width': lw * .5, filter: 'url(#loose)' }, head);
  if (params.markings !== 'none') s('ellipse', { cx: R * .14, cy: -R * .6, rx: R * .17, ry: R * .11, transform: `rotate(-12 ${R * .14} ${-R * .6})`, fill: el.light, opacity: .8 }, head);
  if (params.spot === 'brow') { const glow = s('radialGradient', { id: `${id}-b${++serial}` }, defs); s('stop', { offset: 0, 'stop-color': params.glow, 'stop-opacity': .8 }, glow); s('stop', { offset: 1, 'stop-color': params.glow, 'stop-opacity': 0 }, glow); s('circle', { cx: 0, cy: -R * .55, r: R * .4, fill: `url(#${glow.id})` }, head); }
  if (params.snout === 'muzzle') s('ellipse', { cx: R * .04, cy: R * .42, rx: R * .22, ry: R * .14, fill: tone.soft, stroke: LINE, 'stroke-width': lw * .45, filter: 'url(#loose)' }, head);
  /* big round dark matte eyes, one small highlight; asleep, two closed lids */
  const eyeR = R * (.24 + params.eyeSize * .8), spread = Math.min(1, Math.max(0, (params.eyeSpacing - .32) / .3));
  const ex = Math.max(eyeR + R * .1, R * (.38 + .16 * spread)), ey = R * (-.02 + (.5 - params.eyeHeight) * 1.2);
  for (const side of [-1, 1]) {
    const eye = s('g', { transform: `translate(${side * ex} ${ey})` }, head);
    { s('path', { d: `M${-eyeR * .78} ${eyeR * .05} Q0 ${eyeR * .62} ${eyeR * .78} ${eyeR * .05}`, fill: 'none', stroke: LINE, 'stroke-width': lw * .85, 'stroke-linecap': 'round', class: 'portrait__sleep-eye' }, eye); }
    const open = s('g', { class: 'portrait__eye' }, eye);
    const clip = s('clipPath', { id: `${id}-e${++serial}` }, defs); s('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06 }, clip);
    s('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: EYE }, open);
    s('ellipse', { cx: eyeR * .05, cy: eyeR * .5, rx: eyeR * .72, ry: eyeR * .42, fill: tokens['portrait-eye-shade'], opacity: .55, 'clip-path': `url(#${clip.id})` }, open);
    s('circle', { cx: -eyeR * .34, cy: -eyeR * .38, r: eyeR * .2, fill: PAGE }, open);
    s('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: 'none', stroke: LINE, 'stroke-width': lw * .5 }, open);
  }
  for (const side of [-1, 1]) s('ellipse', { cx: side * R * .74, cy: R * .52, rx: R * .14, ry: R * .08, fill: PEACH, class: 'portrait__cheek', style: params.cheeks ? 'opacity:.5' : '' }, head);
  if (params.snout === 'button') s('ellipse', { cx: R * .02, cy: R * .32, rx: R * .09, ry: R * .06, fill: tone.shadow }, head);
  s('path', { d: `M${-R * .1} ${R * .52} Q0 ${R * .58} ${R * .1} ${R * .52}`, fill: 'none', stroke: LINE, 'stroke-width': lw * .6, 'stroke-linecap': 'round', class: 'p-calm' }, head);
  s('path', { d: `M${-R * .13} ${R * .5} Q0 ${R * .68} ${R * .13} ${R * .5}`, fill: 'none', stroke: LINE, 'stroke-width': lw * .65, 'stroke-linecap': 'round', class: 'portrait__mouth' }, head);
  rememberPortrait(svg,{headRadius:R,eyeRadius:eyeR});
  svg.dataset.asleep = String(asleep);
  svg.classList.add('portrait', 'portrait-v2');
  return svg;
}

 const svg=paint(params,look,{...state,size:typeof state.size === 'number'?state.size:0});
 const source=new DOMParser().parseFromString(paintDefinitions,'image/svg+xml');
 const defs=document.importNode(source.documentElement.querySelector('defs')!,true);
 svg.prepend(defs);
 for(const node of svg.querySelectorAll('[id]')) { const previous=node.id; const next=`paint-${++serial}-${previous}`; node.id=next;for(const drawn of svg.querySelectorAll('*'))for(const attribute of Array.from(drawn.attributes))if(attribute.value.includes(`url(#${previous})`))drawn.setAttribute(attribute.name,attribute.value.replaceAll(`url(#${previous})`,`url(#${next})`)); }
 svg.dataset.version=params.version;
 svg.dataset.size=String(state.size ?? 'stage');
 if(typeof state.size==='number'){svg.setAttribute('width',String(state.size));svg.setAttribute('height',String(state.size*1.25));}
 if(state.decorative){svg.setAttribute('aria-hidden','true');}else{svg.removeAttribute('aria-hidden');svg.setAttribute('role','img');s('title',{},svg).textContent=state.name;}
 return svg;
}
