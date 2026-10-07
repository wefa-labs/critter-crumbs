import type { CopyId } from '@critter-crumbs/shared';
import type { GameScreenState } from '../app/feast-view.js';
import { DESKTOP_MIN_WIDTH } from './layout.js';

/**
 * What each core game state shows, ported from the review pages: the flow page's SCREENS for the moments around
 * the scatter screen, and the scatter page (pass eleven) for the screen itself. Pure; the live screens and the
 * gallery both render it, so a state cannot drift into another state's layout.
 */
export type Device = 'phone' | 'desktop';

/** One surface per state. A sheet is the phone's bottom sheet at its height and the side panel on desktop. */
export type Surface =
  | { kind: 'dock' }
  | { kind: 'sheet'; height: number }
  | { kind: 'results' };

export interface SceneTreatment {
  scene: 'window' | 'dusk';
  light: 'day' | 'feast';
  /** Every critter but your own. */
  mood: 'awake' | 'asleep' | 'delighted';
  ownAsleep: boolean;
  bubbles: 'none' | 'focus' | 'all';
  tags: boolean;
  piles: boolean;
  heap: 'none' | 'remaining';
  huddle: boolean;
  controls: 'none' | 'live' | 'disabled';
}

export interface Composition {
  surface: Surface;
  scene: SceneTreatment;
  /** A passing message at the top of the floor. */
  toast?: CopyId;
  /** The signing step, over the dock. */
  dialog?: 'sign';
}

const scattering: SceneTreatment = { scene: 'window', light: 'day', mood: 'awake', ownAsleep: true, bubbles: 'focus', tags: true, piles: true, heap: 'remaining', huddle: false, controls: 'live' };
const sleeping: SceneTreatment = { scene: 'dusk', light: 'day', mood: 'asleep', ownAsleep: true, bubbles: 'none', tags: false, piles: false, heap: 'remaining', huddle: false, controls: 'none' };
const gathered: SceneTreatment = { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, bubbles: 'none', tags: false, piles: false, heap: 'none', huddle: true, controls: 'none' };

const COMPOSITIONS: Record<GameScreenState, Composition> = {
  /* flow 34 */
  reveal: { surface: { kind: 'sheet', height: 230 }, scene: { scene: 'window', light: 'day', mood: 'delighted', ownAsleep: true, bubbles: 'all', tags: false, piles: false, heap: 'none', huddle: false, controls: 'none' } },
  /* scatter page: #scatter, #reading, #done, #scattered */
  scatter: { surface: { kind: 'dock' }, scene: scattering },
  reading: { surface: { kind: 'dock' }, scene: scattering },
  done: { surface: { kind: 'dock' }, scene: scattering },
  /* flow 36–40: the dock moments */
  signing: { surface: { kind: 'dock' }, scene: scattering, dialog: 'sign' },
  saving: { surface: { kind: 'dock' }, scene: scattering },
  scattered: { surface: { kind: 'dock' }, scene: scattering, toast: 'err.saveVerified' },
  rejected: { surface: { kind: 'dock' }, scene: scattering, toast: 'scatter.sign.rejected' },
  failed: { surface: { kind: 'dock' }, scene: scattering, toast: 'err.saveFailed' },
  /* flow 41 */
  closed: { surface: { kind: 'dock' }, scene: { ...scattering, scene: 'dusk', mood: 'asleep', bubbles: 'none', controls: 'disabled' } },
  /* flow 42, 43 */
  waiting: { surface: { kind: 'sheet', height: 250 }, scene: sleeping },
  key: { surface: { kind: 'sheet', height: 250 }, scene: sleeping },
  /* flow 44; the feast heap stays while the crumbs fly from it (Game Design G6), though the flow page's still omits it */
  feast: { surface: { kind: 'sheet', height: 144 }, scene: { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, bubbles: 'none', tags: false, piles: true, heap: 'remaining', huddle: false, controls: 'none' } },
  /* scatter page #feast with Results closed: everyone grown, the totals on their tags, Results in the bar */
  feasted: { surface: { kind: 'dock' }, scene: { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, bubbles: 'focus', tags: true, piles: false, heap: 'none', huddle: false, controls: 'none' } },
  /* flow 45 */
  nobody: { surface: { kind: 'sheet', height: 260 }, scene: { scene: 'window', light: 'day', mood: 'awake', ownAsleep: false, bubbles: 'none', tags: false, piles: false, heap: 'none', huddle: false, controls: 'none' } },
  /* scatter page #feast with Results open; flow 46–50 give each variant's contents */
  results: { surface: { kind: 'results' }, scene: gathered },
  tie: { surface: { kind: 'results' }, scene: gathered },
  givers: { surface: { kind: 'results' }, scene: gathered },
  recording: { surface: { kind: 'results' }, scene: gathered },
  recorded: { surface: { kind: 'results' }, scene: gathered },
  public: { surface: { kind: 'results' }, scene: gathered },
};

/** Desktop from DESKTOP_MIN_WIDTH: the side panel opens beside the circle. */
export const deviceFor = (width: number): Device => width >= DESKTOP_MIN_WIDTH ? 'desktop' : 'phone';

/** The message a state shows at the top of the floor; the screen decides how long it stays. */
export const stateToast = (state: GameScreenState): CopyId | undefined => COMPOSITIONS[state].toast;

export function composeGame(state: GameScreenState, device: Device): Composition {
  const composition = COMPOSITIONS[state];
  /* desktop keeps the statement open in the side panel, so the focused critter needs no bubble */
  if (device === 'desktop' && composition.scene.bubbles === 'focus') return { ...composition, scene: { ...composition.scene, bubbles: 'none' } };
  return composition;
}
