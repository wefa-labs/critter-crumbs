// Captures for QA production-build-07 and production-build-06, from the production bundle, which draws what
// production draws: a feast link with nothing to connect with, Copy link pressed; and a feast link whose screen did
// not arrive (its chunk's request lost every time). At 375 × 812 and 1280 × 800, light and dark, sound off.
//
// Needs `bun run build`, then `vite preview` on the bundle with /api proxied to a local mock API with dev endpoints
// (`bun run dev:local`'s API, or a worktree's own). Run from the repository root:
//   BUNDLE=http://127.0.0.1:4173 mise exec node@22.22.1 -- node docs/reviews/october-qa/fixes/arrival/capture-arrival.mjs
// The browser here has no app to connect with, which is the state production-build-07 is about.
import { readdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const base = process.env.BUNDLE ?? 'http://127.0.0.1:4173';
const here = new URL('./', import.meta.url).pathname;
const feastChunk = readdirSync(new URL('../../../../../dist/assets/', import.meta.url)).find(file => /^feast-.*\.js$/.test(file));
const seeded = await fetch(`${base}/api/dev/seed`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'people', phase: 'gathering' }) });
if (!seeded.ok) throw new Error(`Seeding failed: ${seeded.status}. The API needs its dev endpoints.`);
const feast = (await seeded.json()).feasts[0];
const browser = await chromium.launch();
for (const theme of ['light', 'dark']) for (const [width, height] of [[375, 812], [1280, 800]]) {
  async function capture(name, show) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, permissions: ['clipboard-read', 'clipboard-write'] });
    await context.addInitScript(() => { localStorage.setItem('cc.sound.music', '0'); localStorage.setItem('cc.sound.effects', '0'); });
    const page = await context.newPage();
    await show(page);
    await page.waitForTimeout(1200);
    const png = `${here}${name}-${width}-${theme}.png`;
    await page.screenshot({ path: png });
    await context.close();
    // kept as JPEG, as the review folders keep theirs
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', png, '--out', png.replace(/\.png$/, '.jpg')], { stdio: 'ignore' });
    unlinkSync(png);
  }
  await capture('nothing-to-connect-with', async page => {
    await page.goto(`${base}/feasts/${feast.id}`);
    await page.getByRole('button', { name: 'Connect to join', exact: true }).click();
    await page.getByRole('button', { name: 'Copy link', exact: true }).click();
    await page.getByRole('group', { name: 'Update', exact: true }).waitFor();
  });
  await capture('screen-did-not-arrive', async page => {
    await page.route(url => url.pathname === `/assets/${feastChunk}`, route => route.abort('failed'));
    await page.goto(`${base}/feasts/${feast.id}`);
    await page.getByRole('button', { name: 'Reload', exact: true }).waitFor();
  });
}
await browser.close();
