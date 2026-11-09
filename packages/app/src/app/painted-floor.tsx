import type { PointerEvent, ReactNode, Ref } from 'react';
import { CrumbMound } from '../game/mound.js';
import { stirCritter } from './floor-stir.js';
import { standingStyle, type Beside, type Painting, type SceneCritter, type SceneHeap } from './painted-scene.js';
import { PortraitImage } from './ui.js';

/**
 * A screen's painted floor (flow page, sceneLayer): the painting under the look's wash, and whatever stands on it. The
 * drawings are decoration; a screen's words are in its plate and its sheet. A touch on a critter stirs it, as your own
 * critter stirs in the game (the November UI audit's toy outside the game); a floor drawn otherwise, such as the
 * invite's plate, passes its own `backdrop`.
 */
export function PaintedFloor({ painting, backdrop, className, ref, children }: { painting: Painting; backdrop?: ReactNode; className: string; ref?: Ref<HTMLDivElement>; children: ReactNode }) {
  return <div className={className} ref={ref} onPointerDown={stirTouched}>{backdrop ?? <><div className="scene-paint" data-painting={painting} /><div className="scene-wash" /></>}{children}</div>;
}

/**
 * The floor's one handler: the critter under a touch stirs. It is decoration, so it takes no focus, says nothing and
 * changes nothing; a critter with its own control (the first steps' practice critters) keeps its presses, and under
 * Still critters or reduced motion (html[data-still], app.tsx) nothing moves.
 */
function stirTouched(event: PointerEvent<HTMLDivElement>) {
  const target = event.target;
  if (!event.isPrimary || event.button !== 0 || !(target instanceof Element) || target.closest('button, a, input, label')) return;
  if (target.ownerDocument.documentElement.dataset.still === 'true') return;
  const critter = target.closest<HTMLElement>('.floor-critter');
  if (critter && event.currentTarget.contains(critter)) stirCritter(critter);
}

/** A critter standing on the floor by its feet; `delighted` smiles, as your critter does on its profile. */
export function FloorCritter({ critter, beside, children, fed = 0, delighted = false }: { critter: SceneCritter; beside?: Beside; children?: ReactNode; fed?: number; delighted?: boolean }) {
  return (
    <div className="floor-critter" data-face={critter.face} style={standingStyle(critter, beside)}>
      <PortraitImage address={critter.address} variant={critter.variant ?? 0} name="" size="stage" asleep={critter.asleep} fed={fed} delighted={delighted} />
      {children}
    </div>
  );
}

/** A heap of crumbs on the floor; emptied, it leaves three faint outlines, as your own heap does. `practice` marks the heap practice crumbs fly from. */
export function FloorHeap({ heap, beside, crumbs = heap.crumbs, practice = false }: { heap: SceneHeap; beside?: Beside; crumbs?: number; practice?: boolean }) {
  return <div className="floor-prop" data-practice={practice || undefined} style={standingStyle(heap, beside)}><CrumbMound count={crumbs} glyphs={crumbs} empty /></div>;
}
