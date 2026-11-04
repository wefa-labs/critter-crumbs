import type { Facing, Painting, Standing } from './painted-scene.js';
import type { MemberFeast, PublicFeast } from './feast-view.js';

/**
 * Where a feast's pages before scattering stand, as the flow page draws them (docs/explorations/app-screens:
 * SCREENS.gathering, ['gathering-options'], draft, late and unknown): each screen's painting, its sheet's height on the
 * design's 812 px phone, and where its critters stand, by their feet in percent of the floor and sized in the design's
 * phone pixels (painted-scene.ts). Each list of spots is returned from the back of the floor to the front, the order to
 * draw them in, with `index` naming the critter that stands there.
 */
export interface FloorSpot extends Standing { face: Facing }
export interface RowSpot extends FloorSpot { index: number }

/** As many critters as the flow page draws in each row; more shrink, as a larger burrow's ring does (invite-circle.ts). */
const ROOMY_PEOPLE = 8, ROOMY_OPTIONS = 4;
const crowd = (n: number, roomy: number) => n > roomy ? Math.sqrt(roomy / n) : 1;
const backToFront = (spots: RowSpot[]) => spots.sort((a, b) => a.y - b.y);

/**
 * Gathering for people (gatheringScene(), row()): the burrow's critters across the floor in two staggered rows, the
 * second a little nearer and larger, the first half turned right and the rest left. A 560 px sheet leaves the floor too
 * short for the invite's ring, whose front critters would stand over the ones behind them.
 */
export function gatheringRow(n: number): RowSpot[] {
  const scale = crowd(n, ROOMY_PEOPLE);
  return backToFront(Array.from({ length: n }, (_, index) => ({
    index, x: 8 + index * 84 / Math.max(1, n - 1), y: 72 + (index % 2 ? 10 : 0), size: (58 + (index % 2 ? 6 : 0)) * scale, face: index < n / 2 ? 'right' : 'left',
  })));
}

/** An options feast while gathering (optionCritters()): each option's critter across the front of the floor, alternately set back. */
export function optionsRow(n: number): RowSpot[] {
  const scale = crowd(n, ROOMY_OPTIONS);
  return backToFront(Array.from({ length: n }, (_, index) => ({
    index, x: 16 + index * 67.8 / Math.max(1, n - 1), y: 86 - (index % 2) * 8, size: (78 - (index % 2) * 8) * scale, face: index < n / 2 ? 'right' : 'left',
  })));
}

/** Gathering, for people and for options: a sheet 560 pixels tall. */
export const GATHERING_SCENE: { painting: Painting; sheetHeight: number } = { painting: 'window', sheetHeight: 560 };

/** The saved draft: your critter in the middle at the front of a strip of floor, one critter either side of it, over a sheet 610 pixels tall. */
export const DRAFT_SCENE: { painting: Painting; sheetHeight: number; viewer: FloorSpot; beside: readonly [FloorSpot, FloorSpot] } = {
  painting: 'window', sheetHeight: 610,
  viewer: { x: 50, y: 98, size: 70, face: null },
  beside: [{ x: 32, y: 96, size: 64, face: 'right' }, { x: 68, y: 96, size: 64, face: 'left' }],
};

/** Joined too late: the feast's critters in their ring and you at the edge of the floor, watching, over a sheet 250 pixels tall. */
export const LATE_SCENE: { painting: Painting; sheetHeight: number; viewer: FloorSpot } = { painting: 'window', sheetHeight: 250, viewer: { x: 91, y: 97, size: 62, face: 'left' } };

/** A cancelled or void feast: its critters asleep in their ring, over a sheet as tall as the late one's. The flow page draws neither. */
export const ENDED_SCENE: { painting: Painting; sheetHeight: number } = { painting: 'window', sheetHeight: 250 };

/**
 * A feast's link that is not yours to follow, or leads nowhere (SCREENS.unknown): one critter at the left of the floor,
 * over a sheet 330 pixels tall. The flow page paints the burrow's entrance, which the app does not have yet.
 */
export const NOWHERE_SCENE: { painting: Painting; sheetHeight: number; critter: FloorSpot } = { painting: 'window', sheetHeight: 330, critter: { x: 34, y: 94, size: 112, face: 'right' } };

/** Whose face is at the right of the header, and what pressing it opens. */
export interface Viewer { address: string; variant: number; open: () => void }

/**
 * The frame's header on a feast's page (hdr({ burrow, title })): the burrow's name over the feast's title, leading to the
 * burrow for a member, who is the only one the feast tells which burrow that is, and the viewer's face.
 */
export function feastFrame(feast: PublicFeast | MemberFeast, viewer: Viewer | undefined) {
  return { title: feast.title, burrow: feast.burrowName, ...('burrowId' in feast ? { href: burrowPath(feast) } : {}), ...(viewer ? { viewer } : {}) };
}

/** A member's way back from a feast: its burrow. */
export const burrowPath = (feast: MemberFeast) => `/burrows/${feast.burrowId}`;
