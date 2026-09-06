import { createServer } from 'vite';
const apiPort = process.env.LOCAL_API_PORT || '3000';
const server = await createServer({ configFile: 'packages/app/vite.config.ts', server: { proxy: { '/api': `http://127.0.0.1:${apiPort}` } } });
await server.listen(); server.printUrls();
const stop = () => { void server.close().then(() => process.exit()); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
