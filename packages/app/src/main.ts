import './styles/app.css';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { App } from './app/app.js';
import { copy } from '@critter-crumbs/shared';
import { readDarkChoice, showDarkChoice } from './app/theme.js';
import { gardenReview } from './portraits/version.js';
document.title = copy['app.name'];
// A dark or light look someone chose is in place before the first screen is drawn; otherwise the device decides.
try { showDarkChoice(document.documentElement, readDarkChoice(localStorage)); } catch { /* Storage can be switched off; the device's look stands. */ }
// The wordmark's face (2 KB) starts on its way now, while the session is read, so the first screen is drawn in it
// and does not swap to it. A preload link in the page would do the same, but a browser warns about a preloaded file
// the screen does not use, and the game's screens show no wordmark.
void document.fonts.load('900 1em Grandstander', copy['app.name']).catch(() => {});
const root = document.getElementById('root')!;
async function boot() {
  // Defer rendering until the optional art chunk is ready; keep entry-module evaluation synchronous.
  if (gardenReview) await import('./portraits/garden/install.js');
  if (import.meta.env.DEV && location.pathname === '/dev/screens') {
    const { ScreenGallery } = await import('./dev/screens.js');
    const reactRoot = createRoot(root); reactRoot.render(createElement(ScreenGallery));
    import.meta.hot?.dispose(() => reactRoot.unmount());
  } else if (import.meta.env.DEV && location.pathname.startsWith('/__preview/portraits')) {
    const { mountPortraitWorkshop } = await import('./dev/portraits.js');
    const dispose = mountPortraitWorkshop(root);
    import.meta.hot?.dispose(dispose);
  } else if (import.meta.env.DEV && location.pathname === '/__preview/rendering') {
    const { RenderingWorkshop } = await import('./dev/rendering.js');
    const reactRoot = createRoot(root); reactRoot.render(createElement(RenderingWorkshop));
    import.meta.hot?.dispose(() => reactRoot.unmount());
  } else if (import.meta.env.DEV && location.pathname === '/__preview/audio') {
    const { AudioWorkshop } = await import('./dev/audio.js');
    const reactRoot = createRoot(root); reactRoot.render(createElement(AudioWorkshop));
    import.meta.hot?.dispose(() => reactRoot.unmount());
  } else if (import.meta.env.DEV && location.pathname === '/__preview/world-traits') {
    const { WorldTraitWorkshop } = await import('./dev/world-traits.js');
    const reactRoot = createRoot(root);
    reactRoot.render(createElement(WorldTraitWorkshop));
    import.meta.hot?.dispose(() => reactRoot.unmount());
  } else {
    root.classList.add('app-shell');
    const reactRoot = createRoot(root);
    reactRoot.render(createElement(App));
    import.meta.hot?.dispose(() => reactRoot.unmount());
  }
}
void boot().catch(() => {
  const heading = document.createElement('h1'), detail = document.createElement('p'), retry = document.createElement('button'), back = document.createElement('a');
  heading.textContent = copy['app.unavailable']; detail.textContent = copy['err.generic']; retry.textContent = copy['action.retry']; back.textContent = copy['action.back'];
  retry.onclick = () => location.reload();
  const baseline = new URL(location.href); baseline.searchParams.set('critters', '1'); back.href = baseline.pathname + baseline.search;
  root.replaceChildren(heading, detail, retry, back);
});
