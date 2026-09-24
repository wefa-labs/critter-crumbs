import { FLIGHT, RENDER_BUDGET, type CopyId } from '@critter-crumbs/shared';
export interface RenderPolicyState {
  phase: 'loading' | 'active' | 'lost' | 'fallback';
  tier: number; dpr: number; idle: boolean; antialias: boolean; crumbLimit: number;
  notice: CopyId | null; retryAvailable: boolean;
}
/** Session-scoped rendering decisions. Frame samples and context deadlines are injected. */
export function createRenderPolicy(initialDpr: number) {
  let state: RenderPolicyState = { phase: 'loading', tier: 0, dpr: initialDpr, idle: true, antialias: true, crumbLimit: FLIGHT.maxAlive, notice: null, retryAvailable: true };
  let slowSince: number | undefined, lostAt: number | undefined, announced = false, wasActive = false;
  const listeners = new Set<() => void>();
  const change = (patch: Partial<RenderPolicyState>) => { state = { ...state, ...patch }; for (const listener of listeners) listener(); };
  function fallback(notice: CopyId) { slowSince = undefined; change({ phase: 'fallback', notice }); }
  return {
    snapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    pause() { slowSince = undefined; },
    ready() { if (state.phase === 'fallback') return; wasActive = true; lostAt = undefined; slowSince = undefined; change({ phase: 'active', notice: null }); },
    failed() { fallback(wasActive ? 'fallback.midSession' : 'fallback.initial'); },
    lost(now: number) { if (state.phase !== 'active') return; lostAt = now; slowSince = undefined; change({ phase: 'lost' }); },
    check(now: number) { if (state.phase === 'lost' && lostAt !== undefined && now - lostAt >= RENDER_BUDGET.restoreMs) fallback('fallback.midSession'); },
    restored(now: number) { this.check(now); if (state.phase === 'lost') this.ready(); },
    retry() { if (state.phase !== 'fallback' || !state.retryAvailable) return false; lostAt = undefined; slowSince = undefined; change({ phase: 'loading', tier: 0, dpr: initialDpr, idle: true, antialias: true, crumbLimit: FLIGHT.maxAlive, notice: null, retryAvailable: false }); return true; },
    sample(now: number, frameMs: number) {
      if (state.phase !== 'active') return;
      const threshold = state.tier === 0 ? RENDER_BUDGET.slowFrameMs : RENDER_BUDGET.verySlowFrameMs, duration = RENDER_BUDGET.degradeMs[state.tier]!;
      if (frameMs <= threshold) { slowSince = undefined; return; }
      slowSince ??= now;
      if (now - slowSince < duration) return;
      slowSince = undefined;
      if (state.tier === 0) change({ tier: 1, dpr: 1, idle: false });
      else if (state.tier === 1) change({ tier: 2, antialias: false, crumbLimit: RENDER_BUDGET.degradedCrumbs });
      else fallback('fallback.midSession');
    },
    takeAnnouncement() { if (state.notice !== 'fallback.midSession' || announced) return null; announced = true; return state.notice; },
  };
}
