import { ShutterSetupError, shutterPreflight } from './deployment/shutter.js';

try {
  if (process.argv.length !== 2) throw new Error('check-shutter takes no arguments');
  const required = (name: string) => { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; };
  const result = await shutterPreflight({ mode: required('SHUTTER_MODE'), apiBase: required('SHUTTER_API_BASE'), rpcUrl: required('SHUTTER_RPC_URL'), registry: required('SHUTTER_REGISTRY_ADDRESS'), keyBroadcast: required('SHUTTER_KEY_BROADCAST_ADDRESS'), registrant: required('SHUTTER_REGISTRANT_ADDRESS'), ...(process.env.SHUTTER_API_KEY ? { apiKey: process.env.SHUTTER_API_KEY } : {}) });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  if (error instanceof ShutterSetupError) console.error(error.message);
  console.error('Shutter preflight failed. Check the required settings, mainnet authentication and API/chain key consistency. Transport details are suppressed to protect credentials; see docs/build/deployment.md. No identity was registered.');
  process.exitCode = 1;
}
