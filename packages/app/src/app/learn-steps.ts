import { CLOVER, FERN, JUNIPER, MOSS, type Painting, type SceneCritter, type SceneHeap, type Standing } from './painted-scene.js';

/** The sheet's height on the phone, the same on every step so the floor does not move between them. */
export const LEARN_SHEET_HEIGHT = 300;

export interface LearnStep {
  painting: Painting;
  critters: readonly SceneCritter[];
  heaps: readonly SceneHeap[];
  /** closed seed pods: where a scatter rests until the feast */
  pods: readonly Standing[];
  /** the heap of practice crumbs, on the step where a tap gives one */
  practice?: SceneHeap;
}
const QUARTET = [
  { address: MOSS, x: 18, y: 78, size: 95, face: 'right' },
  { address: CLOVER, x: 40, y: 84, size: 105, face: null },
  { address: JUNIPER, x: 62, y: 84, size: 105, face: 'left' },
  { address: FERN, x: 83, y: 78, size: 95, face: 'left' },
] as const;
/** Each of the quartet's own handful, and later its pod, lies at its feet. */
const AT_FEET = [{ x: 27, y: 81 }, { x: 50, y: 87 }, { x: 72, y: 87 }, { x: 92, y: 81 }] as const;

/** The first steps behind "How it works" (flow page, SCREENS['learn-handful'], ['learn-tap'] and ['learn-private']). */
export const LEARN_STEPS: readonly LearnStep[] = [
  { painting: 'window', critters: QUARTET.map(critter => ({ ...critter, asleep: false })), heaps: AT_FEET.map(spot => ({ ...spot, size: 34, crumbs: 6 })), pods: [] },
  {
    painting: 'window', heaps: [], pods: [], practice: { crumbs: 10, x: 50, y: 90, size: 64 },
    critters: [
      { address: MOSS, x: 24, y: 80, size: 110, asleep: false, face: 'right' },
      { address: CLOVER, x: 50, y: 64, size: 95, asleep: false, face: null },
      { address: FERN, x: 76, y: 80, size: 110, asleep: false, face: 'left' },
    ],
  },
  { painting: 'dusk', critters: QUARTET.map(critter => ({ ...critter, asleep: true })), heaps: [], pods: AT_FEET.map(spot => ({ x: spot.x, y: spot.y - 1, size: 26 })) },
];
