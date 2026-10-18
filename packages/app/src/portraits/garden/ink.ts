/**
 * The refined Garden Spirits drawing kit: warm light and plum ink, made from SVG elements only
 * (no markup strings). One light from the upper left, so every form gets a warm light, its base and a cool shadow;
 * the plum ink line is heavier on the shadow side, wobbles a little, without live turbulence, displacement or blur filters.
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
// The prototype and refinement share one comparison document, so their paint servers must never share IDs.
export const uid = (prefix: string) => `garden-review-${prefix}${(++serial).toString(36)}`;

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

  /** Warm radial pigment, quiet paper marks and a tapered plum edge; no live SVG filters. */
  form(parent: SVGElement, d: string, tone: Tone, o: { weight?: number; grain?: boolean; size?: number; attrs?: Attrs; flat?: boolean; noLine?: boolean; shadowOpacity?: number } = {}) {
    const w = (o.weight ?? 1) * this.lw, g = this.g(parent, o.attrs ?? {});
    const shade = mix(tone.base, tone.shadow, o.shadowOpacity ?? 0.44);
    if (!o.noLine) this.el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 1.12, 'stroke-linejoin': 'round', transform: `translate(${f(w * .2)} ${f(w * .3)})` }, g);
    this.el('path', { d, fill: o.flat ? tone.base : this.radial([[0, tone.light], [.46, tone.base], [1, shade]], .28, .22, 1.05) }, g);
    if (o.grain && !o.flat && (o.size ?? 20) > 9) this.el('path', { d, fill: this.paper(), opacity: .1 }, g);
    if (!o.noLine) this.el('path', { d, fill: 'none', stroke: tone.line ?? INK, 'stroke-width': w * .65, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: .93 }, g);
    return g;
  }
  private paperId?: string;
  private paper() {
    if (!this.paperId) {
      this.paperId = uid('paper');
      const pattern = this.el('pattern', { id: this.paperId, width: 11, height: 13, patternUnits: 'userSpaceOnUse' }, this.defs);
      this.el('path', { d: 'M1 3l1.1-.3M7 10l.8.2M9 4l.6-.2', stroke: INK, 'stroke-width': .55, 'stroke-linecap': 'round' }, pattern);
    }
    return `url(#${this.paperId})`;
  }
  /** A flat accent painted inside a form (markings, patches), no line of its own. */
  patch(parent: SVGElement, d: string, fill: string, opacity = 1, attrs: Attrs = {}) { return this.el('path', { d, fill, opacity, ...attrs }, parent); }
  /** A loose ink stroke (whiskers, veins, a mouth). */
  stroke(parent: SVGElement, d: string, width: number, attrs: Attrs = {}) { return this.el('path', { d, fill: 'none', stroke: INK, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs }, parent); }
  /** One soft glow point (the creature research's "light from within"). Light, not body: silhouettes leave it out. */
  glow(parent: SVGElement, x: number, y: number, r: number, colour: string, strength = 0.75) {
    return this.el('circle', { cx: x, cy: y, r, fill: this.radial([[0, colour, strength], [1, colour, 0]], 0.5, 0.5, 0.5), class: 'cr-glow' }, parent);
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
