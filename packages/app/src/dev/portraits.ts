import { copy, formatCopy } from '@critter-crumbs/shared';
import { createPortrait, disposePortrait, renderPortraits } from '../portraits/index.js';
import { Asleep, Identity, Portrait, Received, createWorld } from '../world/index.js';
import { createTickerHost } from '../sim/ticker-host.js';
import { browserSettings, saveSetting } from '../sim/settings.js';

export function mountPortraitWorkshop(root: HTMLElement) {
  const { settings, storage } = browserSettings(window);
  const game = createWorld({ issued: 100, settings, critters: Array.from({ length: 24 }, (_, index) => ({ id: String(index), address: `0x${(index + 1).toString(16).padStart(40, '0')}`, variant: index % 5, name: formatCopy('preview.name', { n: index + 1 }), ownerAddress: null })), outputs: { render2d: renderPortraits } });
  function node<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, parent: HTMLElement, text?: string) {
    const element = document.createElement(tag); element.className = className;
    if (text !== undefined) element.textContent = text;
    parent.append(element); return element;
  }
  const header = node('header', '', root); node('span', 'brand', header, copy['app.name']);
  const main = node('main', '', root); main.id = 'main';
  const intro = node('div', 'page-intro', main); node('h1', '', intro, copy['preview.title']); node('p', '', intro, copy['preview.body']);
  const controls = node('div', 'actions', intro);
  const wake = node('button', '', controls, copy['preview.wake']);
  const sleep = node('button', 'secondary', controls, copy['preview.sleep']);
  const grow = node('button', 'secondary', controls, copy['preview.grow']);
  const stillLabel = node('label', '', controls);
  const still = node('input', '', stillLabel); still.type = 'checkbox'; still.checked = settings.still;
  node('span', '', stillLabel, copy['motion.still.label']);
  const grid = node('div', 'critter-grid', main);
  for (const [index, entity] of game.critters.entries()) {
    const cell = node('article', 'critter-cell', grid);
    const stage = node('div', 'stage', cell);
    const name = formatCopy('preview.name', { n: index + 1 });
    const portrait = createPortrait(document, entity.get(Identity)!.parameters, { name, decorative: true, size: 'stage' });
    entity.add(Portrait(portrait)); stage.append(portrait); node('h2', '', cell, name);
  }
  const samples = node('section', 'page-intro', main);
  node('h2', '', samples, copy['preview.sizes']);
  const sampleRow = node('div', 'actions', samples);
  for (const size of [40, 64, 96] as const) {
    const sample = createPortrait(document, game.critters[0]!.get(Identity)!.parameters, { name: formatCopy('preview.name', { n: 1 }), size });
    sampleRow.append(sample);
  }
  const host = createTickerHost({ tick: game.tick, stopInput: game.actions.stopPour, request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id) });
  host.setMode(settings.still || settings.reducedMotion ? 'demand' : 'continuous'); host.invalidate();
  still.onchange = () => { settings.still = still.checked; saveSetting(storage, 'still', still.checked); game.actions.setSettings({ still: still.checked }); host.setMode(still.checked || settings.reducedMotion ? 'demand' : 'continuous'); host.invalidate(); };
  wake.onclick = () => { for (const entity of game.critters) entity.remove(Asleep); host.invalidate(); };
  sleep.onclick = () => { for (const entity of game.critters) entity.add(Asleep); host.invalidate(); };
  grow.onclick = () => { for (const entity of game.critters) entity.set(Received, { fed: .65, mood: .65 }); host.invalidate(); };
  const visibility = () => host.setHidden(document.hidden);
  document.addEventListener('visibilitychange', visibility);
  return () => { document.removeEventListener('visibilitychange', visibility); host.destroy(); for (const entity of game.critters) { const svg = entity.get(Portrait); if (svg) disposePortrait(svg); } game.destroy(); root.replaceChildren(); };
}
