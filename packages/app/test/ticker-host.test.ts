import { expect, test } from 'vitest';
import { createTickerHost } from '../src/sim/ticker-host.js';
import { readSettings, saveSetting } from '../src/sim/settings.js';

test('one host handles demand, continuous, hidden pause, ownership transfer and cleanup', () => {
  const pending = new Map<number, FrameRequestCallback>(), ticks: number[] = [];
  let next = 0, stops = 0;
  const host = createTickerHost({ request: callback => { pending.set(++next, callback); return next; }, cancel: id => { pending.delete(id); }, tick: now => ticks.push(now), stopInput: () => { stops++; } });
  const frame = (now: number) => { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(now)); };
  host.invalidate(); host.invalidate(); expect(pending.size).toBe(1);
  frame(100); expect(ticks).toEqual([0]); expect(pending.size).toBe(0);
  host.setMode('continuous'); frame(116); frame(132); expect(ticks).toEqual([0, 16, 32]);
  host.setHidden(true); expect(pending.size).toBe(0); expect(stops).toBe(1);
  host.setHidden(false); frame(100000); expect(ticks.at(-1)).toBe(32);
  host.setOwner('three'); expect(pending.size).toBe(0);
  host.frame(100016, 'raf'); expect(ticks.at(-1)).toBe(32);
  host.frame(100016, 'three'); host.frame(100032, 'three'); expect(ticks.at(-1)).toBe(64);
  host.setOwner('raf'); frame(100048); expect(ticks.at(-1)).toBe(80);
  host.destroy(); expect(pending.size).toBe(0);
  host.invalidate(); host.frame(100064, 'raf'); expect(ticks.at(-1)).toBe(80);
});
test('settings survive storage failure and OS reduced motion always applies', () => {
  const values = new Map([['cc.sound.effects', '0'], ['cc.view.simple', '1']]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  expect(readSettings(storage, true)).toEqual({ effects: false, ambience: false, still: false, simple: true, reducedMotion: true });
  saveSetting(storage, 'still', true); expect(values.get('cc.motion.still')).toBe('1');
  const broken = { getItem: () => { throw Error(); }, setItem: () => { throw Error(); } };
  expect(readSettings(broken, false).effects).toBe(true);
  expect(() => saveSetting(broken, 'effects', false)).not.toThrow();
});

test('dropped visible frames preserve animation elapsed time while the world owns dt clamping', () => {
  const ticks: number[] = [];
  const host = createTickerHost({ request: () => 1, cancel() {}, stopInput() {}, tick: now => ticks.push(now) });
  host.frame(0, 'raf'); host.frame(100, 'raf'); host.frame(200, 'raf');
  expect(ticks).toEqual([0, 100, 200]);
  host.setOwner('three'); host.frame(216, 'three');
  expect(ticks.at(-1)).toBe(216);
  host.destroy();
});
