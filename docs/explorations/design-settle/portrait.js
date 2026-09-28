// The app's 2D portrait (packages/app/src/portraits/index.ts, createPortrait) ported for a static
// page. Every version 1 part is unchanged. Version 2 adds the element parts of Design System §5.2
// (ears, crest, tail, markings and the glow point) through the same renderer, so the difference
// between the two versions is the generator's, not the drawing code's.
import { layout, palette } from './generator.js';

const NS = 'http://www.w3.org/2000/svg';
const UNIT = 46, FOOT = 140, CENTER = 60;
const SCALE_GAIN = 0.35, CHEEK_THRESHOLD = 0.5, MOUTH_THRESHOLD = 0.35, MOUTH_OPACITY = 0.6, EAR_DROOP = 25;
const LEAF = '#5F7A55', SKY = '#8FC6D8';
let serial = 0;

/** `ink` and `eyeWhite` are the palette's Burrow and Surface, as tokens.ts supplies them in the app. */
export function createPortrait(document, params, { name, size = 'stage', asleep = false, fed = 0, decorative = true, ink, eyeWhite }) {
  const geometry = layout(params), paints = palette(params), v2 = params.version === 2;
  const id = `cc${++serial}`;
  function element(tag, attrs = {}, parent) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    parent?.append(node); return node;
  }
  const svg = element('svg', { viewBox: '0 0 120 150', class: 'portrait', focusable: 'false', 'data-size': size });
  if (decorative) svg.setAttribute('aria-hidden', 'true');
  else { svg.setAttribute('role', 'img'); element('title', {}, svg).textContent = name; }
  if (size !== 'stage') { svg.setAttribute('width', String(size)); svg.setAttribute('height', String(size * 1.25)); }
  const style = svg.style;
  style.setProperty('--body', paints.body.css); style.setProperty('--accent', paints.accent.css);
  style.setProperty('--scale-x', String(1 + SCALE_GAIN * fed)); style.setProperty('--scale-y', String(1 + SCALE_GAIN * fed));
  style.setProperty('--head-tilt', `${params.headTilt}deg`);
  style.setProperty('--cheeks', params.cheeks || fed >= CHEEK_THRESHOLD ? '1' : '0');
  style.setProperty('--lids', asleep ? '0.12' : '1');
  svg.dataset.asleep = String(asleep);
  style.setProperty('--ear-l', `${asleep ? -EAR_DROOP : 0}deg`);
  style.setProperty('--ear-r', `${asleep ? -EAR_DROOP : 0}deg`);

  function radial(colour, opacity) {
    const gradient = element('radialGradient', { id: `${id}-${serial++}` }, svg);
    element('stop', { offset: 0, 'stop-color': colour, 'stop-opacity': opacity }, gradient);
    element('stop', { offset: 1, 'stop-color': colour, 'stop-opacity': 0 }, gradient);
    return `url(#${gradient.id})`;
  }

  element('ellipse', { cx: CENTER, cy: FOOT + 1, rx: geometry.bw * UNIT * 1.2, ry: 4, fill: ink, opacity: 0.18, class: 'portrait__shadow' }, svg);
  const figure = element('g', { class: 'portrait__figure' }, svg);
  const bodyY = FOOT - geometry.bodyC * UNIT, headY = FOOT - geometry.headC * UNIT;
  const width = geometry.bw * UNIT, height = geometry.bh * UNIT, radius = geometry.hr * UNIT;

  const rear = element('g', { fill: 'var(--accent)' }, figure);
  const tailX = CENTER + width * 0.85, tailY = bodyY + height * 0.35, r = radius;
  const tails = {
    puff: () => element('circle', { cx: CENTER + width * 0.9, cy: bodyY + height * 0.45, r: radius * 0.48 }, rear),
    stub: () => element('ellipse', { cx: CENTER + width, cy: bodyY + height * 0.55, rx: radius * 0.65, ry: radius * 0.26, transform: `rotate(-25 ${CENTER + width} ${bodyY + height * 0.55})` }, rear),
    curl: () => element('path', { d: `M${CENTER + width * .7} ${bodyY + height * .6} q${radius * 1.5} ${radius * .3} ${radius} ${-radius * .5} q${-radius * .5} ${-radius * .5} ${-radius * .55} 0`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': radius * .35, 'stroke-linecap': 'round' }, rear),
    branch: () => {
      element('path', { d: `M${tailX} ${tailY} q${r * .9} ${-r * .2} ${r * 1.3} ${-r * 1.4}`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': r * .12, 'stroke-linecap': 'round' }, rear);
      for (const [dx, dy, size, turn] of [[.55, -.35, .36, -35], [1.05, -.85, .32, -60], [1.3, -1.4, .28, -80]]) element('ellipse', { cx: tailX + dx * r, cy: tailY + dy * r, rx: size * r, ry: size * r * .55, transform: `rotate(${turn} ${tailX + dx * r} ${tailY + dy * r})` }, rear);
    },
    tadpole: () => element('path', { d: `M${tailX - r * .2} ${tailY - r * .15} q${r * 1.1} ${-r * .1} ${r * 1.5} ${-r * .9} q${-r * .2} ${r * .7} ${-r * 1.2} ${r * 1.15} z` }, rear),
    spark: () => { for (const [dx, dy, size] of [[.45, -.5, .2], [.85, -1.0, .16], [1.15, -1.55, .12]]) element('circle', { cx: tailX + dx * r, cy: tailY + dy * r, r: size * r, fill: params.glow }, rear); },
    emberwisp: () => { element('path', { d: `M${tailX - r * .2} ${tailY - r * .1} q${r * .9} ${-r * .4} ${r * 1.1} ${-r * 1.4} q${-r * .05} ${r * .8} ${-r * .8} ${r * 1.25} z` }, rear); element('circle', { cx: tailX + r * .9, cy: tailY - r * 1.45, r: r * .16, fill: params.glow }, rear); },
    cloudwisp: () => { element('circle', { cx: tailX + r * .4, cy: tailY, r: r * .42 }, rear); element('circle', { cx: tailX + r * .95, cy: tailY - r * .28, r: r * .3 }, rear); },
    longwisp: () => element('path', { d: `M${tailX - r * .2} ${tailY} q${r * 1.2} ${-r * .1} ${r * 1.7} ${-r * .8} q${r * .15} ${-r * .45} ${r * .45} ${-r * .8} q${-r * .6} ${r * .9} ${-r * 1.95} ${r * 1.75} z` }, rear),
  };
  tails[params.tailType]?.();

  for (const side of [-1, 1]) element('rect', { x: CENTER + side * width * .44 - .1 * UNIT, y: FOOT - geometry.leg * UNIT, width: .2 * UNIT, height: geometry.leg * UNIT, rx: .1 * UNIT, fill: 'var(--body)' }, figure);
  const body = element('g', { transform: params.bodyShape === 'bean' ? `translate(${CENTER} ${bodyY}) skewX(5) translate(${-CENTER} ${-bodyY})` : '', 'data-part': 'body' }, figure);
  element('ellipse', { cx: CENTER, cy: bodyY, rx: width, ry: height, fill: 'var(--body)' }, body);
  if (params.belly > 0) element('ellipse', { cx: CENTER + width * .08, cy: bodyY + height * .3, rx: width * (1 + params.belly * .25), ry: height * .65, fill: 'var(--body)' }, body);
  const markings = {
    'belly patch': () => element('ellipse', { cx: CENTER + width * .12, cy: bodyY + height * .22, rx: width * .57, ry: height * .62, fill: 'var(--accent)' }, body),
    spots: () => { for (const [x, y, size] of [[-.5, .05, .18], [.1, .42, .15], [.42, -.12, .2]]) element('circle', { cx: CENTER + x * width, cy: bodyY + y * height, r: size * width, fill: 'var(--accent)' }, body); },
    moss: () => { for (const [x, y] of [[-.5, -.2], [.35, .1], [-.1, .5]]) element('ellipse', { cx: CENTER + x * width, cy: bodyY + y * height, rx: width * .2, ry: height * .12, fill: 'var(--accent)' }, body); },
    dew: () => { for (const [x, y] of [[-.4, -.3], [.3, -.1], [-.2, .4], [.45, .4]]) element('circle', { cx: CENTER + x * width, cy: bodyY + y * height, r: width * .08, fill: params.glow }, body); },
    belly: () => element('ellipse', { cx: CENTER, cy: bodyY + height * .3, rx: width * .8, ry: height * .6, fill: radial(params.glow, .7) }, body),
    sky: () => { for (const [x, y] of [[-.45, -.1], [.2, .2], [-.15, .55]]) element('rect', { x: CENTER + x * width, y: bodyY + y * height, width: width * .3, height: height * .07, rx: height * .035, fill: SKY }, body); },
  };
  markings[params.markings]?.();
  if (params.armType !== 'none') for (const side of [-1, 1]) element('ellipse', { cx: CENTER + side * width * .95, cy: bodyY + height * .05, rx: radius * (params.armType === 'paws' ? .33 : .22), ry: radius * .5, fill: 'var(--accent)', transform: `rotate(${side * -15} ${CENTER + side * width * .95} ${bodyY})` }, figure);

  const headAnchor = element('g', { transform: `translate(${CENTER} ${headY})` }, figure);
  const head = element('g', { class: 'portrait__head' }, headAnchor);
  const earLength = geometry.earLen * UNIT;
  if (params.earType !== 'none') for (const side of [-1, 1]) {
    const anchor = element('g', { transform: `translate(${side * radius * .64} ${-radius * .65})` }, head);
    const ear = element('g', { class: `portrait__ear portrait__ear--${side < 0 ? 'l' : 'r'}` }, anchor);
    ear.style.setProperty('--ear-base', `${side * (params.earSpread + (params.earType === 'floppy' ? 70 : 0))}deg`);
    ear.style.setProperty('--ear-side', String(side));
    const w = earLength * (params.earType === 'long' ? .27 : .48), L = earLength;
    const shapes = {
      pointed: `M${-w} 0 Q${-w * .8} ${-L * .55} 0 ${-L} Q${w * .8} ${-L * .55} ${w} 0 Z`,
      tufts: `M${-w} 0 L${-w * .8} ${-L * .65} L${-w * .15} ${-L * .5} L0 ${-L} L${w * .35} ${-L * .55} L${w} ${-L * .7} L${w} 0 Z`,
      leaf: `M0 0 C${-w * 1.3} ${-L * .35} ${-w * .7} ${-L * .8} 0 ${-L} C${w * .7} ${-L * .8} ${w * 1.3} ${-L * .35} 0 0 Z`,
      fin: `M${-w * .9} 0 C${-w * .6} ${-L * .5} ${w * .1} ${-L * .9} ${w * .7} ${-L} C${w * .5} ${-L * .6} ${w * .8} ${-L * .25} ${w} 0 Z`,
      flame: [[-w * .55, .7], [0, 1], [w * .55, .75]].map(([dx, h]) => `M${dx - w * .4} 0 C${dx - w * .45} ${-L * h * .5} ${dx - w * .1} ${-L * h * .7} ${dx} ${-L * h} C${dx + w * .1} ${-L * h * .7} ${dx + w * .45} ${-L * h * .5} ${dx + w * .4} 0 Z`).join(' '),
      cloud: [[0, -L * .42, L * .42], [w * .55, -L * .78, L * .28]].map(([cx, cy, size]) => `M${cx - size} ${cy} a${size} ${size} 0 1 0 ${2 * size} 0 a${size} ${size} 0 1 0 ${-2 * size} 0`).join(' '),
      fern: `M${-w * .45} 0 C${-w * .7} ${-L * .45} ${-w * .35} ${-L * .85} ${w * .15} ${-L * .95} C${w * .75} ${-L * 1.02} ${w * .8} ${-L * .62} ${w * .3} ${-L * .62} C${w * .05} ${-L * .62} ${w * .05} ${-L * .78} ${w * .25} ${-L * .78} C${w * .1} ${-L * .55} ${w * .45} ${-L * .3} ${w * .45} 0 Z`,
    };
    const path = shapes[params.earType] ?? `M${-w} 0 C${-w * 1.4} ${-L * .7} ${-w * .7} ${-L} 0 ${-L} C${w * .9} ${-L} ${w * 1.3} ${-L * .6} ${w} 0 Z`;
    const mirror = v2 && side < 0 ? element('g', { transform: 'scale(-1 1)' }, ear) : ear;
    element('path', { d: path, fill: 'var(--body)' }, mirror);
    element('path', { d: path, fill: 'var(--accent)', transform: 'scale(.6 .72)' }, mirror);
  }
  if (params.headShape === 'squarish') element('rect', { x: -radius * 1.1, y: -radius * .92, width: radius * 2.2, height: radius * 1.84, rx: radius * .52, fill: 'var(--body)' }, head);
  else element('ellipse', { cx: 0, cy: 0, rx: radius, ry: radius * (params.headShape === 'egg' ? 1.15 : 1), fill: 'var(--body)' }, head);
  const top = -radius * (params.headShape === 'egg' ? 1.15 : params.headShape === 'squarish' ? .92 : 1);
  const crests = {
    sapling: () => { element('rect', { x: -r * .05, y: top - r * .55, width: r * .1, height: r * .6, rx: r * .05, fill: 'var(--accent)' }, head); element('ellipse', { cx: -r * .22, cy: top - r * .55, rx: r * .24, ry: r * .12, fill: LEAF, transform: `rotate(-25 ${-r * .22} ${top - r * .55})` }, head); element('ellipse', { cx: r * .22, cy: top - r * .42, rx: r * .24, ry: r * .12, fill: LEAF, transform: `rotate(22 ${r * .22} ${top - r * .42})` }, head); },
    droplet: () => element('path', { d: `M0 ${top - r * .7} C${r * .25} ${top - r * .35} ${r * .22} ${top + r * .05} 0 ${top + r * .05} C${-r * .22} ${top + r * .05} ${-r * .25} ${top - r * .35} 0 ${top - r * .7} Z`, fill: 'var(--accent)' }, head),
    reed: () => { element('rect', { x: -r * .04, y: top - r * .8, width: r * .08, height: r * .85, rx: r * .04, fill: LEAF }, head); element('ellipse', { cx: 0, cy: top - r * .78, rx: r * .09, ry: r * .2, fill: 'var(--accent)' }, head); },
    ember: () => element('path', { d: `M${-r * .15} ${top + r * .05} C${-r * .2} ${top - r * .3} ${-r * .02} ${top - r * .45} ${r * .05} ${top - r * .75} C${r * .12} ${top - r * .4} ${r * .25} ${top - r * .25} ${r * .18} ${top + r * .05} Z`, fill: params.glow }, head),
    seedpods: () => { for (const dx of [-.3, 0, .3]) element('circle', { cx: dx * r, cy: top - r * (dx === 0 ? .26 : .12), r: r * .16, fill: 'var(--accent)' }, head); },
  };
  crests[params.crest]?.();
  const eyeRadius = params.eyeSize * radius, eyeY = (0.5 - params.eyeHeight) * radius * 2;
  for (const side of [-1, 1]) {
    const eye = element('g', { transform: `translate(${side * params.eyeSpacing * radius} ${eyeY})` }, head);
    const awake = element('g', { class: 'portrait__eye' }, eye);
    if (params.eyeStyle === 'oval') awake.setAttribute('transform', 'scale(.85 1.15)');
    element('circle', { r: eyeRadius, fill: eyeWhite }, awake);
    const pupil = element('g', { class: 'portrait__pupil' }, awake);
    element('circle', { cx: eyeRadius * .15, r: params.pupilSize * eyeRadius, fill: ink }, pupil);
    element('circle', { cx: eyeRadius * .3, cy: -eyeRadius * .25, r: eyeRadius * .15, fill: eyeWhite }, pupil);
    if (params.eyeStyle === 'half-lid') element('path', { d: `M${-eyeRadius} 0 A${eyeRadius} ${eyeRadius} 0 0 1 ${eyeRadius} 0 Z`, fill: 'var(--body)' }, awake);
    element('path', { d: `M${-eyeRadius} 0 Q0 ${eyeRadius * .65} ${eyeRadius} 0`, fill: 'none', stroke: ink, 'stroke-width': 1.2, 'stroke-linecap': 'round', class: 'portrait__sleep-eye' }, eye);
    const cheek = element('g', { transform: `translate(${side * radius * .63} ${radius * .28})` }, head);
    element('ellipse', { rx: radius * .21, ry: radius * .13, fill: 'var(--accent)', class: 'portrait__cheek' }, cheek);
  }
  if (params.snout === 'button') element('ellipse', { cx: radius * .05, cy: radius * .23, rx: radius * .14, ry: radius * .1, fill: 'var(--accent)' }, head);
  if (params.snout === 'muzzle') element('ellipse', { cx: radius * .08, cy: radius * .28, rx: radius * .3, ry: radius * .19, fill: 'var(--accent)' }, head);
  element('path', { d: `M${-radius * .2} ${radius * .4} Q0 ${radius * .65} ${radius * .22} ${radius * .4}`, fill: 'none', stroke: ink, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: fed >= MOUTH_THRESHOLD ? MOUTH_OPACITY : 0, class: 'portrait__mouth' }, head);
  if (v2) {
    const glow = radial(params.glow, 1);
    if (params.spot === 'brow') element('circle', { cx: 0, cy: -radius * .55, r: radius * .3, fill: glow, opacity: .6 }, head);
    else element('circle', { cx: CENTER, cy: params.spot === 'throat' ? bodyY - height * .8 : bodyY - height * .45, r: radius * .42, fill: glow, opacity: .6 }, figure);
  }
  return svg;
}
