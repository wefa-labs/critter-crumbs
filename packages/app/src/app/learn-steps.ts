import { CLOVER, FERN, JUNIPER, MOSS, openingVariant, type Painting, type SceneCritter, type SceneHeap, type Standing } from './painted-scene.js';

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
  /** the step that tells the week: the three phases as lines on the sheet, and every statement open on the floor */
  phases?: true;
  /** a thought bubble beside each head, as the reveal screen draws them when statements open */
  bubbles?: readonly Standing[];
  /** the step links to the page behind "Why nobody can peek", at the foot of its words (why.tsx) */
  why?: true;
}
/**
 * Positions are in the painting, not the screen. x and y are percent of
 * the Window or Dusk painting (1600 x 897), and size is the drawing's width in painting pixels; the stylesheet draws
 * the painting at the launcher's zoom and anchors it to the floor's foot, so each critter stands on the same spot of
 * the room, at the same size against the table, on every screen. The four stand where the launcher stands them.
 */
const QUARTET = [
  { address: MOSS, variant: openingVariant(MOSS), x: 39.4, y: 90, size: 165, face: 'right' },
  { address: CLOVER, variant: openingVariant(CLOVER), x: 46.1, y: 94, size: 190, face: null },
  { address: JUNIPER, variant: openingVariant(JUNIPER), x: 54.5, y: 93, size: 190, face: 'left' },
  { address: FERN, variant: openingVariant(FERN), x: 61, y: 89, size: 165, face: 'left' },
] as const;
/** Each of the quartet's own handful, and later its pod, lies at its feet. */
const AT_FEET = [{ x: 43, y: 91.5 }, { x: 50, y: 95.5 }, { x: 58.5, y: 95 }, { x: 64.5, y: 90.5 }] as const;
/**
 * A thought bubble just right of a head, where the reveal screen puts it (game/layout.ts). A drawing's box is 1.25 times
 * as tall as wide (viewBox 120 × 150) and a Garden Spirit fills its lower part, so the bubble's foot sits about half
 * way up the box, measured in the browser on 3 November 2026; the taller October drawings wear it a little deeper.
 */
const bubbleBy = ({ x, y, size }: Standing): Standing => ({ x: x + 3.3, y: y - size * 1.25 / 897 * 100 * 0.48, size: 70 });

/**
 * The first steps behind "How it works": the flow page's three (SCREENS['learn-handful'], ['learn-tap'] and
 * ['learn-private']), the week between the tap and the pods, and the worked result at the end.
 */
export const LEARN_STEPS: readonly LearnStep[] = [
  { painting: 'window', critters: QUARTET.map(critter => ({ ...critter, asleep: false })), heaps: AT_FEET.map(spot => ({ ...spot, size: 52, crumbs: 6 })), pods: [] },
  {
    painting: 'window', heaps: [], pods: [], practice: { crumbs: 10, x: 50, y: 95.5, size: 88 },
    critters: [
      { address: MOSS, variant: openingVariant(MOSS), x: 40, y: 91.5, size: 190, asleep: false, face: 'right' },
      // in front of the cushions, not on the table (the flow page stood it at 64 %, on the table top)
      { address: CLOVER, variant: openingVariant(CLOVER), x: 50, y: 85, size: 170, asleep: false, face: null },
      { address: FERN, variant: openingVariant(FERN), x: 60, y: 91.5, size: 190, asleep: false, face: 'left' },
    ],
  },
  { painting: 'window', critters: QUARTET.map(critter => ({ ...critter, asleep: false })), heaps: [], pods: [], phases: true, bubbles: QUARTET.map(bubbleBy) },
  { painting: 'dusk', critters: QUARTET.map(critter => ({ ...critter, asleep: true })), heaps: [], pods: AT_FEET.map(spot => ({ x: spot.x, y: spot.y - 0.5, size: 40 })), why: true },
  { painting: 'window', critters: QUARTET.map(critter => ({ ...critter, asleep: false })), heaps: [], pods: [], why: true },
];

/**
 * The step the first steps were on when they were left, kept with their place in the browser's history (learn.tsx), so
 * coming back from the page behind "Why nobody can peek", or by the browser's Back, finds the same step. Anything else,
 * and steps opened afresh, start at the first.
 */
export function stepFrom(state: unknown): number {
  const step = typeof state === 'object' && state !== null && 'step' in state ? state.step : undefined;
  return typeof step === 'number' && Number.isInteger(step) && step >= 0 && step < LEARN_STEPS.length ? step : 0;
}
