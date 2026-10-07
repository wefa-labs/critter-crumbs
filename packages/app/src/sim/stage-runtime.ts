import { critterVersion } from '../portraits/version.js';
import type { World } from 'koota';
import { Asleep, Identity, Mesh, Clock, Settings, createWorld, type WorldOptions, type GameSettings } from '../world/index.js';
import { renderPortraits } from '../portraits/index.js';
import { createTickerHost } from './ticker-host.js';
export function createStageRuntime(options: WorldOptions) {
  const frames = new Set<(now: number) => void>();
  let alive = true;
  const disposers = new Set<() => void>();
  let renderer: ((world: World) => void) | undefined, idleMotion = true;
  const game = createWorld({ critterVersion, ...options, outputs: { ...options.outputs, render2d: renderPortraits, render3d: world => renderer?.(world), hop: cue => { if (cue.from === 'feast' || !game.critters.some(entity => entity.get(Identity)!.id === cue.to && entity.has(Mesh))) options.outputs?.hop?.(cue); } } });
  let activeInput = false, animatedUntil = 0;
  const ticker = createTickerHost({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), stopInput: () => { activeInput = false; if (alive) { game.actions.suspend(); game.tick(game.world.get(Clock)!.now); } }, tick: now => {
    game.tick(now); for (const frame of frames) frame(now);
    const settings = game.world.get(Settings)!;
    if ((settings.still || settings.reducedMotion || !idleMotion || game.critters.every(entity => entity.has(Asleep))) && !activeInput && !game.isAnimating() && now >= animatedUntil) ticker.setMode('demand');
  } });
  return { ...game, ticker, get alive() { return alive; },
    onDestroy(dispose: () => void) { disposers.add(dispose); return () => { disposers.delete(dispose); }; },
    attach3d(draw: (world: World) => void) { renderer = draw; return () => { if (renderer === draw) renderer = undefined; }; },
    setIdleMotion(value: boolean) { idleMotion = value; game.actions.setIdleMotion(value); ticker.setMode('continuous'); ticker.invalidate(); },
    start() {
      const hidden = () => ticker.setHidden(document.hidden), blur = () => { activeInput = false; game.actions.stopPour(); ticker.invalidate(); };
      document.addEventListener('visibilitychange', hidden); window.addEventListener('blur', blur); hidden(); ticker.setMode('continuous');
      return () => { document.removeEventListener('visibilitychange', hidden); window.removeEventListener('blur', blur); };
    },
    onFrame(callback: (now: number) => void) { frames.add(callback); return () => { frames.delete(callback); }; },
    animateFor(milliseconds: number) { animatedUntil = Math.max(animatedUntil, game.world.get(Clock)!.now + milliseconds); ticker.setMode('continuous'); },
    input(held: boolean) { activeInput = held; ticker.setMode('continuous'); ticker.invalidate(); },
    setSettings(settings: GameSettings) { game.actions.setSettings(settings); ticker.setMode('continuous'); ticker.invalidate(); },
    destroy() { if (!alive) return; ticker.destroy(); for (const dispose of disposers) dispose(); disposers.clear(); frames.clear(); alive = false; game.destroy(); },
  };
}
export type StageRuntime = ReturnType<typeof createStageRuntime>;
