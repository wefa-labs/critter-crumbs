import './styles/app.css';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { App } from './app/app.js';
import { copy } from '@critter-crumbs/shared';
document.title = copy['app.name'];
const root = document.getElementById('root')!;
if (import.meta.env.DEV && location.pathname.startsWith('/__preview/portraits')) {
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
  const reactRoot = createRoot(root);
  reactRoot.render(createElement(App));
  import.meta.hot?.dispose(() => reactRoot.unmount());
}
