import { expect, test } from 'vitest';
import { gameView, readPath, readingAt } from '../src/app/feast-view.js';
test('only a complete editable scatter offers signing, and a saved scatter keeps its receipt state',()=>{
 expect(gameView({phase:'scattering',remaining:1,receipt:true,dirty:true}).state).toBe('scatter');
 expect(gameView({phase:'scattering',remaining:0,receipt:false}).state).toBe('done');
 expect(gameView({phase:'scattering',remaining:0,receipt:true,dirty:false})).toMatchObject({state:'scattered',editable:true});
 expect(gameView({phase:'feast',remaining:0,receipt:true,signing:true})).toMatchObject({state:'waiting',editable:false});
});

test('closing stops edits and saving takes precedence over a pending confirmation',()=>{
 expect(gameView({phase:'scattering',remaining:0,signing:true,saving:true})).toMatchObject({state:'saving'});
 expect(gameView({phase:'scattering',remaining:0,failure:'closed'})).toMatchObject({state:'closed',editable:false});
 expect(gameView({phase:'feast',remaining:0,keyPending:true})).toMatchObject({state:'key',editable:false});
 expect(gameView({phase:'feast',remaining:0,opened:true,playing:true,resultState:'nobody'}).state).toBe('feast');
 expect(gameView({phase:'feast',remaining:0,opened:true,playing:false,resultState:'nobody'}).state).toBe('nobody');
});

test('closing the results folds them into the bar, except when nobody scattered and there is nothing to fold',()=>{
 expect(gameView({phase:'feast',remaining:0,opened:true,playing:false,resultsOpen:false}).state).toBe('feasted');
 expect(gameView({phase:'feast',remaining:0,opened:true,playing:false,resultsOpen:true}).state).toBe('results');
 expect(gameView({phase:'feast',remaining:0,opened:true,playing:false,resultsOpen:false,resultState:'nobody'}).state).toBe('nobody');
 expect(gameView({phase:'feast',remaining:0,opened:true,playing:true,resultsOpen:false}).state).toBe('feast');
});

test('a bubble on the reveal opens its own critter’s statement; anything else opens the first',()=>{
 expect(readPath('f1')).toBe('/feasts/f1/read');
 expect(readPath('f1',3)).toBe('/feasts/f1/read?at=3');
 expect(readingAt('?at=3',8)).toBe(3);
 for(const search of ['','?at=8','?at=-1','?at=2.5','?at=x'])expect(readingAt(search,8)).toBe(0);
});
