import { DOM_HOP } from '@critter-crumbs/shared';
import { hopPosition } from './hop-geometry.js';

/** How many points of the hop's arc the browser is given to move the crumb through. */
const ARC_POINTS = 9;
/** A fed critter squashes and springs back, as the flow page's practice critters do. */
const SQUASH = [{ scale: '1 1' }, { scale: '1.06 .94', offset: .4 }, { scale: '1 1' }], SQUASH_MS = 240;

/**
 * One practice crumb hops from the heap to a critter and is gone: the scatter screen's hop (Game Design §6, the same
 * arc, duration and easing), run by the browser's own animation clock because nothing here is counted or kept.
 * `crumb` is a drawn crumb the caller has cloned; positions are measured as the flight begins.
 */
export function flyPracticeCrumb(scene: HTMLElement, crumb: HTMLElement, heap: Element, critter: Element) {
  const frame = scene.getBoundingClientRect(), from = heap.getBoundingClientRect(), to = critter.getBoundingClientRect();
  const start = { x: from.left + from.width / 2 - frame.left, y: from.top + from.height * .4 - frame.top };
  const end = { x: to.left + to.width / 2 - frame.left, y: to.top + to.height * .55 - frame.top };
  const arc = Array.from({ length: ARC_POINTS }, (_, index) => {
    const t = index / (ARC_POINTS - 1), point = hopPosition(start, end, t);
    return { translate: `${point.x}px ${point.y}px`, rotate: `${DOM_HOP.turnDegrees * t}deg`, opacity: t < DOM_HOP.fadeAt ? 1 : (1 - t) / (1 - DOM_HOP.fadeAt), offset: t };
  });
  scene.append(crumb);
  const flight = crumb.animate(arc, { duration: DOM_HOP.ms, easing: `cubic-bezier(${DOM_HOP.ease.join(',')})`, fill: 'forwards' });
  const land = () => { crumb.remove(); critter.animate(SQUASH, SQUASH_MS); };
  flight.finished.then(land, () => crumb.remove());
}
