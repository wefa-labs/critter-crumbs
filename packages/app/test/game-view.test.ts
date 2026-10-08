import { expect, test } from 'vitest';
import { gameView, readPath, readingAt, scatterFailureOf } from '../src/app/feast-view.js';
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

test('a failed confirmation becomes a screen state only for the designed moments; the app keeps its own notices',()=>{
 /* flow 39–41: closed, declined, and a save that could not be made */
 expect(scatterFailureOf('scatter.closed',400)).toBe('closed');
 expect(scatterFailureOf('scatter.sign.rejected',400)).toBe('rejected');
 for(const [id,status] of [['err.storeUnreachable',503],['err.generic',500],[undefined,undefined]] as const)expect(scatterFailureOf(id,status)).toBe('failed');
 /* a scatter saved but not yet confirmed is not a failure, and a reconnect or a notice the app owns leaves the screen as it was */
 for(const [id,status] of [['err.saveUnverified',0],['err.notParticipant',403],['scatter.submit.help',undefined],['scatter.sign.rejected',401],['err.sessionExpired',401]] as const)expect(scatterFailureOf(id,status)).toBeUndefined();
});

test('a bubble on the reveal opens its own critter’s statement; anything else opens the first',()=>{
 expect(readPath('f1')).toBe('/feasts/f1/read');
 expect(readPath('f1',3)).toBe('/feasts/f1/read?at=3');
 expect(readingAt('?at=3',8)).toBe(3);
 for(const search of ['','?at=8','?at=-1','?at=2.5','?at=x'])expect(readingAt(search,8)).toBe(0);
});
