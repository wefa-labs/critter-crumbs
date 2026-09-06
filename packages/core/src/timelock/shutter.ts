import { shutterRegistration, type ShutterServerConfig } from './shutter-registration.js';
export type { ShutterAttempt, ShutterDeployment, ShutterServerConfig, RegistrationJournal } from './shutter-registration.js';
import type { Timelock } from './index.js';
import { shutterCrypto, type ShutterSDK } from './shutter-crypto.js';
export type { ShutterSDK } from './shutter-crypto.js';
import { hexToBytes } from 'viem';
import { hex, integer, record } from '@critter-crumbs/shared';
export type ShutterMode = 'chiado' | 'mainnet';
export class ShutterError extends Error {
  constructor(readonly reason: 'unregistered' | 'pending' | 'rate_limited' | 'upstream' | 'invalid_response' | 'configuration', readonly retryAfter?: string | null) { super(reason); }
}
export interface ShutterConfig { apiBase?: string; server?: ShutterServerConfig; fetch?: typeof fetch; sdk?: () => Promise<ShutterSDK>; random?: (length: number) => Uint8Array }
const origins = { chiado: 'https://shutter-api.chiado.staging.shutter.network', mainnet: 'https://shutter-api.shutter.network' };
function createShutterTimelock(mode: ShutterMode, config: ShutterConfig): Timelock {
  const transport = config.fetch ?? globalThis.fetch;
  const url = new URL(config.apiBase ?? origins[mode]);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new ShutterError('configuration');
  const apiOrigin = url.origin;
  return {
    ...shutterCrypto(config.sdk, config.random),
    register: config.server ? shutterRegistration({ mode, chainId: mode === 'chiado' ? 10200 : 100, apiOrigin, registry: config.server.registry, keyBroadcast: config.server.keyBroadcast, registrant: config.server.registrant }, config.server, transport, config.random) : async () => { throw new ShutterError('configuration'); },
    async getKey(identity: string): Promise<Uint8Array | null> {
      const normalized = hex(identity, 32);
      let response: Response;
      try { response = await transport(`${apiOrigin}/api/time/get_decryption_key?identity=${normalized}`, { credentials: 'omit', signal: AbortSignal.timeout(10000), headers: config.server?.apiKey ? { Authorization: `Bearer ${config.server.apiKey}` } : {} }); }
      catch { throw new ShutterError('upstream'); }
      if (response.status === 429) throw new ShutterError('rate_limited', response.headers.get('Retry-After'));
      let body: Record<string, unknown>;
      try { body = record(await response.json()); } catch { throw new ShutterError(response.ok ? 'invalid_response' : 'upstream'); }
      if (response.ok) {
        try {
          const message = record(body.message);
          if (hex(message.identity, 32) !== normalized) throw new Error();
          integer(message.decryption_timestamp, 0, Number.MAX_SAFE_INTEGER);
          return hexToBytes(hex(message.decryption_key, 48));
        } catch { throw new ShutterError('invalid_response'); }
      }
      if ((response.status === 400 && body.description === 'timestamp not reached yet, decryption key requested too early') || (response.status === 404 && body.description === 'decryption key doesnt exist')) return null;
      if (response.status === 400 && body.description === 'identity has not been registerd yet') throw new ShutterError('unregistered');
      throw new ShutterError('upstream');
    },
  };
}
export const createChiadoTimelock = (config: ShutterConfig = {}) => createShutterTimelock('chiado', config);
export const createMainnetTimelock = (config: ShutterConfig = {}) => createShutterTimelock('mainnet', config);
