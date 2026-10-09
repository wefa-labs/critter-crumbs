import { describe, expect, it } from 'vitest';
import { composeGame, deviceFor, stateControls, stateToast } from '../src/game/composition.js';

/* Expected values are read off the review pages, never off the app: the flow page's SCREENS
   (docs/explorations/app-screens/index.html) and the scatter page, pass eleven
   (docs/explorations/scatter-layouts/index.html). */
describe('core game compositions', () => {
  it('opens statements on a 230 px sheet, every critter but yours awake and thinking, nothing to give yet', () => {
    expect(composeGame('reveal', 'phone')).toEqual({
      surface: { kind: 'sheet', height: 230 },
      scene: { scene: 'window', light: 'day', mood: 'delighted', ownAsleep: true, grown: false, bubbles: 'all', tags: false, piles: false, heap: 'none', huddle: false, controls: 'none' },
      music: 'feeding',
    });
  });

  /* docs/explorations/sound-direction-2026-10.md, the settled set: Feeding time while scattering, quiet from dusk while
     the feast is laid out (the feast plays its own cue), Everyone is full after it */
  it('names each moment’s music: feeding time while scattering, quiet from dusk to the feast, everyone is full after', () => {
    for (const device of ['phone', 'desktop'] as const) {
      for (const state of ['reveal', 'scatter', 'reading', 'done', 'signing', 'saving', 'scattered', 'rejected', 'failed'] as const) expect(composeGame(state, device).music).toBe('feeding');
      for (const state of ['closed', 'waiting', 'key', 'feast'] as const) expect(composeGame(state, device).music).toBeNull();
      for (const state of ['feasted', 'nobody', 'results', 'tie', 'givers', 'recording', 'recorded', 'public'] as const) expect(composeGame(state, device).music).toBe('full');
    }
  });

  it('scatters on the dock with the heap, piles and tags; the bubble is the phone’s, the desktop panel always reads', () => {
    const scattering = { scene: 'window', light: 'day', mood: 'awake', ownAsleep: true, grown: false, tags: true, piles: true, heap: 'remaining', huddle: false, controls: 'live' };
    for (const state of ['scatter', 'reading', 'done', 'scattered', 'signing', 'saving', 'rejected', 'failed'] as const) {
      expect(composeGame(state, 'phone')).toMatchObject({ surface: { kind: 'dock' }, scene: { ...scattering, bubbles: 'focus' } });
      expect(composeGame(state, 'desktop')).toMatchObject({ surface: { kind: 'dock' }, scene: { ...scattering, bubbles: 'none' } });
    }
  });

  it('reports a saved scatter, a decline or a failed save as a toast over the kept allocation', () => {
    expect(stateToast('scattered')).toBe('err.saveVerified');
    expect(stateToast('rejected')).toBe('scatter.sign.rejected');
    expect(stateToast('failed')).toBe('err.saveFailed');
    for (const state of ['scatter', 'reading', 'done', 'signing', 'saving', 'closed'] as const) expect(stateToast(state)).toBeUndefined();
  });

  it('closes scattering at dusk with every critter asleep and the giving controls dimmed', () => {
    expect(composeGame('closed', 'phone')).toEqual({
      surface: { kind: 'dock' },
      scene: { scene: 'dusk', light: 'day', mood: 'asleep', ownAsleep: true, grown: false, bubbles: 'none', tags: true, piles: true, heap: 'remaining', huddle: false, controls: 'disabled' },
      music: null,
    });
    expect(stateControls('closed')).toBe('disabled');
    expect(stateControls('saving')).toBe('live');
    expect(stateControls('feasted')).toBe('none');
  });

  it('lays out the feast on a 250 px sheet over the sleeping dusk circle, with no dock', () => {
    for (const state of ['waiting', 'key'] as const) expect(composeGame(state, 'phone')).toEqual({
      surface: { kind: 'sheet', height: 250 },
      scene: { scene: 'dusk', light: 'day', mood: 'asleep', ownAsleep: true, grown: false, bubbles: 'none', tags: false, piles: false, heap: 'remaining', huddle: false, controls: 'none' },
      music: null,
    });
  });

  it('plays the feast on a 144 px sheet in feast light, each woken critter beside what it received', () => {
    /* the feast heap stays while crumbs fly from it (Game Design G6); the flow page's still frame leaves it out */
    expect(composeGame('feast', 'phone')).toEqual({
      surface: { kind: 'sheet', height: 144 },
      scene: { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, grown: true, bubbles: 'none', tags: false, piles: true, heap: 'remaining', huddle: false, controls: 'none' },
      music: null,
    });
  });

  it('folds the results back into the bar: everyone grown with totals on their tags, statements still a bubble away', () => {
    /* the scatter page's #feast with Results closed */
    expect(composeGame('feasted', 'phone')).toEqual({
      surface: { kind: 'dock' },
      scene: { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, grown: true, bubbles: 'focus', tags: true, piles: false, heap: 'none', huddle: false, controls: 'none' },
      music: 'full',
    });
    expect(composeGame('feasted', 'desktop').scene.bubbles).toBe('none');
  });

  it('opens the side panel from 900 px wide', () => {
    expect([375, 430, 899, 900, 1280].map(deviceFor)).toEqual(['phone', 'phone', 'phone', 'desktop', 'desktop']);
  });

  it('shows nobody scattered on a 260 px sheet over the awake circle, with nothing to replay', () => {
    expect(composeGame('nobody', 'phone')).toEqual({
      surface: { kind: 'sheet', height: 260 },
      scene: { scene: 'window', light: 'day', mood: 'awake', ownAsleep: false, grown: false, bubbles: 'none', tags: false, piles: false, heap: 'none', huddle: false, controls: 'none' },
      music: 'full',
    });
  });

  it('grows every result into the results surface with the critters huddled on its edge', () => {
    for (const state of ['results', 'tie', 'givers', 'recording', 'recorded', 'public'] as const) expect(composeGame(state, 'desktop')).toEqual({
      surface: { kind: 'results' },
      scene: { scene: 'window', light: 'feast', mood: 'delighted', ownAsleep: false, grown: true, bubbles: 'none', tags: false, piles: false, heap: 'none', huddle: true, controls: 'none' },
      music: 'full',
    });
  });
});
