import { useCallback, useEffect, useRef, type PointerEvent } from 'react';
import type { Entity } from 'koota';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { Count, Pile } from '../world/index.js';
import type { StageRuntime } from '../sim/stage-runtime.js';
/** Every pointer surface and button uses the same queued action/release path. */
export function useScatterInput(entity: Entity, runtime: StageRuntime, name: string, announce: (text: string) => void) {
  const held = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const say = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => announce(formatCopy('scatter.count.announce', { n: entity.get(Count)!.given, name, remaining: runtime.heap.get(Pile)!.remaining })), 250); }, [entity, runtime, name, announce]);
  const stop = useCallback(() => { if (!held.current) return; held.current = false; runtime.actions.stopPour(); runtime.input(false); runtime.animateFor(320); say(); }, [runtime, say]);
  const start = (direction: 1 | -1) => { if (held.current) return; held.current = true; runtime.actions.startPour(entity, direction); runtime.input(true); if (direction > 0 && !runtime.heap.get(Pile)!.remaining) announce(copy['scatter.none.left']); };
  const tap = (direction: 1 | -1) => { if (direction > 0) runtime.actions.giveCrumb(entity); else runtime.actions.takeCrumb(entity); runtime.animateFor(320); say(); };
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); }; document.addEventListener('visibilitychange', hidden); window.addEventListener('blur', stop);
    return () => { document.removeEventListener('visibilitychange', hidden); window.removeEventListener('blur', stop); if (timer.current) clearTimeout(timer.current); };
  }, [stop]);
  const move = (event: PointerEvent<HTMLElement>) => { const bounds = event.currentTarget.getBoundingClientRect(); if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) stop(); };
  return { start, stop, tap, say, held, move };
}
