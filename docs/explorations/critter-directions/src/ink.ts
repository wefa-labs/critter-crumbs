/**
 * The drawing kit both exploration directions share: Inked daylight's line and light, made from SVG elements only
 * (no markup strings). One light from the upper left, so every form gets a warm light, its base and a cool shadow;
 * the plum ink line is heavier on the shadow side, wobbles a little, and is drawn twice like a sketch left in.
 * Coordinates are the portrait's: a 120 × 150 box, feet on y = 140, centred on x = 60.
 */
export const FOOT = 140, CENTER = 60, BOX_W = 120, BOX_H = 150;
export const INK = '#2E2226', EYE = '#2C2129', EYE_SHADE = '#5B4350', PAGE = '#F6F0E4', CHEEK = '#F5A95D', CREAM = '#F3E6D6', WARM_LIGHT = '#FBF0DC';
export const ELEMENT = {
  earth: { shadow: '#156152', base: '#289946', light: '#ACE676', soft: '#DEF5DA', glow: '#E9C46A' },
  water: { shadow: '#263580', base: '#2564B8', light: '#84D3F0', soft: '#E1EDFC', glow: '#9FE1DC' },
  fire: { shadow: '#852318', base: '#EB521D', light: '#F5A95D', soft: '#FCE7DE', glow: '#F28C38' },
  air: { shadow: '#52366B', base: '#B26ACC', light: '#E9BBF0', soft: '#F1E3FA', glow: '#BFE3F5' },
} as const;
export type Element = keyof typeof ELEMENT;
export type Tone = { light: string; base: string; shadow: string; line?: string };
type Attrs = Record<string, string | number | null | undefined>;

let serial = 0;
export const uid = (prefix: string) => `${prefix}${(++serial).toString(36)}`;

/** Mix two #rrggbb colours. */
export function mix(a: string, b: string, t: number) {
  const p = (x: string) => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i]! - v) * t).toString(16).padStart(2, '0')).join('');
}
/** OKLCH to #rrggbb, chroma reduced until it fits sRGB (as portraits/colour.ts). */
export function oklch(l: number, c: number, h: number) {
  const lin = (cc: number) => {
    const a = cc * Math.cos(h * Math.PI / 180), b = cc * Math.sin(h * Math.PI / 180);
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b, m_ = l - 0.1055613458 * a - 0.0638541728 * b, s_ = l - 0.0894841775 * a - 1.291485548 * b;
    const L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
    return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
  };
  let lo = 0, hi = c, rgb = lin(c);
  const ok = (v: number[]) => v.every(x => x >= -1e-6 && x <= 1 + 1e-6);
  if (!ok(rgb)) { for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (ok(lin(m))) lo = m; else hi = m; } rgb = lin(lo); }
  return '#' + rgb.map(v => Math.round(255 * Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))).toString(16).padStart(2, '0')).join('');
}
/** A form's three values from one colour: lights shift warm, shadows shift cool (Appendix A). */
export function toneOf(colour: string, coolShadow = '#3E4F63', warmLight = WARM_LIGHT): Tone {
  return { light: mix(colour, warmLight, 0.42), base: colour, shadow: mix(mix(colour, coolShadow, 0.38), INK, 0.12) };
}

/** A small builder bound to one document and one SVG's <defs>. */
export class Pen {
  readonly defs: SVGDefsElement;
  /** 'ink' is the garden spirits' first finish; 'painted' is the companions' (softer shadow, no hatching, a warm rim). */
  finish: 'ink' | 'painted' = 'ink';
  constructor(readonly doc: Document, readonly svg: SVGSVGElement, readonly lw: number) {
    this.defs = this.el('defs', {}, svg);
  }
  el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: SVGElement): SVGElementTagNameMap[K] {
    const node = this.doc.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) node.setAttribute(k, String(v));
    parent?.append(node);
    return node;
  }
  g(parent: SVGElement, attrs: Attrs = {}) { return this.el('g', attrs, parent); }
  private filters = new Map<string, string>();
  /** Shared filters for this drawing, made once: the loose hand line, soft cel edges, dry-brush grain. */
  filter(kind: 'loose' | 'loose2' | 'soft' | 'grain' | 'wash') {
    const have = this.filters.get(kind); if (have) return `url(#${have})`;
    const id = uid(`f${kind}`), f = this.el('filter', { id, x: '-20%', y: '-20%', width: '140%', height: '140%' }, this.defs);
    if (kind === 'loose' || kind === 'loose2') {
      this.el('feTurbulence', { type: 'fractalNoise', baseFrequency: kind === 'loose' ? 0.045 : 0.06, numOctaves: 2, seed: kind === 'loose' ? 7 : 23, result: 'n' }, f);
      this.el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: kind === 'loose' ? 1.8 : 2.8, xChannelSelector: 'R', yChannelSelector: 'G' }, f);
    } else if (kind === 'soft') {
      this.el('feGaussianBlur', { stdDeviation: 0.9 }, f);
    } else if (kind === 'wash') {
      this.el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.09 0.35', numOctaves: 2, seed: 4, result: 'n' }, f);
      this.el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 4, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }, f);
      this.el('feGaussianBlur', { in: 'd', stdDeviation: 0.8 }, f);
    } else {
      this.el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.85, numOctaves: 2, seed: 3, result: 'n' }, f);
      this.el('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 .16  0 0 0 0 .12  0 0 0 0 .15  0 0 0 .2 0', result: 'g' }, f);
      this.el('feComposite', { in: 'g', in2: 'SourceGraphic', operator: 'in', result: 'gi' }, f);
      this.el('feBlend', { in: 'SourceGraphic', in2: 'gi', mode: 'multiply' }, f);
    }
    this.filters.set(kind, id);
    return `url(#${id})`;
  }
  clip(d: string) { const id = uid('c'); this.el('path', { d }, this.el('clipPath', { id }, this.defs)); return `url(#${id})`; }
  radial(stops: [number, string, number?][], cx = 0.34, cy = 0.28, r = 0.95) {
    const id = uid('r'), grad = this.el('radialGradient', { id, cx, cy, r }, this.defs);
    for (const [o, c, a] of stops) this.el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, grad);
    return `url(#${id})`;
  }
  linear(stops: [number, string, number?][], x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    const id = uid('l'), grad = this.el('linearGradient', { id, x1, y1, x2, y2 }, this.defs);
    for (const [o, c, a] of stops) this.el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, grad);
    return `url(#${id})`;
  }

  /**
   * A painted form. The ink shape sits behind, nudged toward the shadow side, so the line reads heavier there. The fill
   * runs from a warm light at the upper left to the base. The cool shadow is the lens where the form overlaps a copy of
   * itself shifted down and right by `shade` × `size` (the form's radius), glazed on and softened at its edge, with a
   * little hatching inside it when asked. A thin sketch line and a fainter offset one go on top.
   */
  form(parent: SVGElement, d: string, tone: Tone, o: { weight?: number; grain?: boolean; shade?: [number, number]; hatch?: boolean; size?: number; attrs?: Attrs; flat?: boolean; noLine?: boolean; shadowOpacity?: number } = {}) {
    const w = (o.weight ?? 1) * this.lw, g = this.g(parent, o.attrs ?? {}), loose = this.filter('loose');
    if (!o.noLine) this.el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 1.3, 'stroke-linejoin': 'round', transform: `translate(${(w * 0.34).toFixed(2)} ${(w * 0.44).toFixed(2)})`, filter: loose }, g);
    this.el('path', { d, fill: o.flat ? tone.base : this.radial([[0, tone.light], [0.55, tone.base], [1, tone.base]], 0.3, 0.24, 0.85) }, g);
    if (!o.flat) {
      const painted = this.finish === 'painted';
      const s = o.size ?? 20, [dx, dy] = o.shade ?? (painted ? [0.42, 0.52] : [0.52, 0.6]), inner = this.g(g, { 'clip-path': this.clip(d) });
      const lens = this.g(inner, { 'clip-path': this.clip(d), transform: `translate(${(s * dx).toFixed(2)} ${(s * dy).toFixed(2)})` });
      // the lens: the copy, clipped to the form (the outer clip) and to itself (the inner one, which moved with it)
      this.el('path', { d, fill: tone.shadow, opacity: o.shadowOpacity ?? (painted ? 0.38 : 0.5), filter: this.filter('soft'), transform: `translate(${(-s * dx * 0.08).toFixed(2)} ${(-s * dy * 0.08).toFixed(2)})` }, lens);
      if (o.hatch && !painted) this.el('path', { d, fill: `url(#${this.hatchId()})`, opacity: 0.55 }, lens);
      if (painted && s > 4) this.el('path', { d, fill: 'none', stroke: mix(tone.light, '#FFE7C2', 0.4), 'stroke-width': Math.max(1.2, s * 0.11), opacity: 0.5, transform: `translate(${(-s * 0.05).toFixed(2)} ${(-s * 0.06).toFixed(2)})`, filter: this.filter('soft') }, inner);
      if (o.grain) this.el('path', { d, fill: tone.base, opacity: 0.5, filter: this.filter('grain'), style: 'mix-blend-mode:multiply' }, inner);
    }
    if (!o.noLine) {
      this.el('path', { d, fill: 'none', stroke: INK, 'stroke-width': w * 0.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.9, filter: loose }, g);
      this.el('path', { d, fill: 'none', stroke: INK, 'stroke-width': w * 0.32, opacity: 0.26, transform: 'translate(1.1 .7)', filter: this.filter('loose2') }, g);
    }
    return g;
  }
  private hatch?: string;
  hatchId() {
    if (this.hatch) return this.hatch;
    const id = uid('h'), pat = this.el('pattern', { id, width: 3.6, height: 3.6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-38)' }, this.defs);
    this.el('path', { d: 'M0 0 L0 3.6', stroke: INK, 'stroke-width': 0.8, opacity: 0.55 }, pat);
    return (this.hatch = id);
  }
  /** A flat accent painted inside a form (markings, patches), no line of its own. */
  patch(parent: SVGElement, d: string, fill: string, opacity = 1, attrs: Attrs = {}) { return this.el('path', { d, fill, opacity, ...attrs }, parent); }
  /** A loose ink stroke (whiskers, veins, a mouth). */
  stroke(parent: SVGElement, d: string, width: number, attrs: Attrs = {}) { return this.el('path', { d, fill: 'none', stroke: INK, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: this.filter('loose'), ...attrs }, parent); }
  /** One soft glow point (the creature research's "light from within"). */
  glow(parent: SVGElement, x: number, y: number, r: number, colour: string, strength = 0.75) {
    return this.el('circle', { cx: x, cy: y, r, fill: this.radial([[0, colour, strength], [1, colour, 0]], 0.5, 0.5, 0.5) }, parent);
  }
}

/** Path helpers. */
export const ellipsePath = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
export const f = (n: number) => +n.toFixed(2);
/** A closed smooth path through points (Catmull-Rom converted to cubic Béziers). */
export function blob(points: [number, number][], tension = 1) {
  const n = points.length, p = (i: number) => points[(i + n) % n]!;
  let d = `M${f(p(0)[0])} ${f(p(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
    d += `C${f(p1[0] + (p2[0] - p0[0]) * t)} ${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)} ${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
/** An open smooth path through points. */
export function curve(points: [number, number][], tension = 1) {
  const n = points.length, p = (i: number) => points[Math.max(0, Math.min(n - 1, i))]!;
  let d = `M${f(p(0)[0])} ${f(p(0)[1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
    d += `C${f(p1[0] + (p2[0] - p0[0]) * t)} ${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)} ${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
/** Points around an ellipse with a little seeded wobble, for organic blobs. */
export function ring(cx: number, cy: number, rx: number, ry: number, count: number, wobble = 0, phase = 0, rand: () => number = () => 0.5) {
  return Array.from({ length: count }, (_, i) => {
    const a = phase + i / count * Math.PI * 2, k = 1 + wobble * (rand() - 0.5) * 2;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as [number, number];
  });
}
/** A deterministic stream of numbers from a seed (mulberry32), for drawing detail that must be the same every time. */
export function stream(seed: number) {
  let s = seed | 0;
  return () => { s = (s + 0x6d2b79f5) | 0; let v = Math.imul(s ^ (s >>> 15), 1 | s); v ^= v + Math.imul(v ^ (v >>> 7), 61 | v); return ((v ^ (v >>> 14)) >>> 0) / 4294967296; };
}
