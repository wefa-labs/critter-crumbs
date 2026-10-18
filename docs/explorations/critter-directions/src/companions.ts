/**
 * Direction 3, Painted companions: a small family of three authored bodies (a sitter, a floater and a lounger), close
 * to the project's four element paintings (docs/pitch/assets/{earth,water,fire,air}.webp): round bodies, the head and
 * body one soft shape, element ears, crest and tail, painted spots, a glow in the belly and, once fed, a crumb held to
 * it. The surface is softer than the garden spirits': a finer line, a gentler shadow and a warm rim of bounced light.
 * Exploration only: parameters come from the version 2 draw for the same address and variant (its element is kept).
 */
import type { CritterV2 } from '../../../../packages/core/src/generator/versioned.ts';
import { drawFace } from './face.ts';
import { uniforms } from './garden.ts';
import { BOX_H, CENTER, CREAM, ELEMENT, FOOT, INK, Pen, blob, ellipsePath, f, mix, oklch, stream, toneOf, type Element, type Tone } from './ink.ts';

export type CompanionPlan = 'sitter' | 'floater' | 'lounger';
export const PLAN_NAMES: Record<CompanionPlan, string> = { sitter: 'Sitter', floater: 'Floater', lounger: 'Lounger' };
const pick = <T,>(list: readonly T[], x: number) => list[Math.min(list.length - 1, Math.floor(x * list.length))]!;

export function companionDraw(p: CritterV2) {
  const u = uniforms(p), element = p.element as Element;
  // fire and earth rest on the ground more often, water and air float more often: as in the paintings
  const floatShare = { earth: 0.25, fire: 0.3, water: 0.55, air: 0.6 }[element];
  const plan: CompanionPlan = u[15]! < floatShare ? 'floater' : u[15]! < floatShare + (1 - floatShare) * 0.45 ? 'lounger' : 'sitter';
  return { element, plan, u, seed: Math.floor(u[15]! * 1e9) ^ Math.floor(u[3]! * 1e6) };
}
export type CompanionDraw = ReturnType<typeof companionDraw>;

/** Body colours by element, from the paintings: cream and gold for earth, teal for water, ochre and rust for fire, white and sky for air. */
const COATS: Record<Element, readonly (readonly [number, number, number])[]> = {
  earth: [[0.9, 0.03, 90], [0.82, 0.05, 120], [0.86, 0.06, 95]],
  water: [[0.6, 0.08, 195], [0.68, 0.07, 185], [0.62, 0.06, 220]],
  fire: [[0.7, 0.12, 62], [0.64, 0.12, 45], [0.74, 0.1, 75]],
  air: [[0.94, 0.02, 85], [0.89, 0.035, 230], [0.9, 0.03, 300]],
};
/** A painted form: as Pen.form but softer, with a warm rim of light bounced from the floor along the shadow side. */
function paint(pen: Pen, parent: SVGElement, d: string, tone: Tone, o: { size?: number; weight?: number; rim?: boolean; grain?: boolean; attrs?: Record<string, string | number | null> } = {}) {
  const g = pen.form(parent, d, tone, { size: o.size ?? 20, weight: o.weight ?? 0.8, shade: [0.42, 0.52], shadowOpacity: 0.36, grain: o.grain ?? false, attrs: o.attrs ?? {} });
  if (o.rim !== false) {
    const inner = pen.g(g, { 'clip-path': pen.clip(d) }), s = o.size ?? 20;
    pen.el('path', { d, fill: 'none', stroke: mix(tone.light, '#FFE7C2', 0.4), 'stroke-width': Math.max(1.4, s * 0.12), opacity: 0.55, transform: `translate(${f(-s * 0.05)} ${f(-s * 0.06)})`, filter: pen.filter('soft') }, inner);
  }
  return g;
}
/** The app's crumb glyph, held: an irregular honey lump with a crust edge and a fleck of light (Design System §3.8). */
function crumb(pen: Pen, parent: SVGElement, x: number, y: number, s: number) {
  const g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)}) scale(${f(s / 14)})`, class: 'cr-crumb' });
  pen.el('path', { d: 'M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z', fill: '#CFA552', stroke: INK, 'stroke-width': 1.4, 'stroke-linejoin': 'round', filter: pen.filter('loose') }, g);
  pen.el('ellipse', { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: '#F2DD8E', transform: 'rotate(-25 -2 -2.5)' }, g);
  return g;
}

interface Geo { top: number; left: number; right: number; headX: number; headY: number; headR: number; hover: number }
interface Plan { geo: Geo; draw: (pen: Pen, g: SVGGElement, s: { asleep: boolean; delighted: boolean; fed: number }) => void }

/** The element's parts: ears, crest, tail, markings. Each is drawn in the head's or body's own frame. */
function elementParts(d: CompanionDraw, coat: Tone) {
  const u = d.u, E = ELEMENT[d.element], variant = u[5]! < 0.5 ? 0 : 1;
  const part: Tone = { light: mix(E.light, CREAM, 0.35), base: mix(E.base, E.light, 0.45), shadow: E.shadow };
  const soft: Tone = { light: '#FFFFFF', base: mix(E.soft, '#FFFFFF', 0.2), shadow: mix(E.light, E.base, 0.3) };
  const earPath = (R: number) => {
    const w = R * 0.42, L = R * (0.85 + 0.3 * u[6]!);
    if (d.element === 'earth') return variant ? `M0 0C${f(-w * 1.5)} ${f(-L * 0.3)} ${f(-w * 0.9)} ${f(-L * 0.85)} ${f(w * 0.2)} ${f(-L)}C${f(w * 0.9)} ${f(-L * 0.7)} ${f(w * 1.3)} ${f(-L * 0.3)} 0 0Z`
      : `M${f(-w * 0.7)} 0C${f(-w * 1.25)} ${f(-L * 0.45)} ${f(-w * 0.55)} ${f(-L * 0.95)} ${f(w * 0.05)} ${f(-L)}C${f(w * 0.75)} ${f(-L * 0.9)} ${f(w * 1.15)} ${f(-L * 0.45)} ${f(w * 0.7)} 0Z`;
    if (d.element === 'water') return `M${f(-w * 0.85)} 0C${f(-w * 0.75)} ${f(-L * 0.55)} ${f(w * 0.1)} ${f(-L * 0.95)} ${f(w * 0.8)} ${f(-L)}C${f(w * 0.55)} ${f(-L * 0.62)} ${f(w * 0.95)} ${f(-L * 0.28)} ${f(w * 0.85)} 0Z`;
    if (d.element === 'fire') return `M${f(-w * 0.8)} 0C${f(-w * 1.0)} ${f(-L * 0.5)} ${f(-w * 0.4)} ${f(-L * 0.8)} ${f(-w * 0.05)} ${f(-L * 0.92)}C${f(w * 0.3)} ${f(-L * 0.8)} ${f(w * 0.95)} ${f(-L * 0.5)} ${f(w * 0.8)} 0Z`;
    return '';
  };
  return {
    part, soft,
    ears(pen: Pen, head: SVGGElement, R: number) {
      if (d.element === 'air') {
        // cotton-cloud ears: clusters of puffs
        for (const side of [-1, 1]) {
          const at = pen.g(head, { transform: `translate(${f(side * R * 0.68)} ${f(-R * 0.62)})` }), rot = pen.g(at, { class: `portrait__ear portrait__ear--${side < 0 ? 'l' : 'r'}`, style: `--ear-base:${side * (variant ? 30 : 12)}deg` });
          const puffs: [number, number, number][] = variant ? [[0, -R * 0.2, R * 0.28], [side * R * 0.12, -R * 0.48, R * 0.24], [-side * R * 0.1, -R * 0.42, R * 0.2]] : [[0, -R * 0.22, R * 0.26], [0, -R * 0.5, R * 0.2]];
          for (const [x, y, r] of puffs) paint(pen, rot, ellipsePath(x, y, r, r * 0.92), soft, { size: r, weight: 0.6 });
        }
        return;
      }
      for (const side of [-1, 1]) {
        const at = pen.g(head, { transform: `translate(${f(side * R * 0.6)} ${f(-R * 0.62)})` }), rot = pen.g(at, { class: `portrait__ear portrait__ear--${side < 0 ? 'l' : 'r'}`, style: `--ear-base:${f(side * (18 + 22 * u[6]!))}deg` }), m = side < 0 ? pen.g(rot, { transform: 'scale(-1 1)' }) : rot;
        const dd = earPath(R);
        paint(pen, m, dd, d.element === 'fire' ? coat : part, { size: R * 0.3, weight: 0.7 });
        if (d.element === 'earth') pen.stroke(m, `M0 ${f(-R * 0.08)}L${f(R * 0.08)} ${f(-R * 0.75)}`, pen.lw * 0.4, { opacity: 0.5, stroke: E.shadow });
        if (d.element === 'water') for (let k = 0; k < 3; k++) pen.stroke(m, `M${f(-R * 0.15 + k * R * 0.14)} ${f(-R * 0.05)}Q${f(R * 0.05 + k * R * 0.12)} ${f(-R * 0.5)} ${f(R * 0.3)} ${f(-R * 0.85)}`, pen.lw * 0.3, { opacity: 0.35, stroke: E.shadow });
        if (d.element === 'fire') {
          pen.patch(m, dd, mix('#FBE3CC', coat.base, 0.2), 0.8, { transform: 'translate(0 -1) scale(.55 .7)' });
          const fx = -R * 0.05, fy = -R * (0.85 + 0.3 * u[6]!) * 0.92;
          pen.glow(m, fx, fy - R * 0.12, R * 0.28, E.glow, 0.6);
          pen.form(m, `M${f(fx)} ${f(fy - R * 0.42)}C${f(fx + R * 0.1)} ${f(fy - R * 0.22)} ${f(fx + R * 0.24)} ${f(fy - R * 0.12)} ${f(fx + R * 0.16)} ${f(fy + R * 0.04)}C${f(fx + R * 0.08)} ${f(fy + R * 0.12)} ${f(fx - R * 0.14)} ${f(fy + R * 0.1)} ${f(fx - R * 0.16)} ${f(fy)}C${f(fx - R * 0.2)} ${f(fy - R * 0.16)} ${f(fx - R * 0.05)} ${f(fy - R * 0.24)} ${f(fx)} ${f(fy - R * 0.42)}Z`, { light: '#FFF1CF', base: E.light, shadow: E.base }, { weight: 0.45, size: R * 0.15, shade: [0.3, 0.25] });
        }
      }
    },
    crest(pen: Pen, head: SVGGElement, R: number) {
      if (u[2]! < 0.35) return;
      const top = -R * 0.98, g = pen.g(head);
      if (d.element === 'earth') { pen.stroke(g, `M0 ${f(top + 2)}q1 -5 -0.5 -9`, pen.lw * 0.9, { stroke: E.shadow }); for (const side of [-1, 1]) paint(pen, g, `M0 ${f(top - 7)}c${f(side * 4)} -6 ${f(side * 10)} -6 ${f(side * 11)} -3c${f(-side * 3)} 4 ${f(-side * 8)} 5 ${f(-side * 11)} 3Z`, part, { size: 4, weight: 0.55 }); }
      else if (d.element === 'water') paint(pen, g, `M0 ${f(top - 9)}C3 ${f(top - 4)} 3.4 ${f(top + 1)} 0 ${f(top + 1.5)}C-3.4 ${f(top + 1)} -3 ${f(top - 4)} 0 ${f(top - 9)}Z`, soft, { size: 3, weight: 0.55 });
      else if (d.element === 'fire') { pen.glow(g, 0, top - 3, 7, E.glow, 0.6); pen.form(g, `M0 ${f(top - 11)}C2.4 ${f(top - 6)} 4.4 ${f(top - 3)} 3.4 ${f(top + 1)}C2 ${f(top + 3)} -2 ${f(top + 3)} -3.4 ${f(top + 1)}C-4.2 ${f(top - 3)} -1.4 ${f(top - 6)} 0 ${f(top - 11)}Z`, { light: '#FFF1CF', base: E.light, shadow: E.base }, { weight: 0.55, size: 3 }); }
      else for (const [x, y, r] of [[0, top - 4, 4.4], [4, top - 1, 3.4], [-4, top - 1, 3]] as const) paint(pen, g, ellipsePath(x, y, r, r * 0.9), soft, { size: r, weight: 0.5 });
    },
    tail(pen: Pen, body: SVGGElement, x: number, y: number, s: number) {
      const g = pen.g(body, { class: 'cr-tail', transform: `translate(${f(x)} ${f(y)})` });
      if (d.element === 'earth') { pen.stroke(g, `M0 0q${f(s * 0.5)} ${f(s * 0.1)} ${f(s * 0.7)} ${f(-s * 0.6)}`, pen.lw * 0.9, { stroke: E.shadow }); paint(pen, g, `M${f(s * 0.7)} ${f(-s * 0.6)}c${f(s * 0.1)} ${f(-s * 0.45)} ${f(s * 0.45)} ${f(-s * 0.6)} ${f(s * 0.75)} ${f(-s * 0.55)}c${f(-s * 0.05)} ${f(s * 0.35)} ${f(-s * 0.35)} ${f(s * 0.6)} ${f(-s * 0.75)} ${f(s * 0.55)}Z`, part, { size: s * 0.3, weight: 0.6 }); }
      else if (d.element === 'water') paint(pen, g, `M0 -2C${f(s * 0.4)} ${f(-s * 0.1)} ${f(s * 0.8)} ${f(-s * 0.6)} ${f(s * 0.95)} ${f(-s * 0.55)}C${f(s * 0.85)} ${f(-s * 0.2)} ${f(s * 0.95)} ${f(s * 0.15)} ${f(s * 0.85)} ${f(s * 0.3)}C${f(s * 0.6)} ${f(s * 0.2)} ${f(s * 0.3)} ${f(s * 0.1)} 0 3Z`, soft, { size: s * 0.3, weight: 0.55 });
      else if (d.element === 'fire') { pen.stroke(g, `M0 0q${f(s * 0.55)} ${f(s * 0.15)} ${f(s * 0.6)} ${f(-s * 0.55)}`, 3.6, { stroke: INK, filter: null }); pen.stroke(g, `M0 0q${f(s * 0.55)} ${f(s * 0.15)} ${f(s * 0.6)} ${f(-s * 0.55)}`, 2.2, { stroke: coat.base, filter: null }); pen.glow(g, s * 0.62, -s * 0.72, s * 0.4, E.glow, 0.6); pen.form(g, `M${f(s * 0.6)} ${f(-s * 1.05)}c${f(s * 0.12)} ${f(s * 0.2)} ${f(s * 0.28)} ${f(s * 0.32)} ${f(s * 0.18)} ${f(s * 0.48)}c${f(-s * 0.1)} ${f(s * 0.1)} ${f(-s * 0.32)} ${f(s * 0.08)} ${f(-s * 0.36)} ${f(-s * 0.06)}c${f(-s * 0.04)} ${f(-s * 0.18)} ${f(s * 0.12)} ${f(-s * 0.26)} ${f(s * 0.18)} ${f(-s * 0.42)}Z`, { light: '#FFF1CF', base: E.light, shadow: E.base }, { weight: 0.5, size: s * 0.15 }); }
      else paint(pen, g, `M0 0c${f(s * 0.35)} ${f(-s * 0.45)} ${f(s * 1.05)} ${f(-s * 0.4)} ${f(s * 1.15)} ${f(-s * 0.05)}c${f(-s * 0.35)} ${f(-s * 0.1)} ${f(-s * 0.7)} ${f(s * 0.05)} ${f(-s * 0.85)} ${f(s * 0.28)}c${f(-s * 0.1)} ${f(s * 0.1)} ${f(-s * 0.26)} ${f(s * 0.02)} ${f(-s * 0.3)} ${f(-s * 0.23)}Z`, soft, { size: s * 0.35, weight: 0.5, rim: false });
    },
    marks(pen: Pen, parent: SVGGElement, cx: number, cy: number, rx: number, ry: number) {
      const rand = stream(d.seed), spots = u[13]! > 0.35, n = 3 + Math.floor(u[12]! * 4), col = mix(E.light, CREAM, d.element === 'air' ? 0.1 : 0.3);
      if (spots) for (let k = 0; k < n; k++) { const a = Math.PI * (0.9 + 1.2 * rand()), r = 0.55 + 0.35 * rand(), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r * 0.9, sz = 1.6 + 2.2 * rand(); pen.patch(parent, ellipsePath(x, y, sz, sz * 0.85), col, 0.85); }
      else for (const side of [-1, 1]) pen.patch(parent, `M${f(cx + side * rx * 0.95)} ${f(cy - ry * 0.25)}q${f(-side * rx * 0.3)} ${f(ry * 0.08)} ${f(-side * rx * 0.36)} ${f(ry * 0.3)}`, 'none', 0.8, { stroke: col, 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    },
  };
}

function coatOf(d: CompanionDraw) {
  const c = pick(COATS[d.element], d.u[14]!);
  return toneOf(mix(oklch(c[0] + 0.04 * (d.u[13]! - 0.5), c[1], c[2]), CREAM, 0.12), d.element === 'water' ? '#2C4660' : '#4A4A62');
}

/** One soft outline for a big round head over a chubby body, joined at a gentle waist (the paintings' build). */
function bunOutline(headY: number, R: number, cy: number, W: number, H: number, taper = 0) {
  const waistY = headY + R * 0.78, waistW = Math.min(R, W) * 0.9;
  return blob([[CENTER, headY - R], [CENTER + R * 0.72, headY - R * 0.72], [CENTER + R * 1.0, headY - R * 0.05], [CENTER + waistW, waistY], [CENTER + W * 1.05, cy + H * 0.25], [CENTER + W * (0.9 - taper * 0.5), cy + H * 0.78], [CENTER + W * 0.35 * (1 - taper), cy + H * (1.0 + taper * 0.15)], [CENTER - W * 0.35 * (1 - taper), cy + H * (1.0 + taper * 0.15)], [CENTER - W * (0.9 - taper * 0.5), cy + H * 0.78], [CENTER - W * 1.05, cy + H * 0.25], [CENTER - waistW, waistY], [CENTER - R * 1.0, headY - R * 0.05], [CENTER - R * 0.72, headY - R * 0.72]], 0.95);
}

/** The sitter: the paintings' body. A big round head over a chubby body, feet forward, paws at the chest. */
function sitter(d: CompanionDraw): Plan {
  const u = d.u, W = 25 + 6 * u[1]!, H = 22 + 5 * u[0]!, cy = FOOT - 5 - H, R = 25 + 4 * u[3]!, headY = cy - H * 0.35 - R * 0.62, coat = coatOf(d), parts = elementParts(d, coat);
  return { geo: { top: headY - R * 1.95, left: CENTER - W - 6, right: CENTER + W + 20, headX: CENTER, headY, headR: R, hover: 0 }, draw(pen, g, s) {
    parts.tail(pen, g, CENTER + W * 0.85, cy + H * 0.55, 20);
    const shape = bunOutline(headY, R, cy, W, H);
    // ears behind the head, face and crest in front of it: two groups the app tilts together
    const back = pen.g(pen.g(g, { transform: `translate(${CENTER} ${f(headY)})` }), { class: 'portrait__head' });
    parts.ears(pen, back, R);
    paint(pen, g, shape, coat, { size: W * 1.1, grain: true });
    const inner = pen.g(g, { 'clip-path': pen.clip(shape) });
    pen.patch(inner, ellipsePath(CENTER, cy + H * 0.45, W * 0.62, H * 0.55), mix(coat.light, '#FFF8EC', 0.5), 0.75, { filter: pen.filter('soft') });
    parts.marks(pen, inner, CENTER, headY + R * 0.2, R * 0.95, R * 0.9);
    pen.glow(g, CENTER, cy + H * 0.25, W * 0.55, ELEMENT[d.element].glow, s.fed || s.delighted ? 0.75 : 0.4);
    if (s.fed || s.delighted) crumb(pen, g, CENTER, cy + H * 0.18, 13);
    for (const side of [-1, 1]) paint(pen, g, ellipsePath(CENTER + side * (s.fed || s.delighted ? 6 : W * 0.5), cy + H * (s.fed || s.delighted ? 0.24 : 0.2), 5.6, 6.6), coat, { size: 5, weight: 0.65, attrs: { transform: `rotate(${side * -24} ${f(CENTER + side * W * 0.5)} ${f(cy + H * 0.2)})` } });
    for (const side of [-1, 1]) paint(pen, g, ellipsePath(CENTER + side * W * 0.5, FOOT - 4, 9, 5.2), toneOf(mix(coat.base, coat.shadow, 0.2)), { size: 6, weight: 0.7 });
    const headG = pen.g(pen.g(g, { transform: `translate(${CENTER} ${f(headY)})` }), { class: 'portrait__head' });
    parts.crest(pen, headG, R);
    drawFace(pen, headG, { r: R, eye: 0.3 + 0.07 * u[7]!, spread: 0.42 + 0.12 * u[8]!, eyeY: -0.02 + 0.12 * (0.5 - u[9]!), kind: 'mammal', cheeks: true, delighted: s.delighted, noseTone: mix(coat.shadow, INK, 0.4) });
  } };
}
/** The floater: a softer pear with no feet, hovering over its painted shadow; a tail of its element below. */
function floater(d: CompanionDraw): Plan {
  const u = d.u, hover = 22 + 7 * u[11]!, W = 22 + 5 * u[1]!, H = 20 + 4 * u[0]!, R = 25 + 4 * u[3]!, cy = FOOT - hover - H, headY = cy - H * 0.3 - R * 0.62, coat = coatOf(d), parts = elementParts(d, coat);
  return { geo: { top: headY - R * 1.95, left: CENTER - W - 6, right: CENTER + W + 24, headX: CENTER, headY, headR: R, hover }, draw(pen, g, s) {
    parts.tail(pen, g, CENTER + 3, cy + H * 1.05, 22);
    const shape = bunOutline(headY, R, cy, W, H, 0.55);
    // ears behind the head, face and crest in front of it: two groups the app tilts together
    const back = pen.g(pen.g(g, { transform: `translate(${CENTER} ${f(headY)})` }), { class: 'portrait__head' });
    parts.ears(pen, back, R);
    paint(pen, g, shape, coat, { size: W * 1.1, grain: true });
    const inner = pen.g(g, { 'clip-path': pen.clip(shape) });
    pen.patch(inner, ellipsePath(CENTER, cy + H * 0.45, W * 0.6, H * 0.55), mix(coat.light, '#FFF8EC', 0.5), 0.7, { filter: pen.filter('soft') });
    parts.marks(pen, inner, CENTER, headY + R * 0.2, R * 0.95, R * 0.9);
    pen.glow(g, CENTER, cy + H * 0.3, W * 0.55, ELEMENT[d.element].glow, s.fed || s.delighted ? 0.75 : 0.4);
    if (s.fed || s.delighted) crumb(pen, g, CENTER, cy + H * 0.22, 12);
    for (const side of [-1, 1]) paint(pen, g, ellipsePath(CENTER + side * (s.fed || s.delighted ? 6 : W * 0.6), cy + H * 0.28, 5, 6), coat, { size: 5, weight: 0.6, attrs: { transform: `rotate(${side * -28} ${f(CENTER + side * W * 0.6)} ${f(cy + H * 0.28)})` } });
    const headG = pen.g(pen.g(g, { transform: `translate(${CENTER} ${f(headY)})` }), { class: 'portrait__head' });
    parts.crest(pen, headG, R);
    drawFace(pen, headG, { r: R, eye: 0.3 + 0.07 * u[7]!, spread: 0.42 + 0.12 * u[8]!, eyeY: -0.02 + 0.12 * (0.5 - u[9]!), kind: 'mammal', cheeks: true, delighted: s.delighted, noseTone: mix(coat.shadow, INK, 0.4) });
  } };
}
/** The lounger: lying low and wide, chin up, front paws out, the tail curled round behind. */
function lounger(d: CompanionDraw): Plan {
  const u = d.u, rx = 27 + 4 * u[1]!, ry = 16 + 3 * u[0]!, bx = CENTER + 7, by = FOOT - 3 - ry, R = 24 + 4 * u[3]!, headX = CENTER - 7, headY = by - 9 - R * 0.6, coat = coatOf(d), parts = elementParts(d, coat);
  return { geo: { top: headY - R * 1.95, left: Math.min(headX - R - 6, bx - rx - 4), right: bx + rx + 16, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
    parts.tail(pen, g, bx + rx * 0.85, by + 2, 20);
    const bodyD = blob([[bx - rx, by + ry * 0.35], [bx - rx * 0.55, by - ry * 0.95], [bx + rx * 0.35, by - ry], [bx + rx, by - ry * 0.05], [bx + rx * 0.82, by + ry * 0.9], [bx - rx * 0.4, by + ry * 0.98]], 0.95);
    paint(pen, g, bodyD, coat, { size: rx * 0.65, grain: true });
    const inner = pen.g(g, { 'clip-path': pen.clip(bodyD) });
    parts.marks(pen, inner, bx + rx * 0.2, by - 2, rx * 0.8, ry * 1.2);
    pen.glow(g, headX + 4, by + 2, rx * 0.45, ELEMENT[d.element].glow, s.fed || s.delighted ? 0.75 : 0.35);
    paint(pen, g, ellipsePath(bx + rx * 0.62, FOOT - 3.6, 8, 4.6), toneOf(mix(coat.base, coat.shadow, 0.2)), { size: 5, weight: 0.65 });
    const anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), headG = pen.g(anchor, { class: 'portrait__head' });
    parts.ears(pen, headG, R);
    paint(pen, headG, ellipsePath(0, 0, R, R * 0.95), coat, { size: R, grain: true });
    const hin = pen.g(headG, { 'clip-path': pen.clip(ellipsePath(0, 0, R, R * 0.95)) });
    parts.marks(pen, hin, 0, R * 0.2, R * 0.95, R * 0.9);
    pen.patch(hin, ellipsePath(0, R * 0.55, R * 0.6, R * 0.32), mix(coat.light, '#FFF8EC', 0.5), 0.6, { filter: pen.filter('soft') });
    parts.crest(pen, headG, R);
    drawFace(pen, headG, { r: R, eye: 0.3 + 0.07 * u[7]!, spread: 0.42 + 0.12 * u[8]!, eyeY: -0.02 + 0.12 * (0.5 - u[9]!), kind: 'mammal', cheeks: true, delighted: s.delighted, noseTone: mix(coat.shadow, INK, 0.4) });
    if (s.fed || s.delighted) crumb(pen, g, headX + 1, FOOT - 9, 12);
    for (const x of [headX - 9, headX + 10]) paint(pen, g, ellipsePath(x, FOOT - 3.6, 7.5, 4.6), toneOf(mix(coat.base, coat.shadow, 0.15)), { size: 5, weight: 0.7 });
  } };
}
const PLANS: Record<CompanionPlan, (d: CompanionDraw) => Plan> = { sitter, floater, lounger };

export function companionLayout(d: CompanionDraw, fed = 0) {
  const pl = PLANS[d.plan](d), geo = pl.geo, grow = 1 + 0.2 * fed;
  const fit = Math.min(1, (FOOT - 6) / ((FOOT - geo.top) * grow), 56 / ((CENTER - geo.left) * grow), 57 / ((geo.right - CENTER) * grow));
  const scale = fit * grow, Y = (y: number) => (FOOT - (FOOT - y) * scale) / BOX_H, X = (x: number) => (CENTER + (x - CENTER) * scale) / 120;
  return { pl, fit, grow, extent: { top: Y(geo.top), left: X(geo.left), right: X(geo.right), headY: Y(geo.headY), headRadius: geo.headR * scale / 120, headX: X(geo.headX) } };
}

export function paintCompanion(document: Document, p: CritterV2, state: { size?: number | 'stage'; asleep?: boolean; delighted?: boolean; fed?: number; name?: string; decorative?: boolean } = {}) {
  const d = companionDraw(p), fed = state.fed ?? 0, { pl, fit, grow, extent } = companionLayout(d, fed);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 120 ${BOX_H}`);
  svg.setAttribute('class', `portrait portrait-v2 critter companion plan-${d.plan} element-${d.element}${d.plan === 'floater' ? ' flier' : ''}`);
  svg.dataset.direction = 'companions'; svg.dataset.plan = d.plan; svg.dataset.element = d.element; svg.dataset.asleep = String(!!state.asleep);
  for (const [k, v] of Object.entries(extent)) svg.dataset[k === 'headY' ? 'hy' : k === 'headRadius' ? 'hr' : k] = v.toFixed(3);
  svg.style.setProperty('--d', `${(p.idlePhase * 5).toFixed(2)}s`);
  svg.style.setProperty('--cheeks', '1');
  svg.style.setProperty('--mouth', state.delighted ? '1' : '0');
  if (typeof state.size === 'number') { svg.setAttribute('width', String(state.size)); svg.setAttribute('height', String(state.size * 1.25)); }
  if (state.decorative !== false) svg.setAttribute('aria-hidden', 'true');
  const pen = new Pen(document, svg, 1.75 / Math.max(0.75, fit));
  const hover = pl.geo.hover * (state.asleep ? 0.35 : 1), E = ELEMENT[d.element];
  // the paintings' shadow: a short, brushy wash tinted by the element, smaller and fainter under a floater
  const w = (pl.geo.right - pl.geo.left) * 0.32 * fit * (hover ? 0.8 : 1);
  pen.el('ellipse', { cx: CENTER, cy: FOOT + 1.5, rx: f(w), ry: f(hover ? 3.4 : 4.6), fill: mix(E.shadow, INK, 0.45), opacity: hover ? 0.2 : 0.24, filter: pen.filter('wash'), class: 'portrait__shadow cr-shadow' }, svg);
  const fitG = pen.g(svg, { transform: fit < 1 ? `translate(${CENTER} ${FOOT}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-FOOT})` : null });
  const hoverG = pen.g(fitG, { class: 'cr-hover', transform: hover !== pl.geo.hover ? `translate(0 ${f(pl.geo.hover - hover)})` : null });
  const figure = pen.g(hoverG, { class: 'portrait__figure' });
  const body = pen.g(figure, { transform: fed ? `translate(${CENTER} ${FOOT}) scale(${grow.toFixed(3)}) translate(${-CENTER} ${-FOOT})` : null });
  pl.draw(pen, body, { asleep: !!state.asleep, delighted: !!state.delighted, fed });
  if (!state.decorative && state.name) { const title = document.createElementNS('http://www.w3.org/2000/svg', 'title'); title.textContent = state.name; svg.prepend(title); svg.setAttribute('role', 'img'); svg.removeAttribute('aria-hidden'); }
  return svg;
}
