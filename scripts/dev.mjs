import { spawn } from 'node:child_process';

const env = { ...process.env, SHUTTER_MODE: process.env.SHUTTER_MODE ?? 'mock', VERCEL_TELEMETRY_DISABLED: '1' };
const functions = spawn('vercel', ['dev', '--listen', '3000'], { stdio: 'inherit', env });
const app = spawn('vite', ['--config', 'packages/app/vite.config.ts'], { stdio: 'inherit', env });
const stop = () => { functions.kill(); app.kill(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of [functions, app]) {
  child.on('error', (error) => { console.error(error.message); process.exitCode = 1; stop(); });
  child.on('exit', (code, signal) => { if (!signal) { process.exitCode = code ?? 1; stop(); } });
}
