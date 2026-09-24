export type TickMode = 'continuous' | 'demand' | 'paused';
export type TickOwner = 'raf' | 'three';
interface HostOptions { tick: (now: number) => void; stopInput: () => void; request: (callback: FrameRequestCallback) => number; cancel: (id: number) => void }

/** One active owner, with hidden time excluded from the simulation clock. */
export function createTickerHost(options: HostOptions) {
  let mode: TickMode = 'demand', owner: TickOwner = 'raf', hidden = false, visible = true, destroyed = false;
  let renderer: { invalidate: () => void; setMode: (mode: TickMode) => void } | undefined;
  const effectiveMode = () => hidden || !visible || destroyed ? 'paused' : mode;
  const sync = () => renderer?.setMode(effectiveMode());
  let pending: number | undefined, previous: number | undefined, now = 0;
  function cancel() { if (pending !== undefined) options.cancel(pending); pending = undefined; }
  function invalidate() {
    if (effectiveMode() === 'paused') return;
    if (owner === 'three') { renderer?.invalidate(); return; }
    if (pending !== undefined) return;
    pending = options.request(timestamp => { pending = undefined; frame(timestamp, 'raf'); });
  }
  function frame(timestamp: number, source: TickOwner) {
    if (effectiveMode() === 'paused' || source !== owner) return;
    if (!Number.isFinite(timestamp) || (previous !== undefined && timestamp < previous)) throw new RangeError('Invalid frame time');
    if (previous !== undefined) now += timestamp - previous;
    previous = timestamp;
    options.tick(now);
    if (mode === 'continuous') invalidate();
  }
  function setMode(next: TickMode) {
    if (next === mode) return;
    mode = next;
    if (next === 'paused') { cancel(); previous = undefined; options.stopInput(); }
    else invalidate();
    sync();
  }
  function setOwner(next: TickOwner) {
    if (next === owner) return;
    cancel(); owner = next; invalidate();
  }
  function setHidden(value: boolean) {
    if (value === hidden) return;
    hidden = value; previous = undefined;
    if (value) { cancel(); options.stopInput(); } else invalidate();
    sync();
  }
  function setVisible(value: boolean) {
    if (visible === value) return; visible = value; previous = undefined;
    if (!value) { cancel(); options.stopInput(); } else invalidate(); sync();
  }
  function connectThree(next: NonNullable<typeof renderer>) {
    renderer = next; setOwner('three'); sync(); invalidate();
    return () => { if (renderer !== next) return; renderer = undefined; setOwner('raf'); };
  }
  function destroy() { if (destroyed) return; destroyed = true; cancel(); options.stopInput(); sync(); }
  return { invalidate, frame, setMode, setOwner, setHidden, setVisible, connectThree, mode: effectiveMode, destroy };
}

/** Browser boundary for context events that arrive between animation frames. */
export const readAnimationTime = () => performance.now();
