import { CLOVER, FERN, JUNIPER, MOSS, type Painting, type SceneCritter, type SceneHeap, type Standing } from './painted-scene.js';

/** The sheet's height on the phone, the same on every step so the floor does not move between them. */
export const LEARN_SHEET_HEIGHT = 410;

export interface LearnStep {
  painting: Painting;
  critters: readonly SceneCritter[];
  heaps: readonly SceneHeap[];
  /** closed seed pods: where a scatter rests until the feast */
  pods: readonly Standing[];
  /** the heap of practice crumbs, on the step where a tap gives one */
  practice?: SceneHeap;
}
/**
 * Positions are in the painting, not the screen. x and y are percent of
 * the Window or Dusk painting (1600 x 897), and size is the drawing's width in painting pixels; the stylesheet draws
 * the painting at the launcher's zoom and anchors it to the floor's foot, so each critter stands on the same spot of
 * the room, at the same size against the table, on every screen. The four stand where the launcher stands them.
 */
const QUARTET = [
  { address: MOSS, x: 39.4, y: 90, size: 165, face: 'right' },
  { address: CLOVER, x: 46.1, y: 94, size: 190, face: null },
  { address: JUNIPER, x: 54.5, y: 93, size: 190, face: 'left' },
  { address: FERN, x: 61, y: 89, size: 165, face: 'left' },
] as const;
/** Each of the quartet's own handful, and later its pod, lies at its feet. */
const AT_FEET = [{ x: 43, y: 91.5 }, { x: 50, y: 95.5 }, { x: 58.5, y: 95 }, { x: 64.5, y: 90.5 }] as const;

/** The first steps behind "How it works" (flow page, SCREENS['learn-handful'], ['learn-tap'] and ['learn-private']). */
export const LEARN_STEPS: readonly LearnStep[] = [
  { painting: 'window', critters: QUARTET.map(critter => ({ ...critter, asleep: false })), heaps: AT_FEET.map(spot => ({ ...spot, size: 52, crumbs: 6 })), pods: [] },
  {
    painting: 'window', heaps: [], pods: [], practice: { crumbs: 10, x: 50, y: 95.5, size: 88 },
    critters: [
      { address: MOSS, x: 40, y: 91.5, size: 190, asleep: false, face: 'right' },
      // in front of the cushions, not on the table (the flow page stood it at 64 %, on the table top)
      { address: CLOVER, x: 50, y: 85, size: 170, asleep: false, face: null },
      { address: FERN, x: 60, y: 91.5, size: 190, asleep: false, face: 'left' },
    ],
  },
  { painting: 'dusk', critters: QUARTET.map(critter => ({ ...critter, asleep: true })), heaps: [], pods: AT_FEET.map(spot => ({ x: spot.x, y: spot.y - 0.5, size: 40 })) },
  { painting: 'window', critters: QUARTET.map(critter => ({ ...critter, asleep: false })), heaps: [], pods: [] },
];
