import { expect, test } from 'vitest';
import { createTickerHost } from '../src/sim/ticker-host.js';
test('a renderer takes ownership, receives invalidations and releases back without resetting the world',()=>{
 const ticks:number[]=[],modes:string[]=[];let requests=0,invalidations=0;
 const host=createTickerHost({request:()=>++requests,cancel(){},stopInput(){},tick:now=>ticks.push(now)});
 host.frame(100,'raf');const release=host.connectThree({invalidate:()=>{invalidations++;},setMode:mode=>modes.push(mode)});
 host.invalidate();expect(invalidations).toBeGreaterThan(0);host.frame(116,'three');expect(ticks).toEqual([0,16]);
 host.setMode('continuous');expect(modes.at(-1)).toBe('continuous');host.setVisible(false);expect(modes.at(-1)).toBe('paused');host.frame(5000,'three');expect(ticks).toEqual([0,16]);
 host.setVisible(true);host.frame(5016,'three');expect(ticks.at(-1)).toBe(16);release();host.frame(5032,'raf');expect(ticks.at(-1)).toBe(32);expect(requests).toBeGreaterThan(0);host.destroy();
});

// The runtime seam owns suspension, animation completion, and renderer teardown.
import { vi } from 'vitest';
import { createStageRuntime } from '../src/sim/stage-runtime.js';
import { Bump, Flight, Mesh, type SoundCue } from '../src/world/index.js';
test('offscreen suspension stops a held sound before the final frame is cancelled',()=>{
 vi.stubGlobal('requestAnimationFrame',()=>1);vi.stubGlobal('cancelAnimationFrame',()=>{});
 const cues:SoundCue[]=[];
 const runtime=createStageRuntime({issued:100,critters:[{id:'a',address:`0x${'1'.padStart(40,'0')}`,variant:0,name:'A'}],outputs:{sound:cue=>cues.push(cue)}});
 try {runtime.actions.startPour(runtime.critters[0]!,1);runtime.input(true);for(let now=0;now<=800;now+=16)runtime.ticker.frame(now,'raf');expect(cues.some(c=>c.action==='start')).toBe(true);runtime.ticker.setVisible(false);expect(cues.at(-1)?.action).toBe('stop');expect(runtime.ticker.mode()).toBe('paused');}
 finally {runtime.destroy();vi.unstubAllGlobals();}
});

test('degraded idle completes a crumb flight and its arrival before sleeping',()=>{
 vi.stubGlobal('requestAnimationFrame',()=>1);vi.stubGlobal('cancelAnimationFrame',()=>{});
 const runtime=createStageRuntime({issued:100,critters:[{id:'a',address:`0x${'1'.padStart(40,'0')}`,variant:0,name:'A'}]});
 try {runtime.critters[0]!.add(Mesh(null));runtime.setIdleMotion(false);runtime.actions.giveCrumb(runtime.critters[0]!);runtime.animateFor(320);
 for(let now=0;now<=336;now+=16)runtime.ticker.frame(now,'raf');expect(runtime.world.query(Flight)).toHaveLength(1);expect(runtime.ticker.mode()).toBe('continuous');
 for(let now=352;now<=800;now+=16)runtime.ticker.frame(now,'raf');expect(runtime.world.query(Flight)).toHaveLength(0);expect(runtime.world.query(Bump)).toHaveLength(0);expect(runtime.ticker.mode()).toBe('demand');}
 finally {runtime.destroy();vi.unstubAllGlobals();}
});
