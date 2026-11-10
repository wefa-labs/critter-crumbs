import { describe, expect, it } from 'vitest';
import { retryOnce } from '../src/app/lazy-screen.js';

/* A screen's code arrives after the page (app.tsx, feast.tsx). A request lost on a poor connection is asked for once
   more; a file that is gone for good, as in a tab opened before a new deployment, is left to the notice with Reload
   (QA production-build-06). */
describe('a screen whose code does not arrive', () => {
  const lost = () => new TypeError('Failed to fetch dynamically imported module: https://www.crittercrumbs.app/assets/feast-CUd-UygC.js');

  it('is asked for once more when the first request is lost, and then arrives', async () => {
    const answers = [() => Promise.reject(lost()), () => Promise.resolve('feast screen')];
    let asked = 0;
    await expect(retryOnce(() => answers[asked++]!())).resolves.toBe('feast screen');
    expect(asked).toBe(2);
  });

  it('is asked for twice at most, so a file that is gone for good cannot keep the page asking', async () => {
    let asked = 0;
    await expect(retryOnce(() => { asked++; return Promise.reject(lost()); })).rejects.toBeInstanceOf(TypeError);
    expect(asked).toBe(2);
  });

  it('is not asked for again when its stylesheet did not load: Vite would not fetch it twice and the screen would be drawn without it', async () => {
    // Vite's preload helper rejects with this error after marking the stylesheet as seen (vite 7.3, preload())
    let asked = 0;
    const stylesheet = () => { asked++; return Promise.reject(new Error('Unable to preload CSS for https://www.crittercrumbs.app/assets/feast-Dq0TYWJB.css')); };
    await expect(retryOnce(stylesheet)).rejects.toThrow('Unable to preload CSS');
    expect(asked).toBe(1);
  });
});
