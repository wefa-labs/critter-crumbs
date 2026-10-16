import { CHEEK, EYE, EYE_SHADE, INK, PAGE, Pen, type Tone, ellipsePath, f } from './ink.js';

/**
 * The face every exploration critter shares, so all of them read as one family at 40 px: big round dark matte eyes
 * with one small highlight (decided 2026-10-05), a calm mouth that opens into a smile when delighted, peach cheeks.
 * Drawn around (0, 0) inside a head group; the eye groups carry the app's portrait classes so its pose code can blink
 * them (`.portrait__eye` scales by --lids) and close them for sleep (`data-asleep`).
 */
export interface FaceOptions {
  r: number; // head radius, sets every proportion
  eye: number; // eye radius as a share of r (0.26 to 0.38)
  spread: number; // eye centre distance from the middle, share of r
  eyeY: number; // eye height, share of r (negative is up)
  kind: 'mammal' | 'bird' | 'fish' | 'turtle' | 'lamb';
  character?: 'round' | 'keen' | 'dreamy';
  cheeks: boolean;
  delighted?: boolean;
  noseTone?: string;
  beakTone?: Tone;
  turn?: number; // a small turn of the face toward the viewer's right, share of r
}
export function drawFace(pen: Pen, head: SVGGElement, o: FaceOptions) {
  const aspect = o.character === 'keen' ? .94 : o.character === 'dreamy' ? 1.12 : 1.04;
  const { r } = o, lw = pen.lw, eyeR = r * o.eye, ex = r * o.spread, ey = r * o.eyeY, turn = (o.turn ?? 0) * r;
  for (const side of [-1, 1]) {
    const anchor = pen.g(head, { transform: `translate(${f(side * ex + turn)} ${f(ey)})` });
    pen.el('path', { d: `M${f(-eyeR * 0.8)} ${f(eyeR * 0.05)}Q0 ${f(eyeR * 0.66)} ${f(eyeR * 0.8)} ${f(eyeR * 0.05)}`, fill: 'none', stroke: INK, 'stroke-width': lw * 0.85, 'stroke-linecap': 'round', class: 'portrait__sleep-eye' }, anchor);
    const open = pen.g(anchor, { class: 'portrait__eye' });
    const clip = pen.clip(ellipsePath(0, 0, eyeR, eyeR * aspect));
    pen.el('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * aspect, fill: EYE }, open);
    const pupil = pen.g(open, { class: 'portrait__pupil', 'clip-path': clip });
    pen.el('ellipse', { cx: eyeR * 0.06, cy: eyeR * 0.52, rx: eyeR * 0.74, ry: eyeR * 0.42, fill: EYE_SHADE, opacity: 0.55, 'clip-path': clip }, pupil);
    pen.el('circle', { cx: -eyeR * 0.34, cy: -eyeR * 0.38, r: eyeR * 0.21, fill: PAGE }, pupil);
    if (o.delighted) pen.el('circle', { cx: eyeR * 0.3, cy: eyeR * 0.3, r: eyeR * 0.08, fill: PAGE, opacity: 0.85 }, pupil);
    pen.el('ellipse', { cx: 0, cy: 0, rx: eyeR, ry: eyeR * aspect, fill: 'none', stroke: INK, 'stroke-width': lw * 0.5 }, open);
  }
  const mouthY = r * (o.kind === 'bird' ? 0.5 : o.kind === 'fish' ? 0.42 : 0.5);
  // shown when the critter has cheeks by nature or is delighted (the painter sets --cheeks, as version 2 does)
  for (const side of [-1, 1]) pen.el('ellipse', { cx: side * r * 0.72 + turn, cy: r * 0.5, rx: r * 0.15, ry: r * 0.085, fill: CHEEK, opacity: 0.55, class: 'portrait__cheek' }, head);
  if (o.kind === 'bird' && o.beakTone) {
    const b = o.beakTone, by = r * 0.3;
    pen.form(head, `M${f(-r * 0.15 + turn)} ${f(by)}Q${f(turn)} ${f(by - r * 0.12)} ${f(r * 0.15 + turn)} ${f(by)}Q${f(r * 0.04 + turn)} ${f(by + r * 0.24)} ${f(turn)} ${f(by + r * 0.26)}Q${f(-r * 0.04 + turn)} ${f(by + r * 0.24)} ${f(-r * 0.15 + turn)} ${f(by)}Z`, b, { weight: 0.55, size: r * 0.15 });
    return;
  }
  if (o.kind === 'mammal' || o.kind === 'lamb' || o.kind === 'turtle') {
    const nose = o.noseTone ?? INK, ny = r * 0.3;
    pen.el('path', { d: `M${f(-r * 0.08 + turn)} ${f(ny)}Q${f(turn)} ${f(ny - r * 0.05)} ${f(r * 0.08 + turn)} ${f(ny)}Q${f(turn)} ${f(ny + r * 0.09)} ${f(-r * 0.08 + turn)} ${f(ny)}Z`, fill: nose, opacity: o.kind === 'turtle' ? 0.55 : 0.85 }, head);
  }
  if (o.kind === 'fish') {
    pen.el('ellipse', { cx: turn, cy: mouthY, rx: r * 0.08, ry: r * 0.06, fill: INK, opacity: 0.75, class: 'p-calm' }, head);
    pen.el('path', { d: `M${f(-r * 0.12 + turn)} ${f(mouthY - r * 0.02)}Q${f(turn)} ${f(mouthY + r * 0.2)} ${f(r * 0.12 + turn)} ${f(mouthY - r * 0.02)}Z`, fill: '#7A3B3A', stroke: INK, 'stroke-width': lw * 0.45, class: 'portrait__mouth', opacity: 0 }, head);
    return;
  }
  pen.el('path', { d: `M${f(-r * 0.11 + turn)} ${f(mouthY)}Q${f(turn)} ${f(mouthY + r * 0.07)} ${f(r * 0.11 + turn)} ${f(mouthY)}`, fill: 'none', stroke: INK, 'stroke-width': lw * 0.58, 'stroke-linecap': 'round', class: 'p-calm' }, head);
  pen.el('path', { d: `M${f(-r * 0.15 + turn)} ${f(mouthY - r * 0.02)}Q${f(turn)} ${f(mouthY + r * 0.24)} ${f(r * 0.15 + turn)} ${f(mouthY - r * 0.02)}Z`, fill: '#7A3B3A', stroke: INK, 'stroke-width': lw * 0.5, 'stroke-linejoin': 'round', class: 'portrait__mouth' }, head);
}
