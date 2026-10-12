import { layout, type CritterParameters } from '@critter-crumbs/core';
import { GROWTH, IDLE, RIG } from '@critter-crumbs/shared';
import { palette } from './colour.js';
import { tokens } from '../styles/tokens.js';

const NS = 'http://www.w3.org/2000/svg';
/** One unit of the core layout, in the drawing's own pixels. */
export const UNIT = 46;
const FOOT = 140, CENTER = 60;
/** What a drawing remembers: its measures, and the pose the simulation last showed it in (portraits/pose.ts). */
export interface PortraitState { eyeRadius: number; headRadius: number; asleep?: boolean; scale?: number; cleanup?: () => void }
const state = new WeakMap<SVGSVGElement, PortraitState>();
export const portraitState = (svg: SVGSVGElement) => state.get(svg);
export interface PortraitOptions { name: string; decorative?: boolean; size?: 40 | 64 | 96 | 'stage'; asleep?: boolean; fed?: number }

/** Frozen parameters and core layout produce elements, never markup or injected text. */
export function createPortrait(document: Document, params: CritterParameters, options: PortraitOptions) {
  const geometry = layout(params), paints = palette(params);
  function element<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: SVGElement) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    parent?.append(node); return node;
  }
  const svg = element('svg', { viewBox: '0 0 120 150', class: 'portrait', focusable: 'false', 'data-size': options.size ?? 'stage' });
  if (options.decorative) svg.setAttribute('aria-hidden', 'true');
  else { svg.setAttribute('role', 'img'); element('title', {}, svg).textContent = options.name; }
  if (options.size && options.size !== 'stage') { svg.setAttribute('width', String(options.size)); svg.setAttribute('height', String(options.size * 1.25)); }
  for (const key of ['earType', 'bodyShape', 'headShape', 'markings', 'tailType', 'eyeStyle'] as const) svg.dataset[key] = params[key];
  const style = svg.style;
  style.setProperty('--body', paints.body.css); style.setProperty('--accent', paints.accent.css);
  style.setProperty('--scale-x', String(1 + GROWTH.scaleGain * (options.fed ?? 0))); style.setProperty('--scale-y', String(1 + GROWTH.scaleGain * (options.fed ?? 0)));
  style.setProperty('--head-tilt', `${params.headTilt}deg`);
  style.setProperty('--cheeks', params.cheeks || (options.fed ?? 0) >= RIG.cheekThreshold ? '1' : '0');
  style.setProperty('--lids', options.asleep ? '0.12' : '1');
  svg.dataset.asleep = String(options.asleep ?? false);
  style.setProperty('--ear-l', `${options.asleep ? -IDLE.asleep.earDroop : 0}deg`);
  style.setProperty('--ear-r', `${options.asleep ? -IDLE.asleep.earDroop : 0}deg`);
  element('ellipse', { cx: CENTER, cy: FOOT + 1, rx: geometry.bw * UNIT * 1.2, ry: 4, fill: tokens.burrow, opacity: 0.18, class: 'portrait__shadow' }, svg);
  const figure = element('g', { class: 'portrait__figure' }, svg);
  const bodyY = FOOT - geometry.bodyC * UNIT, headY = FOOT - geometry.headC * UNIT;
  const width = geometry.bw * UNIT, height = geometry.bh * UNIT, radius = geometry.hr * UNIT;
  const rear = element('g', { fill: 'var(--accent)' }, figure);
  if (params.tailType === 'puff') element('circle', { cx: CENTER + width * 0.9, cy: bodyY + height * 0.45, r: radius * 0.48 }, rear);
  if (params.tailType === 'stub') element('ellipse', { cx: CENTER + width, cy: bodyY + height * 0.55, rx: radius * 0.65, ry: radius * 0.26, transform: `rotate(-25 ${CENTER + width} ${bodyY + height * 0.55})` }, rear);
  if (params.tailType === 'curl') element('path', { d: `M${CENTER + width * .7} ${bodyY + height * .6} q${radius * 1.5} ${radius * .3} ${radius} ${-radius * .5} q${-radius * .5} ${-radius * .5} ${-radius * .55} 0`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': radius * .35, 'stroke-linecap': 'round' }, rear);
  for (const side of [-1, 1]) element('rect', { x: CENTER + side * width * .44 - .1 * UNIT, y: FOOT - geometry.leg * UNIT, width: .2 * UNIT, height: geometry.leg * UNIT, rx: .1 * UNIT, fill: 'var(--body)' }, figure);
  const body = element('g', { transform: params.bodyShape === 'bean' ? `translate(${CENTER} ${bodyY}) skewX(5) translate(${-CENTER} ${-bodyY})` : '', 'data-part': 'body' }, figure);
  element('ellipse', { cx: CENTER, cy: bodyY, rx: width, ry: height, fill: 'var(--body)' }, body);
  if (params.belly > 0) element('ellipse', { cx: CENTER + width * .08, cy: bodyY + height * .3, rx: width * (1 + params.belly * .25), ry: height * .65, fill: 'var(--body)' }, body);
  if (params.markings === 'belly patch') element('ellipse', { cx: CENTER + width * .12, cy: bodyY + height * .22, rx: width * .57, ry: height * .62, fill: 'var(--accent)' }, body);
  if (params.markings === 'spots') for (const [x, y, r] of [[-.5, .05, .18], [.1, .42, .15], [.42, -.12, .2]]) element('circle', { cx: CENTER + x! * width, cy: bodyY + y! * height, r: r! * width, fill: 'var(--accent)' }, body);
  if (params.armType !== 'none') for (const side of [-1, 1]) element('ellipse', { cx: CENTER + side * width * .95, cy: bodyY + height * .05, rx: radius * (params.armType === 'paws' ? .33 : .22), ry: radius * .5, fill: 'var(--accent)', transform: `rotate(${side * -15} ${CENTER + side * width * .95} ${bodyY})` }, figure);
  const headAnchor = element('g', { transform: `translate(${CENTER} ${headY})` }, figure);
  const head = element('g', { class: 'portrait__head' }, headAnchor);
  const earLength = geometry.earLen * UNIT;
  if (params.earType !== 'none') for (const side of [-1, 1]) {
    const anchor = element('g', { transform: `translate(${side * radius * .64} ${-radius * .65})` }, head);
    const ear = element('g', { class: `portrait__ear portrait__ear--${side < 0 ? 'l' : 'r'}` }, anchor);
    ear.style.setProperty('--ear-base', `${side * (params.earSpread + (params.earType === 'floppy' ? 70 : 0))}deg`);
    ear.style.setProperty('--ear-side', String(side));
    const earWidth = earLength * (params.earType === 'long' ? .27 : .48);
    const path = params.earType === 'pointed' ? `M${-earWidth} 0 Q${-earWidth * .8} ${-earLength * .55} 0 ${-earLength} Q${earWidth * .8} ${-earLength * .55} ${earWidth} 0 Z`
      : params.earType === 'tufts' ? `M${-earWidth} 0 L${-earWidth * .8} ${-earLength * .65} L${-earWidth * .15} ${-earLength * .5} L0 ${-earLength} L${earWidth * .35} ${-earLength * .55} L${earWidth} ${-earLength * .7} L${earWidth} 0 Z`
      : `M${-earWidth} 0 C${-earWidth * 1.4} ${-earLength * .7} ${-earWidth * .7} ${-earLength} 0 ${-earLength} C${earWidth * .9} ${-earLength} ${earWidth * 1.3} ${-earLength * .6} ${earWidth} 0 Z`;
    element('path', { d: path, fill: 'var(--body)' }, ear);
    element('path', { d: path, fill: 'var(--accent)', transform: 'scale(.6 .72)' }, ear);
  }
  if (params.headShape === 'squarish') element('rect', { x: -radius * 1.1, y: -radius * .92, width: radius * 2.2, height: radius * 1.84, rx: radius * .52, fill: 'var(--body)' }, head);
  else element('ellipse', { cx: 0, cy: 0, rx: radius, ry: radius * (params.headShape === 'egg' ? 1.15 : 1), fill: 'var(--body)' }, head);
  const eyeRadius = params.eyeSize * radius, eyeY = (0.5 - params.eyeHeight) * radius * 2;
  for (const side of [-1, 1]) {
    const eye = element('g', { transform: `translate(${side * params.eyeSpacing * radius} ${eyeY})` }, head);
    const awake = element('g', { class: 'portrait__eye' }, eye);
    if (params.eyeStyle === 'oval') awake.setAttribute('transform', 'scale(.85 1.15)');
    element('circle', { r: eyeRadius, fill: tokens.surface }, awake);
    const pupil = element('g', { class: 'portrait__pupil' }, awake);
    element('circle', { cx: eyeRadius * .15, r: params.pupilSize * eyeRadius, fill: tokens.burrow }, pupil);
    element('circle', { cx: eyeRadius * .3, cy: -eyeRadius * .25, r: eyeRadius * .15, fill: tokens.surface }, pupil);
    if (params.eyeStyle === 'half-lid') element('path', { d: `M${-eyeRadius} 0 A${eyeRadius} ${eyeRadius} 0 0 1 ${eyeRadius} 0 Z`, fill: 'var(--body)' }, awake);
    element('path', { d: `M${-eyeRadius} 0 Q0 ${eyeRadius * .65} ${eyeRadius} 0`, fill: 'none', stroke: tokens.burrow, 'stroke-width': 1.2, 'stroke-linecap': 'round', class: 'portrait__sleep-eye' }, eye);
    const cheek = element('g', { transform: `translate(${side * radius * .63} ${radius * .28})` }, head);
    element('ellipse', { rx: radius * .21, ry: radius * .13, fill: 'var(--accent)', class: 'portrait__cheek' }, cheek);
  }
  if (params.snout === 'button') element('ellipse', { cx: radius * .05, cy: radius * .23, rx: radius * .14, ry: radius * .1, fill: 'var(--accent)' }, head);
  if (params.snout === 'muzzle') element('ellipse', { cx: radius * .08, cy: radius * .28, rx: radius * .3, ry: radius * .19, fill: 'var(--accent)' }, head);
  element('path', { d: `M${-radius * .2} ${radius * .4} Q0 ${radius * .65} ${radius * .22} ${radius * .4}`, fill: 'none', stroke: tokens.burrow, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: (options.fed ?? 0) >= RIG.mouthThreshold ? RIG.mouthOpacity : 0, class: 'portrait__mouth' }, head);
  state.set(svg, { eyeRadius, headRadius: radius });
  return svg;
}

export function rememberPortrait(svg: SVGSVGElement, radii: { eyeRadius: number; headRadius: number }) { state.set(svg, radii); }

export function disposePortrait(svg: SVGSVGElement) { state.get(svg)?.cleanup?.(); state.delete(svg); }
