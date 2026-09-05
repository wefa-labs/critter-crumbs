import { spawn } from 'node:child_process';

const env = { ...process.env, SHUTTER_MODE: process.env.SHUTTER_MODE ?? 'mock', VERCEL_TELEMETRY_DISABLED: '1' };
const commands = [
  ['tsc', ['-b', '--watch', '--preserveWatchOutput']],
  ['vite', ['--config', 'packages/app/vite.config.ts']],
];
if (!process.argv.includes('--app-only')) commands.push(['vercel', ['dev', '--listen', '3000']]);
const children = commands.map(([command, args]) => spawn(command, args, { stdio: 'inherit', env }));
const stop = () => { for (const child of children) child.kill(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of children) {
  child.on('error', (error) => { console.error(error.message); process.exitCode = 1; stop(); });
  child.on('exit', (code, signal) => { if (!signal) { process.exitCode = code ?? 1; stop(); } });
}
