import type { CopyId } from '@critter-crumbs/shared';
import type { GameScreenState } from '../app/feast-view.js';
import type { MusicTrack } from '../audio/assets.js';
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
  /** At the feast everyone grows, so the circle's spots shrink to make room. */
  grown: boolean;
  bubbles: 'none' | 'focus' | 'all';
  tags: boolean;
  piles: boolean;
  heap: 'none' | 'remaining';
  huddle: boolean;
  /** The focus row's − and +: live, dimmed and stopped once scattering has closed, or not there at all. */
  controls: 'none' | 'live' | 'disabled';
}

export interface Composition {
  surface: Surface;
  scene: SceneTreatment;
  /** The music under the moment (docs/explorations/sound-direction-2026-10.md); quiet from dusk until the feast plays its own cue. */
  music: MusicTrack | null;
  /** A passing message at the top of the floor. */
  toast?: CopyId;
}

const scattering: SceneTreatment = { scene: 'window', light: 'day', mood: 'awake', ownAsleep: true, grown: false, bubbles: 'focus', tags: true, piles: true, heap: 'remaining', huddle: false, controls: 'live' };
const sleeping: SceneTreatment = { scene: 'dusk', light: 'day', mood: 'asleep', ownAsleep: true, grown: false, bubbles: 'none', tags: false, piles: false, heap: 'remaining', huddle: false, controls: 'none' };
const gathered: SceneTreatment = { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, grown: true, bubbles: 'none', tags: false, piles: false, heap: 'none', huddle: true, controls: 'none' };

const COMPOSITIONS: Record<GameScreenState, Composition> = {
  /* flow 34 */
  reveal: { surface: { kind: 'sheet', height: 230 }, scene: { scene: 'window', light: 'day', mood: 'delighted', ownAsleep: true, grown: false, bubbles: 'all', tags: false, piles: false, heap: 'none', huddle: false, controls: 'none' }, music: 'feeding' },
  /* scatter page: #scatter, #reading, #done, #scattered */
  scatter: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding' },
  reading: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding' },
  done: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding' },
  /* flow 36–40: the dock moments; confirming is a dialog over the dock */
  signing: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding' },
  saving: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding' },
  scattered: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding', toast: 'err.saveVerified' },
  rejected: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding', toast: 'scatter.sign.rejected' },
  failed: { surface: { kind: 'dock' }, scene: scattering, music: 'feeding', toast: 'err.saveFailed' },
  /* flow 41; the dusk sting plays as the music stops */
  closed: { surface: { kind: 'dock' }, scene: { ...scattering, scene: 'dusk', mood: 'asleep', bubbles: 'none', controls: 'disabled' }, music: null },
  /* flow 42, 43 */
  waiting: { surface: { kind: 'sheet', height: 250 }, scene: sleeping, music: null },
  key: { surface: { kind: 'sheet', height: 250 }, scene: sleeping, music: null },
  /* flow 44; the feast heap stays while the crumbs fly from it (Game Design G6), though the flow page's still omits it.
     The feast plays its own cue on the effects bus. */
  feast: { surface: { kind: 'sheet', height: 144 }, scene: { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, grown: true, bubbles: 'none', tags: false, piles: true, heap: 'remaining', huddle: false, controls: 'none' }, music: null },
  /* scatter page #feast with Results closed: everyone grown, the totals on their tags, Results in the bar */
  feasted: { surface: { kind: 'dock' }, scene: { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, grown: true, bubbles: 'focus', tags: true, piles: false, heap: 'none', huddle: false, controls: 'none' }, music: 'full' },
  /* flow 45 */
  nobody: { surface: { kind: 'sheet', height: 260 }, scene: { scene: 'window', light: 'day', mood: 'awake', ownAsleep: false, grown: false, bubbles: 'none', tags: false, piles: false, heap: 'none', huddle: false, controls: 'none' }, music: 'full' },
  /* scatter page #feast with Results open; flow 46–50 give each variant's contents */
  results: { surface: { kind: 'results' }, scene: gathered, music: 'full' },
  tie: { surface: { kind: 'results' }, scene: gathered, music: 'full' },
  givers: { surface: { kind: 'results' }, scene: gathered, music: 'full' },
  recording: { surface: { kind: 'results' }, scene: gathered, music: 'full' },
  recorded: { surface: { kind: 'results' }, scene: gathered, music: 'full' },
  public: { surface: { kind: 'results' }, scene: gathered, music: 'full' },
};

/** Desktop from DESKTOP_MIN_WIDTH: the side panel opens beside the circle. */
export const deviceFor = (width: number): Device => width >= DESKTOP_MIN_WIDTH ? 'desktop' : 'phone';

/** The message a state shows at the top of the floor; the screen decides how long it stays. */
export const stateToast = (state: GameScreenState): CopyId | undefined => COMPOSITIONS[state].toast;
/** Whether a state's − and + are live, dimmed or absent (the same on every device). */
export const stateControls = (state: GameScreenState): SceneTreatment['controls'] => COMPOSITIONS[state].scene.controls;

export function composeGame(state: GameScreenState, device: Device): Composition {
  const composition = COMPOSITIONS[state];
  /* desktop keeps the statement open in the side panel, so the focused critter needs no bubble */
  if (device === 'desktop' && composition.scene.bubbles === 'focus') return { ...composition, scene: { ...composition.scene, bubbles: 'none' } };
  return composition;
}
