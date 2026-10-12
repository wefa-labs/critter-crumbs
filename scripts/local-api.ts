import { parseDevEndpointsEnabled } from '@critter-crumbs/shared';
import { createServer } from 'node:http';
import { schemaUID, ballotSchema, type EasConfig } from '@critter-crumbs/core';
import { createApi } from '@critter-crumbs/api';
import { nodeHandler } from '@critter-crumbs/api';
import { createServerClock } from '@critter-crumbs/api';
import { mockServerTimelock } from '@critter-crumbs/api';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { createLocalResultChain, type LocalResultTransaction } from './local-result-chain.js';
import { localData } from './local-data.js';
import { createLocalShutterTimelock } from './local-shutter.js';
const data = await localData(), clock = createServerClock(data.offset, data.saveOffset);
// LOCAL_TIMELOCK=shutter puts local keypers with real keys in Shutter's place, so a production build, which never
// uses the mock, can run a whole feast offline. The default is the mock the development build rehearses on.
const timelock = process.env.LOCAL_TIMELOCK === 'shutter'
  ? createLocalShutterTimelock({ secret: data.mockSecret, clock: clock.now, async lookup(identity) {
    const [row] = await data.db.query('select id,scattering_ends_at from feasts where shutter_identity=$1', [Buffer.from(identity.slice(2), 'hex')]);
    return row ? { feastId: String(row.id), decryptionTimestamp: new Date(row.scattering_ends_at as string | number | Date).getTime() } : null;
  } })
  : mockServerTimelock(data.db, clock.now, data.mockSecret);
const eas: EasConfig = { chainId: 84532, address: '0x4200000000000000000000000000000000000021', ballotSchemaUid: schemaUID(ballotSchema) };
const resultPath=join(data.directory,'result-transactions.json');
let records:LocalResultTransaction[]=[];
try { records=JSON.parse(await readFile(resultPath,'utf8')) as LocalResultTransaction[]; } catch(error) { if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error; }
const localChain=createLocalResultChain({clock:clock.now,records,save:async value=>{const temporary=resultPath+'.pending';await writeFile(temporary,JSON.stringify(value),{mode:0o600});await rename(temporary,resultPath);}});
const api = createApi({ db: data.db, clock: clock.now, sessionSecret: data.sessionSecret, timelock, eas, resultReader:localChain.reader, origin: process.env.APP_ORIGIN || 'http://127.0.0.1:5173',
  dev: { recordTransaction:localChain.send, enabled: parseDevEndpointsEnabled(process.env.DEV_ENDPOINTS_ENABLED), production: false, mode: 'mock', setTime: clock.setTime, releaseKey: timelock.release } });
const port = Number(process.env.LOCAL_API_PORT || '3000');
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('LOCAL_API_PORT must be between 1024 and 65535');
const server = createServer(nodeHandler(api, clock.now));
server.listen(port, '127.0.0.1', () => console.log(`Mock API: http://127.0.0.1:${port}; persistent data:`, data.directory));
let stopping = false;
const stop = () => { if (stopping) return; stopping = true; server.close(() => { void data.db.close().then(() => process.exit()); }); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
server.on('error', error => { console.error(error.message); void data.db.close().then(() => { process.exitCode = 1; }); });
