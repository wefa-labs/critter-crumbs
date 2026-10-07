import { expect, test } from 'vitest';
import { gameView } from '../src/app/feast-view.js';
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
