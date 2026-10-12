import type { ReactNode, Ref } from 'react';
import { CrumbMound } from '../game/mound.js';
import { standingStyle, type Beside, type Painting, type SceneCritter, type SceneHeap } from './painted-scene.js';
import { PortraitImage } from './ui.js';

/**
 * A screen's painted floor (flow page, sceneLayer): the painting under the look's wash, and whatever stands on it. The
 * drawings are decoration; a screen's words are in its plate and its sheet.
 */
export function PaintedFloor({ painting, className, ref, children }: { painting: Painting; className: string; ref?: Ref<HTMLDivElement>; children: ReactNode }) {
  return <div className={className} ref={ref}><div className="scene-paint" data-painting={painting} /><div className="scene-wash" />{children}</div>;
}

/** A critter standing on the floor by its feet. */
export function FloorCritter({ critter, beside, children }: { critter: SceneCritter; beside?: Beside; children?: ReactNode }) {
  return (
    <div className="floor-critter" data-face={critter.face} style={standingStyle(critter, beside)}>
      <PortraitImage address={critter.address} variant={critter.variant ?? 0} name="" size="stage" asleep={critter.asleep} />
      {children}
    </div>
  );
}

/** A heap of crumbs on the floor; emptied, it leaves three faint outlines, as your own heap does. `practice` marks the heap practice crumbs fly from. */
export function FloorHeap({ heap, beside, crumbs = heap.crumbs, practice = false }: { heap: SceneHeap; beside?: Beside; crumbs?: number; practice?: boolean }) {
  return <div className="floor-prop" data-practice={practice || undefined} style={standingStyle(heap, beside)}><CrumbMound count={crumbs} glyphs={crumbs} empty /></div>;
}
