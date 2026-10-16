/** Eight-species portrait refinement. Review rendering only; uses the frozen v2 comparison draw. */
import type { CritterV2 } from '@critter-crumbs/core';
import { rememberPortrait, UNIT } from '../index.js';
import { drawFace } from './face.js';
import { BOX_H, CENTER, CREAM, ELEMENT, FOOT, INK, Pen, blob, curve, ellipsePath, f, mix, oklch, stream, toneOf, type Element, type Tone } from './ink.js';

export type GardenSpecies = 'squirrel' | 'moth' | 'turtle' | 'koi' | 'fox' | 'phoenix' | 'lemur' | 'lamb';
export const SPECIES: Record<Element, readonly [GardenSpecies, GardenSpecies]> = { earth: ['squirrel', 'moth'], water: ['turtle', 'koi'], fire: ['fox', 'phoenix'], air: ['lemur', 'lamb'] };
export const SPECIES_NAMES: Record<GardenSpecies, string> = { squirrel: 'Acorn squirrel', moth: 'Lichen moth', turtle: 'Pond turtle', koi: 'Koi kite', fox: 'Ember fox', phoenix: 'Phoenix chick', lemur: 'Flying lemur', lamb: 'Cloud lamb' };
export const FLIERS = new Set<GardenSpecies>(['moth', 'koi', 'phoenix', 'lemur', 'lamb']);
const clamp01 = (x: number) => Math.min(0.999, Math.max(0, x));

/** Sixteen uniform numbers from the version 2 draw: each is one of its continuous draws, rescaled to 0..1. */
export function uniforms(p: CritterV2) {
  return [(p.bodyHeight - 0.85) / 0.4, (p.bodyWidth - 0.75) / 0.4, p.belly / 0.3, (p.headSize - 0.5) / 0.22, (p.headTilt + 8) / 16, (p.earSize - 0.18) / 0.32, (p.earSpread - 35) / 40,
    (p.eyeSize - 0.1) / 0.1, (p.eyeSpacing - 0.32) / 0.3, (p.eyeHeight - 0.45) / 0.17, (p.pupilSize - 0.45) / 0.25, (p.legLength - 0.15) / 0.2, (p.chroma - 0.06) / 0.07, (p.lightness - 0.58) / 0.18, (p.accentShift - 15) / 30, p.idlePhase].map(clamp01);
}
export function gardenDraw(p: CritterV2, finish: 'ink' | 'painted' = 'painted') {
  const u = uniforms(p), element = p.element as Element, species = SPECIES[element][u[15]! < 0.5 ? 0 : 1];
  // the painted finish draws every head a fifth larger, so faces still read when a wide species is fitted into 40 px
  return { element, species, u, seed: Math.floor(u[15]! * 1e9) ^ Math.floor(u[1]! * 1e6), finish, head: finish === 'painted' ? 1.2 : 1 };
}
export type GardenDraw = ReturnType<typeof gardenDraw>;

interface Geo { top: number; left: number; right: number; headX: number; headY: number; headR: number; hover: number }
interface Species { geo: Geo; draw: (pen: Pen, g: SVGGElement, s: DrawState) => void }
export interface DrawState { asleep: boolean; delighted: boolean; fed: number }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** One of a species' coats, chosen by a draw: within a species, colour is the first thing that tells two critters apart. */
const pick = <T,>(list: readonly T[], x: number) => list[Math.min(list.length - 1, Math.floor(x * list.length))]!;

/** The face parameters every species shares, from the same draws. */
function faceFrom(u: number[], r: number) { return { r, eye: 0.265 + 0.065 * u[7]!, spread: 0.4 + 0.12 * u[8]!, eyeY: -0.04 + 0.12 * (0.5 - u[9]!), character: u[10]! < .34 ? 'round' as const : u[10]! < .67 ? 'keen' as const : 'dreamy' as const }; }
/** The element's palette as forms: base and light for the material, a softened soft for insides. */
const elTone = (e: Element, k = 0): Tone => { const E = ELEMENT[e]; return { light: mix(E.light, CREAM, 0.25 + k), base: mix(E.base, E.light, 0.25 + k), shadow: E.shadow }; };
/** A creature's own colour, softened toward the warm cream so it sits in the painting (Inked daylight). */
const own = (l: number, c: number, h: number, soften = 0.28) => toneOf(mix(oklch(l, c, h), CREAM, soften));

/* ------------------------------------------------------------------ shared parts */
function oakLeaf(pen: Pen, parent: SVGGElement, x: number, y: number, size: number, angle: number, tone: Tone) {
  const s = size, half = s * 0.42;
  // a lobed oak leaf pointing up from its stalk at (0, 0)
  const pts: [number, number][] = [[0, 0], [half * 0.55, -s * 0.15], [half * 0.95, -s * 0.28], [half * 0.6, -s * 0.38], [half * 1.0, -s * 0.52], [half * 0.55, -s * 0.62], [half * 0.8, -s * 0.78], [0, -s], [-half * 0.8, -s * 0.78], [-half * 0.55, -s * 0.62], [-half * 1.0, -s * 0.52], [-half * 0.6, -s * 0.38], [-half * 0.95, -s * 0.28], [-half * 0.55, -s * 0.15]];
  const g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)}) rotate(${f(angle)})` });
  pen.form(g, blob(pts, 0.7), tone, { weight: 0.55, size: s * 0.5 });
  pen.stroke(g, `M0 ${f(-s * 0.05)}L0 ${f(-s * 0.85)}`, pen.lw * 0.35, { opacity: 0.6 });
  return g;
}
function acorn(pen: Pen, parent: SVGGElement, x: number, y: number, s: number, glowCol: string) {
  const g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)})` });
  pen.glow(g, 0, -s * 0.2, s * 1.4, glowCol, 0.45);
  pen.form(g, ellipsePath(0, s * 0.25, s * 0.55, s * 0.68), toneOf('#C8955A'), { weight: 0.5, size: s * 0.5 });
  pen.form(g, `M${f(-s * 0.68)} ${f(-s * 0.05)}Q0 ${f(-s * 0.85)} ${f(s * 0.68)} ${f(-s * 0.05)}Q0 ${f(s * 0.2)} ${f(-s * 0.68)} ${f(-s * 0.05)}Z`, toneOf('#7A5233'), { weight: 0.5, size: s * 0.4, grain: true });
  pen.stroke(g, `M0 ${f(-s * 0.45)}q${f(s * 0.1)} ${f(-s * 0.3)} ${f(s * 0.3)} ${f(-s * 0.35)}`, pen.lw * 0.4);
}
function flame(pen: Pen, parent: SVGGElement, x: number, y: number, s: number, cls = '') {
  const g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)})`, class: cls });
  const E = ELEMENT.fire;
  pen.glow(g, 0, -s * 0.35, s * 1.25, E.glow, 0.5);
  const d = `M0 ${f(-s * 1.15)}C${f(s * 0.25)} ${f(-s * 0.75)} ${f(s * 0.62)} ${f(-s * 0.48)} ${f(s * 0.5)} ${f(-s * 0.05)}C${f(s * 0.42)} ${f(s * 0.32)} ${f(-s * 0.42)} ${f(s * 0.32)} ${f(-s * 0.5)} ${f(-s * 0.05)}C${f(-s * 0.58)} ${f(-s * 0.42)} ${f(-s * 0.12)} ${f(-s * 0.62)} 0 ${f(-s * 1.15)}Z`;
  pen.form(g, d, { light: mix(E.light, '#FFF3D6', 0.4), base: E.light, shadow: E.base }, { weight: 0.5, size: s * 0.6 });
  pen.patch(g, `M0 ${f(-s * 0.55)}C${f(s * 0.18)} ${f(-s * 0.32)} ${f(s * 0.25)} ${f(-s * 0.05)} 0 ${f(s * 0.12)}C${f(-s * 0.25)} ${f(-s * 0.05)} ${f(-s * 0.15)} ${f(-s * 0.32)} 0 ${f(-s * 0.55)}Z`, '#FFF0C9', 0.85);
  return g;
}
/** An ear drawn pointing up from its base at (0, 0), inside a group the app can rotate (`.portrait__ear`). */
function ear(pen: Pen, head: SVGGElement, side: -1 | 1, at: [number, number], angle: number, d: string, tone: Tone, inner: string | null, size: number) {
  const anchor = pen.g(head, { transform: `translate(${f(at[0])} ${f(at[1])})` });
  const rot = pen.g(anchor, { class: `portrait__ear portrait__ear--${side < 0 ? 'l' : 'r'}`, style: `--ear-base:${f(side * angle)}deg` });
  const mirror = side < 0 ? pen.g(rot, { transform: 'scale(-1 1)' }) : rot;
  pen.form(mirror, d, tone, { weight: 0.75, size });
  if (inner) pen.patch(mirror, d, inner, 0.85, { transform: 'translate(0 -1) scale(.55 .7)' });
  return rot;
}
/**
 * A wing group whose origin is the wing's root on the body. The placement lives on a parent group, so the sleep fold
 * in style.css (`scale` on `.cr-wing`) pivots at the root and the mirrored wing stays on its own side.
 */
function wingAt(pen: Pen, parent: SVGGElement, root: string, side: number, fold: number) {
  return pen.g(pen.g(parent, { transform: root }), { class: `cr-wing cr-wing-${side < 0 ? 'l' : 'r'}`, transform: `scale(${f(side * fold)} 1)` });
}
const roundEar = (w: number, L: number) => `M${f(-w)} 0C${f(-w * 1.15)} ${f(-L * 0.62)} ${f(-w * 0.45)} ${f(-L * 1.02)} 0 ${f(-L)}C${f(w * 0.5)} ${f(-L * 1.02)} ${f(w * 1.15)} ${f(-L * 0.6)} ${f(w)} 0Z`;
const pointEar = (w: number, L: number) => `M${f(-w)} 0C${f(-w * 0.9)} ${f(-L * 0.45)} ${f(-w * 0.25)} ${f(-L * 0.9)} ${f(-w * 0.05)} ${f(-L)}Q0 ${f(-L * 1.04)} ${f(w * 0.08)} ${f(-L * 0.98)}C${f(w * 0.35)} ${f(-L * 0.85)} ${f(w * 0.95)} ${f(-L * 0.42)} ${f(w)} 0Z`;
/** A small wind-blown wisp, for cloud tails and drifting edges. */
function wisp(pen: Pen, parent: SVGGElement, x: number, y: number, s: number, tone: Tone) {
  const d = `M${f(x)} ${f(y)}c${f(s * 0.4)} ${f(-s * 0.55)} ${f(s * 1.2)} ${f(-s * 0.5)} ${f(s * 1.35)} ${f(-s * 0.05)}c${f(-s * 0.45)} ${f(-s * 0.15)} ${f(-s * 0.85)} ${f(s * 0.05)} ${f(-s * 1.0)} ${f(s * 0.32)}c${f(-s * 0.12)} ${f(s * 0.12)} ${f(-s * 0.3)} ${f(s * 0.02)} ${f(-s * 0.35)} ${f(-s * 0.27)}Z`;
  pen.form(parent, d, tone, { weight: 0.5, size: s * 0.6, flat: true });
}

/* ------------------------------------------------------------------ earth, on the ground: the acorn squirrel */
function squirrel(d: GardenDraw): Species {
  const u = d.u, W = 18 + 6 * u[1]!, H = 22 + 6 * u[0]!, bodyY = FOOT - 4 - H, R = (21 + 5 * u[3]!) * d.head;
  const headX = CENTER - 1, headY = bodyY - H * 0.72 - R * 0.55, earL = R * (0.55 + 0.35 * u[5]!), spread = 16 + 14 * u[6]!;
  const sapling = u[2]! > 0.45, plume = 1 + 0.25 * u[12]!, tailTop = bodyY - H * 1.45 * plume - 8;
  const top = Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tailTop - 6, sapling ? headY - R - R * 0.5 : Infinity);
  // coats: russet, chestnut, golden, ash
  const coat = pick([[0.64, 0.1, 48], [0.55, 0.09, 38], [0.72, 0.1, 78], [0.66, 0.035, 60]] as const, u[14]!);
  const fur = own(coat[0] + 0.06 * (u[13]! - 0.5), coat[1], coat[2]), belly = toneOf(mix(CREAM, fur.base, 0.18));
  const autumn = u[12]! > 0.55, leafA = autumn ? toneOf(mix('#C7843A', CREAM, 0.15), '#5A3A2A') : elTone('earth'), leafB = autumn ? toneOf(mix('#B5562E', CREAM, 0.18), '#4A2A2A') : toneOf(mix(mix(ELEMENT.earth.base, '#C9A24A', 0.35), CREAM, 0.15), '#2E4A3A');
  return { geo: { top, left: CENTER - W - 12, right: CENTER + W + 34, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
    const rand = stream(d.seed);
    // the tail: a big S of oak leaves, layered from its root up to a curled tip, two acorns tucked in it
    const tail = pen.g(g, { class: 'cr-tail' });
    const spine: [number, number][] = [[CENTER + W * 0.7, bodyY + H * 0.5], [CENTER + W + 14, bodyY + H * 0.1], [CENTER + W + 19, bodyY - H * 0.65 * plume], [CENTER + W + 12, tailTop + 6], [CENTER + W + 2, tailTop + 2]];
    const along = (t: number) => { const i = Math.min(spine.length - 2, Math.floor(t * (spine.length - 1))), k = t * (spine.length - 1) - i, a = spine[i]!, b = spine[i + 1]!; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)] as [number, number]; };
    // a bushy fur tail first, so the leaves grow out of the body rather than float beside it
    const brush = blob([[CENTER + W * 0.55, bodyY + H * 0.62], [CENTER + W + 17, bodyY + H * 0.25], [CENTER + W + 24, bodyY - H * 0.6 * plume], [CENTER + W + 16, tailTop + 9], [CENTER + W + 4, tailTop + 6], [CENTER + W + 8, bodyY - H * 0.55 * plume], [CENTER + W * 0.95, bodyY + H * 0.05]], 0.9);
    pen.form(tail, brush, fur, { size: 10, grain: true });
    const count = 6 + Math.floor(u[13]! * 3);
    for (let i = 0; i < count; i++) {
      const t = 0.08 + 0.92 * i / (count - 1), [x, y] = along(t), side = i % 2 ? 1 : -1, size = 11 + 6 * Math.sin(t * Math.PI) + 2 * rand();
      oakLeaf(pen, tail, x + side * (3 + 4 * Math.sin(t * Math.PI)), y + 2, size, side * (35 + 30 * rand()) + 15 - t * 30, i % 3 === 1 ? leafB : leafA);
    }
    acorn(pen, tail, CENTER + W + 19, bodyY - H * 0.45, 4.6, ELEMENT.earth.glow);
    acorn(pen, tail, CENTER + W + 8, bodyY - H * 0.05, 4.0, ELEMENT.earth.glow);
    // a sitting pear: haunches wide at the floor, belly, a glow in the chest, bark rings or moss freckles
    const body = blob([[CENTER, bodyY - H], [CENTER + W * 0.78, bodyY - H * 0.66], [CENTER + W * 0.98, bodyY + H * 0.05], [CENTER + W * 1.08, bodyY + H * 0.72], [CENTER + W * 0.6, bodyY + H * 1.0], [CENTER - W * 0.6, bodyY + H * 1.0], [CENTER - W * 1.08, bodyY + H * 0.72], [CENTER - W * 0.98, bodyY + H * 0.05], [CENTER - W * 0.78, bodyY - H * 0.66]]);
    pen.form(g, body, fur, { size: W, grain: true });
    pen.patch(g, ellipsePath(CENTER + 1, bodyY + H * 0.28, W * 0.6, H * 0.6), belly.base, 0.92);
    pen.glow(g, CENTER, bodyY - H * 0.05, W * 0.55, ELEMENT.earth.glow, 0.42);
    if (u[11]! > 0.5) for (const k of [0, 1]) pen.stroke(g, curve([[CENTER - W * 0.95, bodyY - H * (0.3 - k * 0.32)], [CENTER - W * 0.62, bodyY - H * (0.42 - k * 0.32)], [CENTER - W * 0.32, bodyY - H * (0.34 - k * 0.32)]]), pen.lw * 0.5, { opacity: 0.55 });
    else for (const [x, y, r] of [[-0.6, -0.3, 2.4], [-0.78, 0.18, 1.8], [0.62, -0.42, 2]] as const) pen.patch(g, ellipsePath(CENTER + x * W, bodyY + y * H, r, r * 0.8), ELEMENT.earth.light, 0.75);
    for (const side of [-1, 1]) pen.form(g, ellipsePath(CENTER + side * W * 0.48, bodyY - H * 0.04, 5.2, 6.4), fur, { weight: 0.7, size: 5, attrs: { transform: `rotate(${side * -18} ${f(CENTER + side * W * 0.48)} ${f(bodyY)})` } });
    for (const side of [-1, 1]) pen.form(g, ellipsePath(CENTER + side * W * 0.52, FOOT - 3.2, 9.5, 4.8), toneOf(mix(fur.base, '#6B5040', 0.25)), { weight: 0.8, size: 6 });
    const anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    for (const side of [-1, 1] as const) {
      const e = ear(pen, head, side, [side * R * 0.58, -R * 0.66], spread, roundEar(R * 0.33, earL), fur, mix('#F2C6B4', fur.base, 0.2), R * 0.3);
      if (u[5]! > 0.55) pen.stroke(side < 0 ? pen.g(e, { transform: 'scale(-1 1)' }) : e, `M0 ${f(-earL * 0.95)}q2 -4 0.5 -7m-0.5 7q-2 -3.5 -1 -6`, pen.lw * 0.6);
    }
    if (sapling) { const sg = pen.g(head); pen.stroke(sg, `M0 ${f(-R * 0.92)}q1 ${f(-R * 0.25)} -1 ${f(-R * 0.48)}`, pen.lw * 0.9, { stroke: ELEMENT.earth.shadow }); oakLeaf(pen, sg, -1, -R * 1.3, 8, -40, elTone('earth')); oakLeaf(pen, sg, 0, -R * 1.25, 7, 35, leafB); }
    pen.form(head, ellipsePath(0, 0, R, R * 0.96), fur, { size: R, grain: true });
    pen.patch(head, ellipsePath(0, R * 0.36, R * 0.55, R * 0.4), belly.base, 0.9);
    drawFace(pen, head, { ...faceFrom(u, R), kind: 'mammal', cheeks: u[2]! > 0.3 || s.delighted, delighted: s.delighted });
  } };
}

/* ------------------------------------------------------------------ earth, in the air: the lichen moth */
function moth(d: GardenDraw): Species {
  const u = d.u, R = (23 + 5 * u[0]!) * (0.5 + d.head / 2), hover = 17 + 6 * u[11]!, cy = FOOT - hover - R - 2, span = R + 13 + 6 * u[1]!;
  // wings: birch bark, oak bark, moss or rust; fur that suits them
  const wingBase = pick(['#B9AE98', '#9C7E62', '#93A27C', '#B47A54', '#A79AB5'], (u[14]! * 2.7 + u[10]! * 1.9) % 1), furC = pick([[0.88, 0.03, 80], [0.8, 0.02, 250], [0.78, 0.05, 60]] as const, u[13]!), fur = own(furC[0], furC[1], furC[2], 0.12);
  const wing = toneOf(mix(wingBase, CREAM, 0.12), '#3A3F45'), lichen = mix(ELEMENT.earth.light, '#DCE0CB', 0.5), band = mix(wingBase, INK, 0.28);
  const eyespot = u[12]! > 0.4;
  return { geo: { top: cy - R - 22, left: CENTER - span - 4, right: CENTER + span + 4, headX: CENTER, headY: cy, headR: R, hover }, draw(pen, g, s) {
    const rand = stream(d.seed), fold = s.asleep ? 0.62 : 1;
    for (const side of [-1, 1] as const) {
      const wingG = wingAt(pen, g, `translate(${f(CENTER)} ${f(cy)})`, side, fold);
      const upper = blob([[R * 0.42, -R * 0.4], [R * 0.75, -R * 1.02], [span * 0.72, -R * 1.25], [span * 1.02, -R * 0.95], [span * 0.95, -R * 0.2], [span * 0.68, R * 0.05], [R * 0.55, R * 0.08]], 0.85);
      const lower = blob([[R * 0.45, R * 0.02], [span * 0.6, R * 0.12], [span * 0.74, R * 0.55], [span * 0.52, R * 0.95], [span * 0.38, R * 0.78], [R * 0.55, R * 0.62]], 0.85);
      pen.form(wingG, lower, toneOf(mix(wing.base, CREAM, 0.38)), { size: R * 0.5, weight: 0.8, grain: true });
      pen.form(wingG, upper, wing, { size: R * 0.75, weight: 0.85, grain: true });
      const inside = pen.g(wingG, { 'clip-path': pen.clip(upper) });
      // a dark band and bark lines across the wing, lichen spots on it
      pen.stroke(inside, curve([[span * 0.42, -R * 1.25], [span * 0.55, -R * 0.65], [span * 0.48, R * 0.1]]), 3.2, { stroke: band, opacity: 0.45, filter: null });
      for (let k = 0; k < 3; k++) pen.stroke(inside, curve([[R * 0.7 + k * 7, -R * 0.82 + k * 2], [R * 0.92 + k * 9, -R * 0.45], [R * 0.82 + k * 10, -R * 0.02]]), pen.lw * 0.35, { opacity: 0.4 });
      for (let k = 0; k < 7; k++) { const x = span * (0.5 + 0.45 * rand()), y = -R * (0.1 + 0.95 * rand()), r = 1.5 + 2.4 * rand(); pen.patch(inside, ellipsePath(x, y, r, r * 0.85), lichen, 0.85); }
      if (eyespot) { const ex = span * 0.76, ey = -R * 0.62; pen.glow(wingG, ex, ey, 8, ELEMENT.earth.glow, 0.6); pen.el('circle', { cx: ex, cy: ey, r: 4.6, fill: '#F4E4B4', stroke: INK, 'stroke-width': pen.lw * 0.4 }, wingG); pen.el('circle', { cx: ex + 0.4, cy: ey + 0.3, r: 2.2, fill: mix(ELEMENT.earth.shadow, INK, 0.3) }, wingG); }
      else pen.patch(wingG, `M${f(span * 0.98)} ${f(-R * 0.9)}q${f(-span * 0.12)} ${f(R * 0.15)} ${f(-span * 0.08)} ${f(R * 0.5)}`, 'none', 0.9, { stroke: '#F4E4B4', 'stroke-width': 2.2, 'stroke-linecap': 'round' });
    }
    // antennae: two fern fiddleheads
    for (const side of [-1, 1]) {
      const x0 = CENTER + side * R * 0.32, y0 = cy - R * 0.86, x1 = x0 + side * 7, y1 = y0 - 14;
      pen.stroke(g, `M${f(x0)} ${f(y0)}Q${f(x0 + side * 1)} ${f(y0 - 9)} ${f(x1)} ${f(y1)}a3.6 3.6 0 1 ${side > 0 ? 1 : 0} ${f(side * 3)} ${f(4.2)}a1.9 1.9 0 1 ${side > 0 ? 1 : 0} ${f(-side * 2.6)} ${f(-0.6)}`, pen.lw * 0.95, { stroke: mix(ELEMENT.earth.shadow, INK, 0.35) });
      for (let k = 1; k <= 3; k++) pen.stroke(g, `M${f(x0 + side * k * 1.2)} ${f(y0 - k * 3.5)}l${f(side * 3.2)} ${f(-1.2)}`, pen.lw * 0.45, { stroke: ELEMENT.earth.base, opacity: 0.85 });
    }
    // the fuzzy round body, a lighter ruff round the face, two tucked feet
    const fuzz = blob(Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2, k = i % 2 ? 1 : 0.95; return [CENTER + Math.cos(a) * R * k, cy + Math.sin(a) * R * 1.02 * k] as [number, number]; }), 1);
    pen.form(g, fuzz, fur, { size: R, grain: true });
    pen.patch(g, ellipsePath(CENTER, cy + R * 0.12, R * 0.78, R * 0.62), mix(fur.light, '#FFFFFF', 0.3), 0.5);
    for (const side of [-1, 1]) pen.form(g, ellipsePath(CENTER + side * 6, cy + R + 1.5, 2.6, 3.2), toneOf('#8A7462'), { weight: 0.5, size: 2 });
    const anchor = pen.g(g, { transform: `translate(${CENTER} ${f(cy - R * 0.05)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    drawFace(pen, head, { ...faceFrom(u, R * 0.92), kind: 'mammal', cheeks: true, delighted: s.delighted, noseTone: '#6B5040' });
  } };
}

/* ------------------------------------------------------------------ water, on the ground: the pond turtle */
function turtle(d: GardenDraw): Species {
  const u = d.u, rx = 34 + 6 * u[1]!, ry = 21 + 4 * u[0]!, sx = CENTER + 7, sy = FOOT - 7 - ry * 0.8, R = (19 + 4 * u[3]!) * d.head, headX = CENTER - 13, headY = FOOT - 24 - R * 0.55;
  // skin: pond teal, sea green or slate blue; stones: river grey, sand or moss-grown
  const skinC = pick([[0.64, 0.07, 178], [0.66, 0.07, 150], [0.6, 0.05, 232]] as const, u[14]!), skin = own(skinC[0] + 0.06 * (u[13]! - 0.5), skinC[1], skinC[2], 0.2);
  const stoneSet = pick([['#B9B2A3', '#A8B4B4', '#C4BBA9', '#9FAAAE'], ['#D3C1A0', '#C9B48E', '#DCCDB2', '#BFA987'], ['#A9B29A', '#9DAA8E', '#B8BEA6', '#8E9C84']] as const, u[12]!);
  const garden = u[2]!, reed = garden > 0.66, flower = garden < 0.33;
  return { geo: { top: Math.min(sy - ry - 4, headY - R - 3, reed ? sy - ry - 22 : Infinity), left: Math.min(headX - R - 3, sx - rx - 3), right: sx + rx + 6, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
    const rand = stream(d.seed);
    pen.form(g, ellipsePath(sx + rx * 0.72, FOOT - 4, 8, 5.5), skin, { weight: 0.7, size: 6 });
    const dome = `M${f(sx - rx)} ${f(sy + ry * 0.55)}C${f(sx - rx)} ${f(sy - ry * 0.9)} ${f(sx - rx * 0.5)} ${f(sy - ry * 1.05)} ${f(sx)} ${f(sy - ry * 1.05)}C${f(sx + rx * 0.5)} ${f(sy - ry * 1.05)} ${f(sx + rx)} ${f(sy - ry * 0.9)} ${f(sx + rx)} ${f(sy + ry * 0.55)}C${f(sx + rx * 0.6)} ${f(sy + ry * 0.85)} ${f(sx - rx * 0.6)} ${f(sy + ry * 0.85)} ${f(sx - rx)} ${f(sy + ry * 0.55)}Z`;
    pen.form(g, dome, toneOf(stoneSet[3]!, '#3E4F63'), { size: rx * 0.7, grain: true });
    const stones = pen.g(g, { 'clip-path': pen.clip(dome) });
    const cells: [number, number, number, number][] = [[-0.55, -0.35, 0.3, 0.42], [0, -0.62, 0.34, 0.36], [0.55, -0.35, 0.3, 0.42], [-0.78, 0.25, 0.26, 0.38], [-0.28, 0.12, 0.27, 0.4], [0.25, 0.12, 0.27, 0.4], [0.76, 0.25, 0.26, 0.38]];
    cells.forEach(([cx, cyy, w, h], i) => {
      const x = sx + cx * rx, y = sy + cyy * ry, pts = Array.from({ length: 7 }, (_, k) => { const a = k / 7 * Math.PI * 2 + rand() * 0.3, kk = 0.86 + 0.18 * rand(); return [x + Math.cos(a) * w * rx * kk, y + Math.sin(a) * h * ry * kk] as [number, number]; });
      pen.form(stones, blob(pts, 0.9), toneOf(stoneSet[(i + Math.floor(u[13]! * 4)) % stoneSet.length]!), { size: w * rx, weight: 0.6, grain: true });
    });
    pen.stroke(g, `M${f(sx - rx * 0.97)} ${f(sy + ry * 0.4)}C${f(sx - rx * 0.5)} ${f(sy + ry * 0.72)} ${f(sx + rx * 0.5)} ${f(sy + ry * 0.72)} ${f(sx + rx * 0.97)} ${f(sy + ry * 0.4)}`, pen.lw * 0.6, { opacity: 0.6 });
    // the pool on top, mirroring the sky, with a lily pad (and a bud, or a reed)
    const pw = 12 + 3 * u[11]!, py = sy - ry * 0.84, pool = ellipsePath(sx - 1, py, pw, 4.2);
    pen.form(g, pool, { light: '#F2FAFD', base: mix(ELEMENT.water.light, '#FFFFFF', 0.2), shadow: ELEMENT.water.base }, { weight: 0.55, size: 4 });
    pen.patch(g, `M${f(sx - pw * 0.6)} ${f(py - 1.2)}q${f(pw * 0.35)} -1.4 ${f(pw * 0.7)} -0.5`, 'none', 1, { stroke: '#FFFFFF', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.85 });
    const pad = `M${f(sx + 3)} ${f(py)}l4.6 -1.2a4.8 2 0 1 1 -1.4 -1.1Z`;
    pen.form(g, pad, elTone('earth', 0.05), { weight: 0.45, size: 2, flat: true });
    if (flower) { pen.form(g, ellipsePath(sx + 5, py - 1.6, 1.8, 1.4), toneOf('#F2B8C6'), { weight: 0.4, size: 1, flat: true }); }
    if (reed) { pen.stroke(g, `M${f(sx + rx * 0.45)} ${f(sy - ry * 0.7)}q-1 -10 2 -19`, pen.lw * 0.8, { stroke: ELEMENT.earth.shadow }); pen.form(g, ellipsePath(sx + rx * 0.45 + 2, sy - ry * 0.7 - 20, 1.6, 4.2), toneOf('#8A6A4A'), { weight: 0.45, size: 1.5 }); }
    for (const [x, y] of [[headX - 8, FOOT - 3.5], [headX + 17, FOOT - 3]] as const) pen.form(g, ellipsePath(x, y, 7.5, 5), skin, { weight: 0.75, size: 6, grain: true });
    pen.form(g, blob([[headX - R * 0.4, headY + R * 0.5], [headX + R * 0.6, headY + R * 0.2], [sx - rx * 0.55, sy + ry * 0.1], [sx - rx * 0.5, sy + ry * 0.55], [headX + R * 0.2, headY + R * 1.05]]), skin, { size: R * 0.6 });
    const anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    // a small soft fin-crest on some, like a waterweed leaf
    if (u[5]! > 0.5) ear(pen, head, 1, [R * 0.05, -R * 0.84], 10, `M${f(-R * 0.18)} 0C${f(-R * 0.2)} ${f(-R * 0.28)} ${f(-R * 0.02)} ${f(-R * 0.44)} ${f(R * 0.2)} ${f(-R * 0.4)}C${f(R * 0.1)} ${f(-R * 0.24)} ${f(R * 0.22)} ${f(-R * 0.1)} ${f(R * 0.18)} 0Z`, { light: '#EAF6F8', base: mix(ELEMENT.water.light, skin.base, 0.4), shadow: skin.shadow }, null, R * 0.16);
    pen.form(head, ellipsePath(0, 0, R, R * 0.92), skin, { size: R, grain: true });
    pen.glow(head, 0, R * 0.95, R * 0.55, ELEMENT.water.glow, 0.55);
    for (const [x, y, r] of [[-0.55, -0.45, 0.12], [0.4, -0.6, 0.09], [0.7, -0.2, 0.1]] as const) pen.patch(head, ellipsePath(x * R, y * R, r * R, r * R * 0.8), mix(skin.light, ELEMENT.water.light, 0.4), 0.75);
    drawFace(pen, head, { ...faceFrom(u, R), kind: 'turtle', cheeks: u[2]! > 0.25 || s.delighted, delighted: s.delighted });
    pen.form(head, `M${f(R * 0.06)} ${f(R * 0.1)}c1.6 2 2.1 3.9 0 4.6c-2.1 -0.7 -1.6 -2.6 0 -4.6Z`, { light: '#FFFFFF', base: ELEMENT.water.light, shadow: ELEMENT.water.base }, { weight: 0.4, size: 1.5, flat: true });
  } };
}

/* ------------------------------------------------------------------ water, in the air: the koi kite */
function koi(d: GardenDraw): Species {
  const u = d.u, hover = 22 + 6 * u[11]!, rx = (23 + 3 * u[1]!) * (0.6 + 0.4 * d.head), ry = (20 + 3 * u[0]!) * (0.6 + 0.4 * d.head), cx = CENTER - 6, cy = FOOT - hover - ry - 2, tail = 23 + 8 * u[5]!;
  // bodies from pale pearl to river blue; patches in the deeper water colours, in one of three patterns
  // backs: pearl, river teal, dusk slate or sand; patches always contrast with the back
  const back = pick([['#F2EFE8', '#5E86B8'], ['#8FC4C9', '#2F5E7E'], ['#9AA6C4', '#F4EEE4'], ['#E9DCC3', '#4C7FA6']] as const, u[13]!);
  const body = toneOf(mix(back[0], CREAM, 0.1), '#4B6A86'), patchA = mix(back[1], CREAM, 0.25), patchB = mix(back[1], ELEMENT.water.shadow, 0.3), pattern = Math.floor(u[12]! * 3);
  const finTone: Tone = { light: '#F4FBFE', base: mix(ELEMENT.water.light, '#FFFFFF', 0.4), shadow: ELEMENT.water.light };
  return { geo: { top: cy - ry - 14 - tail * 0.45, left: cx - rx - 6, right: cx + rx + tail + 4, headX: cx - 2, headY: cy, headR: Math.max(rx, ry) * 0.88, hover }, draw(pen, g, s) {
    const rand = stream(d.seed);
    // the tail: two lobes of thin water flowing up and back, rays of light in them; droplets hang behind
    const tg = pen.g(g, { class: 'cr-tail' }), bx = cx + rx * 0.85, by = cy + 1;
    const fin = `M${f(bx)} ${f(by - 6)}C${f(bx + tail * 0.35)} ${f(by - 11)} ${f(bx + tail * 0.72)} ${f(by - tail * 0.7)} ${f(bx + tail)} ${f(by - tail * 0.6)}C${f(bx + tail * 0.84)} ${f(by - tail * 0.32)} ${f(bx + tail * 0.72)} ${f(by - 4)} ${f(bx + tail * 0.9)} ${f(by + tail * 0.2)}C${f(bx + tail * 1.0)} ${f(by + tail * 0.4)} ${f(bx + tail * 0.6)} ${f(by + tail * 0.46)} ${f(bx + tail * 0.42)} ${f(by + tail * 0.24)}C${f(bx + tail * 0.25)} ${f(by + 9)} ${f(bx + 4)} ${f(by + 7)} ${f(bx)} ${f(by + 6)}Z`;
    pen.form(tg, fin, finTone, { weight: 0.5, size: tail * 0.3, attrs: { opacity: 0.9 } });
    for (let k = 0; k < 5; k++) pen.patch(tg, `M${f(bx + 2)} ${f(by)}Q${f(bx + tail * 0.5)} ${f(by - tail * (0.42 - k * 0.18))} ${f(bx + tail * 0.92)} ${f(by - tail * (0.58 - k * 0.24))}`, 'none', 0.65, { stroke: k % 2 ? mix(ELEMENT.water.light, '#FFFFFF', 0.3) : '#FFFFFF', 'stroke-width': 0.8, 'stroke-linecap': 'round' });
    for (const [x, y, r] of [[bx + tail * 1.1, by - tail * 0.2, 1.9], [bx + tail * 0.96, by + tail * 0.52, 1.5], [bx + tail * 0.4, by - tail * 0.85, 1.3]] as const) pen.form(tg, `M${f(x)} ${f(y - r * 1.6)}C${f(x + r)} ${f(y - r * 0.4)} ${f(x + r)} ${f(y + r)} ${f(x)} ${f(y + r)}C${f(x - r)} ${f(y + r)} ${f(x - r)} ${f(y - r * 0.4)} ${f(x)} ${f(y - r * 1.6)}Z`, finTone, { weight: 0.35, size: 1, flat: true });
    // the dorsal ridge, then the body: round at the face, narrowing toward the tail, with a light inside
    pen.form(g, `M${f(cx - rx * 0.25)} ${f(cy - ry * 0.9)}C${f(cx + rx * 0.05)} ${f(cy - ry * 1.5)} ${f(cx + rx * 0.62)} ${f(cy - ry * 1.38)} ${f(cx + rx * 0.9)} ${f(cy - ry * 0.55)}Z`, finTone, { weight: 0.5, size: 6, attrs: { opacity: 0.92 } });
    const bodyD = blob([[cx - rx, cy + 1], [cx - rx * 0.74, cy - ry * 0.8], [cx, cy - ry], [cx + rx * 0.7, cy - ry * 0.68], [cx + rx * 1.02, cy - ry * 0.15], [cx + rx * 1.02, cy + ry * 0.2], [cx + rx * 0.65, cy + ry * 0.72], [cx, cy + ry * 0.98], [cx - rx * 0.76, cy + ry * 0.76]]);
    pen.form(g, bodyD, body, { size: rx, shadowOpacity: 0.36 });
    const inner = pen.g(g, { 'clip-path': pen.clip(bodyD) });
    pen.patch(inner, ellipsePath(cx - 2, cy + ry * 0.62, rx * 0.8, ry * 0.42), '#FFFFFF', 0.55);
    // a few rows of scales over the back
    for (let row = 0; row < 3; row++) for (let k = 0; k < 4 - row; k++) { const x = cx + rx * (-0.05 + 0.24 * k + 0.12 * row), y = cy - ry * (0.62 - row * 0.26); pen.el('path', { d: `M${f(x - 3)} ${f(y)}q3 3.4 6 0`, fill: 'none', stroke: INK, 'stroke-width': 0.6, opacity: 0.28 }, inner); }
    pen.glow(inner, cx + 2, cy + ry * 0.35, rx * 0.72, ELEMENT.water.glow, 0.6);
    const spot = (x: number, y: number, r: number, c: string) => pen.patch(inner, blob(Array.from({ length: 7 }, (_, i) => { const a = i / 7 * Math.PI * 2; return [x + Math.cos(a) * r * (0.82 + 0.3 * rand()), y + Math.sin(a) * r * 0.78 * (0.82 + 0.3 * rand())] as [number, number]; })), c, 0.82);
    if (pattern === 0) { spot(cx + rx * 0.35, cy - ry * 0.55, rx * 0.42, patchA); spot(cx - rx * 0.45, cy - ry * 0.75, rx * 0.26, patchB); }
    else if (pattern === 1) spot(cx - 1, cy - ry * 0.88, rx * 0.24, patchB);
    else for (let k = 0; k < 5; k++) spot(cx + rx * (-0.55 + 1.25 * rand()), cy - ry * (0.15 + 0.65 * rand()), rx * (0.1 + 0.08 * rand()), k % 2 ? patchA : patchB);
    for (const side of [-1, 1]) pen.form(pen.g(g, { transform: `translate(${f(cx + side * rx * 0.55)} ${f(cy + ry * 0.45)})` }), `M0 0c${f(side * 6)} ${f(2)} ${f(side * 12)} ${f(8)} ${f(side * 11)} ${f(14)}c${f(-side * 5)} ${f(-1)} ${f(-side * 10)} ${f(-5)} ${f(-side * 11)} ${f(-14)}Z`, finTone, { weight: 0.45, size: 4, attrs: { opacity: 0.9, class: `cr-wing cr-wing-${side < 0 ? 'l' : 'r'}` } });
    const anchor = pen.g(g, { transform: `translate(${f(cx - 2)} ${f(cy - 1)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    const r = Math.max(rx, ry) * 0.88;
    for (const side of [-1, 1]) pen.stroke(head, `M${f(side * r * 0.2)} ${f(r * 0.48)}q${f(side * 4)} ${f(3)} ${f(side * 3)} ${f(7)}q${f(-side * 1)} ${f(2)} ${f(side * 1.5)} ${f(3)}`, pen.lw * 0.5, { opacity: 0.7 });
    drawFace(pen, head, { ...faceFrom(u, r), kind: 'fish', cheeks: true, delighted: s.delighted });
  } };
}

/* ------------------------------------------------------------------ fire, on the ground: the ember fox */
function fox(d: GardenDraw): Species {
  const u = d.u, bx = CENTER + 8, rx = 26 + 4 * u[1]!, ry = 15 + 3 * u[0]!, by = FOOT - 4 - ry, R = (21 + 4 * u[3]!) * d.head, headX = CENTER - 8, headY = by - 9 - R * 0.45;
  const earL = R * (0.72 + 0.3 * u[5]!), spread = 14 + 10 * u[6]!, lanterns = 1 + Math.floor(u[12]! * 3);
  // coats: ember rust, marigold, ash silver, dusk red; socks on some
  const coatC = pick([[0.66, 0.12, 46], [0.74, 0.12, 70], [0.72, 0.02, 60], [0.56, 0.12, 32]] as const, u[14]!), coat = own(coatC[0] + 0.05 * (u[13]! - 0.5), coatC[1], coatC[2], 0.14);
  const cream = toneOf('#F4E7D2'), socks = u[11]! > 0.5, ash = toneOf(socks ? mix(coat.shadow, '#4A3C3A', 0.55) : '#A9A39C', '#3E4F63');
  const tipX = bx + rx + 10, tipY = by - ry - 20;
  return { geo: { top: Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tipY - 30), left: headX - R - 6, right: tipX + 14, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
    const tail = pen.g(g, { class: 'cr-tail' });
    const brush = blob([[bx + rx * 0.6, by + ry * 0.4], [bx + rx + 6, by + ry * 0.1], [tipX + 6, by - ry * 0.9], [tipX + 2, tipY], [tipX - 8, tipY + 3], [bx + rx * 0.62, by - ry * 0.55], [bx + rx * 0.35, by]], 0.9);
    pen.form(tail, brush, coat, { size: 12, grain: true });
    pen.patch(tail, blob([[tipX - 9, tipY + 4], [tipX + 2, tipY - 1], [tipX + 6, tipY + 7], [tipX - 3, tipY + 9]]), cream.base, 0.95);
    for (let i = 0; i < lanterns; i++) flame(pen, tail, tipX - 5 + (i - (lanterns - 1) / 2) * 9, tipY - 9 - (i % 2) * 6, 6 + (i === 1 ? 1 : 0), `cr-lantern cr-lantern-${i}`);
    pen.form(g, blob([[bx - rx, by + ry * 0.3], [bx - rx * 0.6, by - ry * 0.95], [bx + rx * 0.3, by - ry], [bx + rx, by - ry * 0.1], [bx + rx * 0.85, by + ry * 0.85], [bx - rx * 0.4, by + ry * 0.95]]), coat, { size: rx * 0.7, grain: true });
    pen.form(g, ellipsePath(bx + rx * 0.62, FOOT - 3.4, 7, 4.2), ash, { weight: 0.7, size: 5 });
    for (const x of [headX - 7, headX + 9]) pen.form(g, ellipsePath(x, FOOT - 3.2, 7, 4.4), ash, { weight: 0.75, size: 5 });
    const anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    for (const side of [-1, 1] as const) ear(pen, head, side, [side * R * 0.55, -R * 0.62], spread, pointEar(R * 0.38, earL), coat, mix('#F6E2CF', coat.base, 0.15), R * 0.3);
    const ruff = blob([[-R * 1.18, R * 0.25], [-R * 0.8, -R * 0.1], [0, R * 0.1], [R * 0.8, -R * 0.1], [R * 1.18, R * 0.25], [R * 0.75, R * 0.85], [0, R * 1.0], [-R * 0.75, R * 0.85]]);
    pen.form(head, ellipsePath(0, 0, R, R * 0.94), coat, { size: R, grain: true });
    pen.form(head, ruff, cream, { size: R * 0.7, weight: 0.7 });
    for (const [x, y, a] of [[-1.05, 0.35, -40], [-0.95, 0.55, -20], [1.05, 0.35, 40], [0.95, 0.6, 25]] as const) pen.stroke(head, `M${f(x * R)} ${f(y * R)}l${f(Math.sin(a * Math.PI / 180) * 6)} ${f(-Math.cos(a * Math.PI / 180) * 6)}`, pen.lw * 0.45, { stroke: '#C9A24A' });
    const blaze = Math.floor(u[2]! * 3);
    if (blaze === 0) pen.patch(head, `M0 ${f(-R * .86)}Q${f(R * .2)} ${f(-R * .6)} 0 ${f(-R * .2)}Q${f(-R * .18)} ${f(-R * .56)} 0 ${f(-R * .86)}Z`, cream.base, .94);
    else if (blaze === 1) for (const side of [-1, 1]) pen.patch(head, ellipsePath(side * R * .45, -R * .56, R * .16, R * .1), cream.base, .95);
    else pen.patch(head, `M${f(-R * .26)} ${f(-R * .72)}Q0 ${f(-R * .34)} ${f(R * .26)} ${f(-R * .72)}L0 ${f(-R * .02)}Z`, cream.base, .94);
    drawFace(pen, head, { ...faceFrom(u, R), kind: 'mammal', cheeks: true, delighted: s.delighted });
  } };
}

/* ------------------------------------------------------------------ fire, in the air: the phoenix chick */
function phoenix(d: GardenDraw): Species {
  const u = d.u, hover = 14 + 6 * u[11]!, R = (24 + 4 * u[0]!) * (0.5 + d.head / 2), cy = FOOT - hover - R - 5, crownKind = Math.floor(u[2]! * 3);
  // plumage: ember rust, marigold, ash with embers, autumn red
  const plumeC = pick([[0.64, 0.12, 50], [0.74, 0.12, 74], [0.68, 0.03, 62], [0.58, 0.12, 30]] as const, u[14]!), plume = own(plumeC[0] + 0.05 * (u[13]! - 0.5), plumeC[1], plumeC[2], 0.12);
  const belly = toneOf(mix(ELEMENT.fire.soft, CREAM, 0.3)), leafTones = [toneOf(mix('#C7652F', CREAM, 0.12)), toneOf(mix('#D9A04A', CREAM, 0.12)), toneOf(mix('#B35A3A', CREAM, 0.16))];
  const wingL = R * (0.84 + 0.24 * u[5]!);
  return { geo: { top: Math.min(cy - R - 17, cy - wingL * 0.95), left: CENTER - R - wingL * 0.6, right: CENTER + R + 26, headX: CENTER, headY: cy - R * 0.1, headR: R * 0.9, hover }, draw(pen, g, s) {
    const rand = stream(d.seed), fold = s.asleep ? 0.55 : 1;
    const tail = pen.g(g, { class: 'cr-tail' });
    for (let k = 0; k < 3; k++) {
      const x0 = CENTER + R * 0.55, y0 = cy + R * 0.55, x1 = x0 + 16 + k * 3, y1 = y0 + 6 + k * 6;
      pen.form(tail, `M${f(x0)} ${f(y0 - 2)}Q${f(x1 - 4)} ${f(y1 - 8)} ${f(x1)} ${f(y1)}Q${f(x1 - 9)} ${f(y1 - 2)} ${f(x0)} ${f(y0 + 2)}Z`, leafTones[k]!, { weight: 0.5, size: 4 });
      pen.glow(tail, x1 + 1.5, y1 + 1, 5, ELEMENT.fire.glow, 0.65);
      pen.el('circle', { cx: x1 + 1.5, cy: y1 + 1, r: 1.7, fill: ELEMENT.fire.light, stroke: INK, 'stroke-width': pen.lw * 0.3 }, tail);
    }
    // wings: broad autumn leaves raised from the shoulders, their edges glowing like embers
    for (const side of [-1, 1]) {
      const wg = wingAt(pen, g, `translate(${f(CENTER + side * R * 0.7)} ${f(cy + R * 0.1)}) rotate(${side * (s.asleep ? 80 : 42)})`, side, fold);
      const L = wingL, leaf = `M0 0C${f(L * 0.28)} ${f(-L * 0.4)} ${f(L * 0.62)} ${f(-L * 0.8)} ${f(L * 0.38)} ${f(-L * 1.05)}C${f(L * 0.3)} ${f(-L * 0.9)} ${f(L * 0.12)} ${f(-L * 0.95)} ${f(L * 0.02)} ${f(-L * 0.82)}C${f(-L * 0.12)} ${f(-L * 0.85)} ${f(-L * 0.35)} ${f(-L * 0.7)} ${f(-L * 0.25)} ${f(-L * 0.5)}C${f(-L * 0.42)} ${f(-L * 0.42)} ${f(-L * 0.4)} ${f(-L * 0.18)} ${f(-L * 0.18)} ${f(-L * 0.05)}Z`;
      pen.el('path', { d: leaf, fill: 'none', stroke: ELEMENT.fire.light, 'stroke-width': 4.5, opacity: 0.6 }, wg);
      pen.form(wg, leaf, leafTones[(1 + (side > 0 ? 1 : 0) + Math.floor(u[13]! * 2)) % 3]!, { size: L * 0.4, weight: 0.75, grain: true });
      pen.stroke(wg, `M${f(L * 0.02)} ${f(-L * 0.05)}L${f(L * 0.22)} ${f(-L * 0.85)}`, pen.lw * 0.45, { opacity: 0.55 });
      for (let k = 0; k < 3; k++) pen.stroke(wg, `M${f(L * (0.07 + k * 0.05))} ${f(-L * (0.25 + k * 0.2))}l${f(L * 0.2)} ${f(-L * 0.08)}M${f(L * (0.07 + k * 0.05))} ${f(-L * (0.25 + k * 0.2))}l${f(-L * 0.18)} ${f(-L * 0.12)}`, pen.lw * 0.32, { opacity: 0.45 });
    }
    const bodyD = blob([[CENTER, cy - R], [CENTER + R * 0.85, cy - R * 0.5], [CENTER + R * 1.02, cy + R * 0.25], [CENTER + R * 0.6, cy + R * 0.92], [CENTER, cy + R * 1.02], [CENTER - R * 0.6, cy + R * 0.92], [CENTER - R * 1.02, cy + R * 0.25], [CENTER - R * 0.85, cy - R * 0.5]]);
    pen.form(g, bodyD, plume, { size: R, grain: true });
    const skirt = pen.g(g, { 'clip-path': pen.clip(bodyD) });
    for (let k = 0; k < 8; k++) { const a = Math.PI * (0.1 + 0.8 * k / 7), x = CENTER + Math.cos(a) * R * 0.95, y = cy + Math.sin(a) * R * 0.85; pen.form(skirt, ellipsePath(x, y, 8.5, 5.5), leafTones[(k + Math.floor(rand() * 3)) % 3]!, { weight: 0.45, size: 4, attrs: { transform: `rotate(${f((a * 180 / Math.PI) - 90)} ${f(x)} ${f(y)})` } }); }
    pen.patch(g, ellipsePath(CENTER, cy + R * 0.32, R * 0.55, R * 0.5), belly.base, 0.92);
    pen.glow(g, CENTER, cy + R * 0.25, R * 0.48, ELEMENT.fire.glow, 0.5);
    for (const side of [-1, 1]) pen.stroke(g, `M${f(CENTER + side * 6)} ${f(cy + R * 0.98)}l0 4.5m0 0l-2 2m2 -2l2 2`, pen.lw * 0.55, { stroke: '#7E7369' });
    // the crown: three smouldering seed pods, a single flame, or a tuft of leaves
    const crown = pen.g(g);
    if (crownKind === 0) for (const dx of [-0.32, 0, 0.32]) { const x = CENTER + dx * R, y = cy - R * (dx === 0 ? 1.18 : 1.05); pen.stroke(crown, `M${f(CENTER + dx * R * 0.6)} ${f(cy - R * 0.88)}L${f(x)} ${f(y + 2)}`, pen.lw * 0.6, { stroke: '#6B4A35' }); pen.glow(crown, x, y, 5, ELEMENT.fire.glow, 0.55); pen.form(crown, ellipsePath(x, y, 3.2, 4), toneOf('#8E5A3A'), { weight: 0.5, size: 2.5 }); pen.patch(crown, ellipsePath(x, y + 1.6, 1.6, 1), ELEMENT.fire.light, 0.95); }
    else if (crownKind === 1) flame(pen, crown, CENTER + 1, cy - R * 0.9, 7);
    else for (const a of [-28, 0, 26]) oakLeaf(pen, crown, CENTER + a * 0.12, cy - R * 0.9, 10, a, leafTones[a === 0 ? 0 : 1]!);
    const anchor = pen.g(g, { transform: `translate(${CENTER} ${f(cy - R * 0.1)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    drawFace(pen, head, { ...faceFrom(u, R * 0.9), kind: 'bird', cheeks: true, delighted: s.delighted, beakTone: toneOf('#E8A65A') });
  } };
}

/* ------------------------------------------------------------------ air, gliding: the flying lemur */
function lemur(d: GardenDraw): Species {
  const u = d.u, hover = 17 + 6 * u[11]!, by = FOOT - hover - 20, R = (20 + 4 * u[3]!) * d.head, headY = by - 16 - R * 0.55, reach = 32 + 8 * u[1]!, fernEars = u[5]! > 0.45;
  // fur: dove grey, oat, slate; membranes thin as sycamore seed wings, tinted by the sky
  const furC = pick([[0.78, 0.02, 290], [0.84, 0.03, 75], [0.7, 0.025, 250]] as const, u[14]!), fur = own(furC[0] + 0.05 * (u[13]! - 0.5), furC[1], furC[2], 0.16), belly = toneOf(mix(CREAM, '#FFFFFF', 0.3));
  const tint = pick([ELEMENT.air.soft, '#EDF3F7', '#F5EFE3'], u[12]!);
  const membrane: Tone = { light: mix(tint, '#FFFFFF', 0.5), base: mix(tint, ELEMENT.air.light, 0.18), shadow: mix(ELEMENT.air.light, '#8C92B0', 0.4) };
  return { geo: { top: headY - R - (fernEars ? R * 0.95 : R * 0.6), left: CENTER - reach - 5, right: CENTER + Math.max(reach, 44) + 6, headX: CENTER, headY, headR: R, hover }, draw(pen, g, s) {
    const fold = s.asleep ? 0.55 : 1;
    // the tail: long and ringed, curling out to the side, thinning into a wisp of cloud
    const tail = pen.g(g, { class: 'cr-tail' }), pts: [number, number][] = [[CENTER + 6, by + 14], [CENTER + 20, by + 22], [CENTER + 36, by + 16], [CENTER + 40, by + 2]];
    pen.stroke(tail, curve(pts), 7, { stroke: INK, filter: null });
    pen.stroke(tail, curve(pts), 5.2, { stroke: fur.base, filter: null });
    pen.stroke(tail, curve(pts), 5.2, { stroke: fur.shadow, filter: null, 'stroke-dasharray': '3.4 4', 'stroke-linecap': 'butt' });
    wisp(pen, tail, CENTER + 38, by + 1, 9, { light: '#FFFFFF', base: '#F7F4FA', shadow: membrane.shadow });
    for (const side of [-1, 1]) {
      const wg = wingAt(pen, g, `translate(${CENTER} ${f(by)})`, side, fold);
      const wing = `M6 -16C${f(reach * 0.45)} -23 ${f(reach * 0.85)} -25 ${f(reach)} -19C${f(reach * 1.05)} -7 ${f(reach * 0.92)} 2 ${f(reach * 0.78)} 6C${f(reach * 0.62)} 12 ${f(reach * 0.4)} 10 ${f(reach * 0.28)} 17C${f(reach * 0.2)} 18 10 15 6 10Z`;
      pen.form(wg, wing, membrane, { size: 14, weight: 0.6, shadowOpacity: 0.35, attrs: { opacity: 0.9 } });
      for (let k = 0; k < 4; k++) pen.stroke(wg, `M8 ${f(-8 + k * 3)}Q${f(reach * 0.45)} ${f(-14 + k * 6)} ${f(reach * (0.95 - k * 0.12))} ${f(-14 + k * 6.5)}`, pen.lw * 0.3, { opacity: 0.3 });
      for (let k = 0; k < 6; k++) { const t = k / 5, x = reach * (0.99 - t * 0.62), y = -17 + t * 31; pen.el('circle', { cx: f(x), cy: f(y), r: 1.35, fill: '#FFFFFF', stroke: INK, 'stroke-width': 0.35, opacity: 0.9 }, wg); }
      pen.stroke(wg, `M8 -15Q${f(reach * 0.5)} -22 ${f(reach)} -19`, pen.lw * 0.9, { stroke: fur.shadow });
      pen.form(wg, ellipsePath(reach, -19, 2.6, 2.2), fur, { weight: 0.45, size: 2 });
    }
    pen.form(g, ellipsePath(CENTER, by, 15, 18), fur, { size: 15, grain: true });
    pen.patch(g, ellipsePath(CENTER, by + 3, 9, 12), belly.base, 0.9);
    for (const side of [-1, 1]) pen.form(g, ellipsePath(CENTER + side * 7, by + 18, 3.6, 2.8), fur, { weight: 0.5, size: 2.5 });
    const anchor = pen.g(g, { transform: `translate(${CENTER} ${f(headY)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    if (fernEars) for (const side of [-1, 1] as const) {
      // ears like unfurling fern fronds: a tall leafy ear that curls over at its tip
      const shape = `M${f(-R * 0.22)} 0C${f(-R * 0.32)} ${f(-R * 0.45)} ${f(-R * 0.15)} ${f(-R * 0.85)} ${f(R * 0.12)} ${f(-R * 0.95)}C${f(R * 0.4)} ${f(-R * 1.0)} ${f(R * 0.42)} ${f(-R * 0.72)} ${f(R * 0.2)} ${f(-R * 0.7)}C${f(R * 0.08)} ${f(-R * 0.68)} ${f(R * 0.1)} ${f(-R * 0.8)} ${f(R * 0.18)} ${f(-R * 0.8)}C${f(R * 0.12)} ${f(-R * 0.6)} ${f(R * 0.28)} ${f(-R * 0.3)} ${f(R * 0.22)} 0Z`;
      const e = ear(pen, head, side, [side * R * 0.62, -R * 0.6], 58, shape, toneOf(mix(fur.base, ELEMENT.earth.light, 0.35)), mix(ELEMENT.earth.soft, fur.base, 0.3), R * 0.25);
      for (let k = 1; k <= 3; k++) pen.stroke(side < 0 ? pen.g(e, { transform: 'scale(-1 1)' }) : e, `M${f(R * 0.02)} ${f(-R * k * 0.2)}l${f(R * 0.14)} ${f(-R * 0.05)}`, pen.lw * 0.4, { opacity: 0.55 });
    } else for (const side of [-1, 1] as const) ear(pen, head, side, [side * R * 0.7, -R * 0.45], 48, roundEar(R * 0.42, R * 0.6), fur, mix(ELEMENT.air.light, fur.base, 0.3), R * 0.3);
    pen.form(head, ellipsePath(0, 0, R, R * 0.95), fur, { size: R, grain: true });
    pen.patch(head, ellipsePath(0, R * 0.32, R * 0.62, R * 0.45), belly.base, 0.88);
    for (const side of [-1, 1]) pen.glow(head, side * R * (0.4 + 0.12 * u[8]!), R * (-0.04 + 0.12 * (0.5 - u[9]!)), R * 0.5, ELEMENT.air.glow, 0.6);
    drawFace(pen, head, { ...faceFrom(u, R), kind: 'mammal', cheeks: u[2]! > 0.4 || s.delighted, delighted: s.delighted, noseTone: '#7A6470' });
  } };
}

/* ------------------------------------------------------------------ air, floating: the cloud lamb */
function lamb(d: GardenDraw): Species {
  const u = d.u, hover = 14 + 6 * u[11]!, rx = 29 + 4 * u[1]!, ry = 19 + 3 * u[0]!, cy = FOOT - hover - ry - 4, R = (15 + 3 * u[3]!) * d.head;
  // wool: cloud white, dawn rose, storm lilac or morning blue; faces cream or dusk brown
  const woolC = pick(['#F6F2F7', '#F7EAEA', '#ECE6F4', '#E8EFF6'], u[14]!), wool: Tone = { light: '#FFFFFF', base: mix(woolC, ELEMENT.air.soft, 0.2), shadow: mix(ELEMENT.air.light, '#9AA4C2', 0.45) };
  const face = toneOf(u[13]! > 0.72 ? mix('#8C7468', CREAM, 0.2) : mix('#F3D9C6', CREAM, 0.35));
  // the cumulus: puffs round an ellipse; its outline is the union's outer edge, sampled around the centre
  const rand = stream(d.seed), puffs: [number, number, number][] = [[0, 0, 1]];
  const count = 7 + Math.floor(u[12]! * 3);
  for (let k = 0; k < count; k++) { const a = Math.PI * (1.05 + 0.9 * k / (count - 1)) + (rand() - 0.5) * 0.25; puffs.push([Math.cos(a) * rx * 0.72, Math.sin(a) * ry * 0.7, 0.36 + 0.14 * rand()]); }
  puffs.push([-rx * 0.62, ry * 0.35, 0.36], [rx * 0.6, ry * 0.32, 0.38]);
  const reach = (a: number) => Math.max(...puffs.map(([px, py, k]) => { const pr = k === 1 ? 0 : k * rx, dx = Math.cos(a), dy = Math.sin(a); if (k === 1) return 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2); const b = px * dx + py * dy, c = px * px + py * py - pr * pr, disc = b * b - c; return disc < 0 ? 0 : b + Math.sqrt(disc); }));
  const outline: [number, number][] = Array.from({ length: 64 }, (_, i) => { const a = i / 64 * Math.PI * 2, r = reach(a); return [CENTER + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const topY = Math.min(...outline.map(p => p[1]));
  return { geo: { top: topY - 3, left: Math.min(...outline.map(p => p[0])) - 3, right: Math.max(...outline.map(p => p[0])) + 10, headX: CENTER - 2, headY: cy + 3, headR: R * 1.1, hover }, draw(pen, g, s) {
    for (const x of [-rx * 0.5, -rx * 0.18, rx * 0.18, rx * 0.5]) { pen.stroke(g, `M${f(CENTER + x)} ${f(cy + ry * 0.75)}l0 6`, 2.6, { stroke: mix(wool.shadow, INK, 0.2) }); pen.form(g, ellipsePath(CENTER + x, cy + ry * 0.75 + 7, 2.6, 2.1), toneOf('#5E5260'), { weight: 0.4, size: 2 }); }
    const cloud = blob(outline, 1);
    pen.form(g, cloud, wool, { size: rx * 0.55, shadowOpacity: 0.55 });
    const inner = pen.g(g, { 'clip-path': pen.clip(cloud) });
    for (const [px, py, k] of puffs.slice(1, -2)) pen.el('path', { d: `M${f(CENTER + px - k * rx * 0.7)} ${f(cy + py + k * rx * 0.4)}a${f(k * rx * 0.75)} ${f(k * rx * 0.75)} 0 0 1 ${f(k * rx * 1.3)} ${f(-k * rx * 0.2)}`, fill: 'none', stroke: wool.shadow, 'stroke-width': 0.9, opacity: 0.45 }, inner);
    for (let k = 0; k < 3; k++) { const x = CENTER + rx * (-0.6 + 1.2 * rand()), y = cy - ry * (0.2 + 0.4 * rand()); pen.stroke(g, `M${f(x - 2)} ${f(y)}l4 0M${f(x)} ${f(y - 2)}l0 4M${f(x - 1.4)} ${f(y - 1.4)}l2.8 2.8`, 0.6, { opacity: 0.55, stroke: mix(ELEMENT.air.base, INK, 0.3) }); }
    const tail = pen.g(g, { class: 'cr-tail' });
    wisp(pen, tail, CENTER + rx * 0.98, cy - ry * 0.1, 8, wool); wisp(pen, tail, CENTER + rx * 0.9, cy + ry * 0.38, 6, wool);
    // the face, peeking out of the wool, with soft floppy ears
    const anchor = pen.g(g, { transform: `translate(${f(CENTER - 2)} ${f(cy + 3)})` }), head = pen.g(anchor, { class: 'portrait__head' });
    if (u[2]! > .62) for (const side of [-1, 1]) {
      const horn = pen.g(head, { transform: `translate(${f(side * R * .74)} ${f(-R * .62)}) scale(${side} 1)` });
      pen.stroke(horn, 'M0 0q-8 -7 -4 -11q7 -3 9 3q1 5 -4 5', 4.3, { stroke: INK });
      pen.stroke(horn, 'M0 0q-8 -7 -4 -11q7 -3 9 3q1 5 -4 5', 2.8, { stroke: '#D9C5AD' });
    }
    for (const side of [-1, 1] as const) ear(pen, head, side, [side * R * 0.82, -R * 0.42], 105, `M${f(-R * 0.22)} 0C${f(-R * 0.3)} ${f(-R * 0.4)} ${f(-R * 0.12)} ${f(-R * 0.75)} 0 ${f(-R * 0.78)}C${f(R * 0.14)} ${f(-R * 0.75)} ${f(R * 0.3)} ${f(-R * 0.4)} ${f(R * 0.22)} 0Z`, face, mix(ELEMENT.air.light, face.base, 0.4), R * 0.2);
    pen.form(head, ellipsePath(0, 0, R * 0.9, R * 1.0), face, { size: R * 0.9 });
    pen.patch(head, blob([[-R * 0.75, -R * 0.55], [-R * 0.3, -R * 1.02], [R * 0.3, -R * 1.05], [R * 0.75, -R * 0.55], [R * 0.4, -R * 0.62], [0, -R * 0.5], [-R * 0.4, -R * 0.62]]), wool.base, 0.95);
    drawFace(pen, head, { ...faceFrom(u, R * 1.05), spread: 0.36 + 0.1 * u[8]!, kind: 'lamb', cheeks: true, delighted: s.delighted, noseTone: '#8A6D72' });
  } };
}

const BUILDERS: Record<GardenSpecies, (d: GardenDraw) => Species> = { squirrel, moth, turtle, koi, fox, phoenix, lemur, lamb };

/** The fitted geometry: scale down to the 120 × 150 box if the drawing would leave it (as version 2 does). */
export function gardenLayout(d: GardenDraw, fed = 0) {
  const sp = BUILDERS[d.species](d), geo = sp.geo, grow = 1 + 0.2 * fed;
  const fit = Math.min(1, (FOOT - 6) / ((FOOT - geo.top) * grow), 56 / ((CENTER - geo.left) * grow), 57 / ((geo.right - CENTER) * grow));
  const scale = fit * grow, Y = (y: number) => (FOOT - (FOOT - y) * scale) / BOX_H, X = (x: number) => (CENTER + (x - CENTER) * scale) / 120;
  return { sp, fit, grow, extent: { top: Y(geo.top), left: X(geo.left), right: X(geo.right), headY: Y(geo.headY), headRadius: geo.headR * scale / 120, headX: X(geo.headX), hover: geo.hover * scale / BOX_H } };
}

export function paintGarden(document: Document, p: CritterV2, state: { size?: number | 'stage'; asleep?: boolean; delighted?: boolean; fed?: number; name?: string; decorative?: boolean; finish?: 'ink' | 'painted'; holding?: boolean } = {}) {
  const d = gardenDraw(p, state.finish), fed = state.fed ?? 0, { sp, fit, grow, extent } = gardenLayout(d, fed);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 120 ${BOX_H}`);
  svg.setAttribute('class', `portrait portrait-v2 critter garden garden-refined finish-${d.finish} species-${d.species} element-${d.element}${FLIERS.has(d.species) ? ' flier' : ''}`);
  svg.dataset.direction = 'garden-refined'; svg.dataset.species = d.species; svg.dataset.element = d.element; svg.dataset.asleep = String(!!state.asleep);
  // as the other painters: the app's .portrait[data-size] rules hold a 40, 64 or 96 px portrait at its size
  svg.dataset.size = String(state.size ?? 'stage');
  for (const [k, v] of Object.entries(extent)) svg.dataset[k === 'headY' ? 'hy' : k === 'headRadius' ? 'hr' : k] = v.toFixed(3);
  svg.style.setProperty('--d', `${(p.idlePhase * 5).toFixed(2)}s`);
  svg.style.setProperty('--cheeks', state.delighted ? '1' : '0');
  svg.style.setProperty('--mouth', state.delighted ? '1' : '0');
  if (typeof state.size === 'number') { svg.setAttribute('width', String(state.size)); svg.setAttribute('height', String(state.size * 1.25)); }
  if (state.decorative !== false) svg.setAttribute('aria-hidden', 'true');
  const painted = d.finish === 'painted', pen = new Pen(document, svg, (painted ? 1.8 : 2.1) / Math.max(0.75, fit));
  const hover = sp.geo.hover;
  svg.style.setProperty('--garden-lift', `${state.asleep ? hover * .55 : 0}px`);
  // the contact shadow stays on the floor; a flier's is smaller and fainter the higher it hovers
  const shadowW = (sp.geo.right - sp.geo.left) * 0.3 * fit * (hover ? 0.75 : 1);
  if (painted) pen.el('ellipse', { cx: CENTER, cy: FOOT + 1.5, rx: f(shadowW), ry: f(hover ? 3.4 : 4.6), fill: pen.radial([[0, mix(ELEMENT[d.element].shadow, INK, .45), hover ? .2 : .27], [1, INK, 0]], .5, .5, .5), class: 'portrait__shadow cr-shadow' }, svg);
  else pen.el('ellipse', { cx: CENTER, cy: FOOT + 1.5, rx: f(shadowW), ry: f(hover ? 3.2 : 4.4), fill: INK, opacity: hover ? 0.1 : 0.16, class: 'portrait__shadow cr-shadow' }, svg);
  const fitG = pen.g(svg, { transform: fit < 1 ? `translate(${CENTER} ${FOOT}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-FOOT})` : null });
  const hoverG = pen.g(fitG, { class: 'cr-hover', transform: hover !== sp.geo.hover ? `translate(0 ${f(sp.geo.hover - hover)})` : null });
  const figure = pen.g(hoverG, { class: 'portrait__figure' });
  const body = pen.g(figure, { transform: fed ? `translate(${CENTER} ${FOOT}) scale(${grow.toFixed(3)}) translate(${-CENTER} ${-FOOT})` : null });
  sp.draw(pen, body, { asleep: false, delighted: !!state.delighted, fed });
  // A review alternative, not the default response: paws can meet a crumb at the chest.
  if (state.holding && ['squirrel', 'fox', 'lemur'].includes(d.species)) {
    const x = sp.geo.headX, y = Math.min(FOOT - 11, sp.geo.headY + sp.geo.headR * 1.5);
    const hands = pen.g(body, { class: 'garden-held-crumb' });
    pen.form(hands, `M${f(x - 5)} ${f(y - 3)}l6 -2l5 4l-2 6l-7 1l-4 -4Z`, toneOf('#D9A441'), { size: 5, weight: .7 });
    for (const side of [-1, 1]) pen.form(hands, ellipsePath(x + side * 6, y + 3, 3.8, 4.2), toneOf(CREAM), { size: 3, weight: .5 });
  }
  if (!state.decorative && state.name) { const title = document.createElementNS('http://www.w3.org/2000/svg', 'title'); title.textContent = state.name; svg.prepend(title); svg.setAttribute('role', 'img'); svg.removeAttribute('aria-hidden'); }
  const head = [...svg.querySelectorAll<SVGGElement>('.portrait__head')], eyes = [...svg.querySelectorAll<SVGGElement>('.portrait__eye')], cheeks = [...svg.querySelectorAll<SVGEllipseElement>('.portrait__cheek')];
  const mouths = [...svg.querySelectorAll<SVGPathElement>('.portrait__mouth')], calm = [...svg.querySelectorAll<SVGElement>('.p-calm')];
  const ears = [...svg.querySelectorAll<SVGGElement>('.portrait__ear')].map(node => ({ node, base: parseFloat(node.style.getPropertyValue('--ear-base')) || 0, side: node.classList.contains('portrait__ear--l') ? 1 : -1 }));
  const pupils = [...svg.querySelectorAll<SVGGElement>('.portrait__pupil')];
  const eyeRadius = sp.geo.headR * (.265 + .065 * d.u[7]!);
  const shadow = svg.querySelector<SVGEllipseElement>('.portrait__shadow')!;
  rememberPortrait(svg, { headRadius: sp.geo.headR, eyeRadius: sp.geo.headR * (.265 + .065 * d.u[7]!), applyRig: ({ rig, now, asleep, quiet }) => {
    const lift = asleep ? hover * .55 : quiet || !hover ? 0 : Math.sin(now / 2600 * Math.PI * 2 + p.idlePhase * Math.PI * 2) * 2.5;
    hoverG.style.transform = `translateY(${lift.toFixed(2)}px)`;
    figure.style.transform = `translateY(${-rig.liftY * UNIT}px) rotate(${rig.leanZ}deg) scale(${rig.scaleX},${rig.scaleY})`;
    shadow.style.transform = `scaleX(${rig.scaleX})`;
    for (const node of head) node.style.transform = `rotate(${rig.headTilt}deg)`;
    for (const node of eyes) node.style.scale = `1 ${rig.lids}`;
    for (const { node, base, side } of ears) node.style.transform = `rotate(${base + (side > 0 ? rig.earL : -rig.earR)}deg)`;
    for (const node of pupils) node.style.transform = `translate(${rig.pupilX * eyeRadius}px,${rig.pupilY * eyeRadius}px)`;
    for (const node of cheeks) node.style.scale = String(rig.cheeks);
    for (const node of mouths) node.style.opacity = String(rig.mouth);
    for (const node of calm) node.style.opacity = String(1 - rig.mouth);
  } });
  return svg;
}
