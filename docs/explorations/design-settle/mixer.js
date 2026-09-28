// The comparison page: two or three panes, each a phone running the app's own stylesheet with one
// mix of the checkpoint choices. The comparison is kept in the URL hash where the host allows it,
// and in this browser's storage, so it survives a reload.
import { ASSETS } from './assets.js';
import { PALETTES, TYPE, TOKEN_USES, contrast } from './tokens.js';
import { generate1, generate2, ELEMENTS } from './generator.js';
import { createPortrait } from './portrait.js';
import { buildScreen, MEMBERS } from './screens.js';

const APP_CSS = ASSETS.appCss, YOUNG_SERIF = ASSETS.youngSerif, ART = ASSETS.art, ARRIVALS = ASSETS.arrival;
const STORE = 'design-settle:comparison';
const CRITTERS = { v1: MEMBERS.map(member => ({ ...member, params: generate1(member.address, 0) })), v2: MEMBERS.map(member => ({ ...member, params: generate2(member.address, 0) })) };

const SCREENS = [
  ['arrival', 'Arrival', 'Before connecting: the arrival picture (D17) and the type. No critters on this screen.'],
  ['meet', 'Meet', 'The first critter a member sees. The app shows this dialog as a 2D portrait, so the 3D choices do not apply.'],
  ['scatter', 'Scattering', 'The screen people use most. Tap + and − to move crumbs; the heap and the count follow.'],
  ['read', 'Read', 'The read pass uses 64 px portraits only, so this screen is about type and colour.'],
  ['feast', 'Feast', 'After the feast settles: each critter has grown with its share.'],
  ['closeup', 'Close-up', 'Not an app screen: every stage at full phone width, to judge the surface, outline and glow.'],
];
const AXES = [
  { key: 'palette', label: 'Palette', ref: 'D14', options: [['today', 'Today', 'The provisional tokens that ship now'], ['world', 'World', 'The explorations §12 world palette, as #31 maps it onto the token names']] },
  { key: 'type', label: 'Type', ref: 'D18', options: [['young', 'Young Serif', 'Young Serif display, the device’s own body face (D2 stands)'], ['deck', 'Shippori + Atkinson', 'The deck’s pairing, weighed and not taken in #31: four font files']] },
  { key: 'critters', label: 'Critters', ref: 'D16', options: [['v1', 'Version 1', 'GEN_VERSION 1: what the rehearsal shows if DQ5 is (c)'], ['v2', 'Version 2', 'GEN_VERSION 2 prototype: the element is drawn first'], ['art', 'Deck art', 'The deck’s painted element portraits, matched to each member’s version 2 element. A reference, not generated']] },
  { key: 'surface', label: 'Surface', ref: 'D15', options: [['rough', 'Rough', 'MeshStandardMaterial, as shipped'], ['toon', 'Toon ramp', 'Flat matte colour, two-step toon ramp, one hard cel shadow']] },
  { key: 'outline', label: 'Outline', ref: 'D15', options: [['none', 'None', 'No outline pass (taken in #31)'], ['hull', 'Hull', 'Inverted-hull outline: about twice the triangles and one extra draw per material group (not taken)']] },
  { key: 'glow', label: 'Glow point', ref: 'D15', options: [['on', 'On', 'One emissive point inside the accent group, at no extra draw call'], ['off', 'Off', 'No glow point']] },
  { key: 'arrival', label: 'Arrival', ref: 'D17', options: [['entrance', 'Entrance', 'The shipped arrival picture: the burrow entrance by day'], ['window', 'Window', 'Stand-in from the deck: the interior, open to the sky. No final D17 art exists yet'], ['dusk', 'Dusk', 'Stand-in from the deck: the interior at dusk, with the circular window']] },
];
const PRESETS = {
  today: { label: 'Today', palette: 'today', type: 'young', critters: 'v1', surface: 'rough', outline: 'none', glow: 'off', arrival: 'entrance' },
  proposal: { label: '#31 proposal', palette: 'world', type: 'young', critters: 'v2', surface: 'toon', outline: 'none', glow: 'on', arrival: 'window' },
  deck: { label: 'Deck look', palette: 'today', type: 'deck', critters: 'art', surface: 'rough', outline: 'none', glow: 'off', arrival: 'entrance' },
};
const LIGHT_FOR = { arrival: 'dusk', meet: 'day', scatter: 'day', read: 'day', feast: 'feast', closeup: 'day' };
const SKELETON = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>';
const FRAME_CSS = `
@font-face { font-family: 'Young Serif'; font-style: normal; font-weight: 400; font-display: swap; src: url('${YOUNG_SERIF}') format('woff2'); }
html[data-type="deck"] :is(h1, h2, h3, .brand, .link-list a) { font-weight: 500; }
.mesh-still, .art-still { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.art-still { object-fit: cover; border-radius: var(--cc-radius-md); }
.art-slot { display: block; object-fit: cover; border-radius: 6px; }
.mock-backdrop { position: fixed; inset: 0; z-index: 25; background: rgb(42 33 26 / .35); }
dialog.mock-modal { position: fixed; inset: 0; margin: auto; height: fit-content; z-index: 30; }
.mock-stats { margin: 0; font-family: var(--cc-font-data); font-size: var(--cc-text-xs); color: var(--cc-text-3); }`;

const state = { screen: 'scatter', view: '3d', light: 'auto', linked: true, controls: true };
const panes = [];
const stills = new Map();
let meshModule, meshFailed = false, syncing = false;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) { if (value === false || value === undefined || value === null) continue; if (key === 'class') node.className = value; else node.setAttribute(key, value === true ? '' : String(value)); }
  for (const child of children.flat()) if (child !== null && child !== undefined && child !== false) node.append(child);
  return node;
}
function segmented({ name, label, options, value, onChange, hint }) {
  const root = el('div', { class: 'axis', role: 'radiogroup', 'aria-labelledby': `${name}-label` });
  root.append(el('span', { class: 'name', id: `${name}-label` }, label, hint ? el('small', {}, hint) : null));
  const seg = el('div', { class: 'seg' });
  for (const [optionValue, optionLabel, description] of options) {
    const input = el('input', { type: 'radio', name, value: optionValue });
    input.checked = optionValue === value;
    input.addEventListener('change', () => { if (input.checked) onChange(optionValue); });
    seg.append(el('label', { title: description ?? '' }, input, el('span', {}, optionLabel)));
  }
  root.append(seg);
  return {
    root,
    set(next) { for (const input of seg.querySelectorAll('input')) input.checked = input.value === next; },
    disable(off, reason) { root.dataset.off = String(off); root.title = off ? reason : ''; for (const input of seg.querySelectorAll('input')) input.disabled = off; },
  };
}

function readHash() {
  const fromHash = location.hash.slice(1);
  let stored = '';
  try { stored = localStorage.getItem(STORE) ?? ''; } catch { stored = ''; }
  const params = new URLSearchParams(fromHash.includes('=') ? fromHash : stored);
  const pick = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
  state.screen = pick(params.get('s'), SCREENS.map(([key]) => key), state.screen);
  state.view = pick(params.get('v'), ['3d', 'simple'], state.view);
  state.light = pick(params.get('l'), ['auto', 'day', 'dusk', 'feast'], state.light);
  state.linked = params.get('x') !== '0';
  state.controls = params.get('c') !== '0';
  const encoded = (params.get('p') ?? '').split('|').filter(Boolean).slice(0, 3);
  const decode = text => { const values = text.split('.'); return Object.fromEntries(AXES.map((axis, index) => [axis.key, pick(values[index], axis.options.map(([key]) => key), PRESETS.proposal[axis.key])])); };
  return encoded.length >= 2 ? encoded.map(decode) : [PRESETS.today, PRESETS.proposal];
}
function writeHash() {
  const params = new URLSearchParams({ s: state.screen, v: state.view, l: state.light, x: state.linked ? '1' : '0', c: state.controls ? '1' : '0', p:panes.map(pane => AXES.map(axis => pane.settings[axis.key]).join('.')).join('|') });
  try { history.replaceState(null, '', `#${params}`); } catch { /* a host frame may refuse URL changes */ }
  try { localStorage.setItem(STORE, String(params)); } catch { /* storage can be unavailable; the page works without it */ }
}

function presetOf(settings) { return Object.keys(PRESETS).find(key => AXES.every(axis => PRESETS[key][axis.key] === settings[axis.key])) ?? ''; }
function describe(pane) {
  const label = (axis, value) => axis.options.find(([key]) => key === value)[1];
  const s = pane.settings, [palette, type, critters, surface, outline, glow, arrival] = AXES;
  const threeD = s.critters === 'art' ? 'not applicable (deck art)' : `${label(surface, s.surface)}, outline ${label(outline, s.outline).toLowerCase()}${s.critters === 'v2' ? `, glow point ${label(glow, s.glow).toLowerCase()}` : ''}`;
  return [`Pane ${pane.letter}${presetOf(s) ? ` (${PRESETS[presetOf(s)].label})` : ''}`,
    `Palette: ${label(palette, s.palette)} (D14)`, `Type: ${label(type, s.type)} (D18)`, `Critters: ${label(critters, s.critters)} (D16)`,
    `3D surface: ${threeD} (D15)`, `Arrival: ${label(arrival, s.arrival)} (D17)`].join('\n');
}

function createPane(index, settings) {
  const letter = 'ABC'[index], pane = { index, letter, settings: { ...settings }, token: 0, groups: {} };
  const preset = el('select', { 'aria-label': `Preset for pane ${letter}` }, el('option', { value: '' }, 'Custom mix'), Object.entries(PRESETS).map(([key, value]) => el('option', { value: key }, value.label)));
  preset.addEventListener('change', () => { if (!preset.value) return; Object.assign(pane.settings, PRESETS[preset.value]); delete pane.settings.label; paneChanged(pane); });
  const copyButton = el('button', { type: 'button', class: 'ghost' }, 'Copy choices');
  const copyText = el('textarea', { class: 'copy-text', readonly: true, rows: 6, hidden: true, 'aria-label': `Choices in pane ${letter}` });
  copyButton.addEventListener('click', async () => {
    const text = describe(pane);
    try {
      await navigator.clipboard.writeText(text);
      copyText.hidden = true; copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy choices'; }, 1600);
    } catch {
      // Some hosts refuse the clipboard: show the text selected, ready to copy by hand.
      copyText.value = text; copyText.hidden = false; copyText.focus(); copyText.select();
    }
  });
  pane.preset = preset;
  const axes = el('div', { class: 'axes' });
  for (const axis of AXES) {
    const group = segmented({ name: `p${index}-${axis.key}`, label: axis.label, hint: axis.ref, options: axis.options, value: pane.settings[axis.key], onChange: value => { pane.settings[axis.key] = value; paneChanged(pane); } });
    pane.groups[axis.key] = group; axes.append(group.root);
  }
  pane.iframe = el('iframe', { title: `Pane ${letter}: the app at phone width`, srcdoc: SKELETON });
  pane.iframe.addEventListener('load', () => setupFrame(pane), { once: true });
  pane.frame = el('div', { class: 'frame' }, pane.iframe);
  pane.phone = el('div', { class: 'phone' }, pane.frame);
  pane.summary = el('p', { class: 'pane-summary' });
  pane.root = el('article', { class: 'pane', 'aria-labelledby': `pane-${index}-title` },
    el('div', { class: 'pane-head' }, el('h2', { id: `pane-${index}-title` }, letter), preset, copyButton), copyText, pane.summary, el('div', { class: 'pane-body' }, axes, pane.phone));
  return pane;
}
function setupFrame(pane) {
  const doc = pane.iframe.contentDocument;
  const stylesheet = href => { const node = doc.createElement('link'); node.rel = 'stylesheet'; node.href = href; return node; };
  const app = stylesheet(APP_CSS), style = doc.createElement('style');
  style.textContent = FRAME_CSS;
  const ready = new Promise(resolve => { app.addEventListener('load', resolve, { once: true }); app.addEventListener('error', resolve, { once: true }); });
  // The app's sheet first, so this page's Young Serif @font-face (the real path) is the later rule and wins.
  doc.head.append(app, stylesheet(TYPE.deck.stylesheet), style);
  doc.addEventListener('click', event => { if (event.target instanceof doc.defaultView.Element && event.target.closest('a')) event.preventDefault(); });
  pane.iframe.contentWindow.addEventListener('scroll', () => syncScroll(pane), { passive: true });
  ready.then(() => { pane.doc = doc; renderFrame(pane); });
}

function loadMesh() {
  meshModule ??= import('./mesh.js').then(module => { setStatus('3D ready: stills from three.js 0.185.1'); return module; }, error => { meshFailed = true; setStatus('3D unavailable: three.js did not load, so every stage shows its portrait'); throw error; });
  return meshModule;
}
function setStatus(text) { document.getElementById('status').textContent = text; }
function lightName() { return state.light === 'auto' ? LIGHT_FOR[state.screen] : state.light; }

async function renderFrame(pane) {
  const doc = pane.doc; if (!doc) return;
  const token = ++pane.token, s = pane.settings, palette = PALETTES[s.palette], type = TYPE[s.type], root = doc.documentElement;
  for (const [name, value] of Object.entries({ ...palette.colours, ...palette.effects })) root.style.setProperty(`--cc-${name}`, value);
  root.style.setProperty('--cc-font-display', type.display); root.style.setProperty('--cc-font-body', type.body);
  root.dataset.type = s.type;
  const scroller = doc.scrollingElement, top = scroller.scrollTop;
  const ctx = { document: doc, critters: CRITTERS[s.critters === 'v1' ? 'v1' : 'v2'], mode: s.critters, view: meshFailed ? 'simple' : state.view, ink: palette.colours.burrow, eyeWhite: palette.colours.surface, arrival: { src: ARRIVALS[s.arrival] }, art: critter => ART[critter.params.element], meshes: [] };
  doc.body.replaceChildren(...buildScreen(state.screen, ctx));
  doc.title = `Pane ${pane.letter}`;
  scroller.scrollTop = top;
  if (!ctx.meshes.length) return;
  let mesh;
  try { mesh = await loadMesh(); } catch { return rerenderAll(); }
  const lights = palette.lights[lightName()];
  for (const job of ctx.meshes) {
    if (pane.token !== token) return;
    const width = Math.min(760, Math.max(96, Math.round(job.host.getBoundingClientRect().width * 2 / 8) * 8)), height = Math.round(width * 1.25);
    const options = { surface: s.surface, outline: s.outline === 'hull', glow: s.glow === 'on', ink: palette.colours.burrow, eyeWhite: palette.colours.surface, asleep: job.asleep, fed: job.fed, lights };
    const key = JSON.stringify([s.critters, job.critter.id, width, height, options]);
    let still = stills.get(key);
    if (!still) {
      await new Promise(resolve => setTimeout(resolve));
      if (pane.token !== token) return;
      still = mesh.renderStill(job.critter.params, options, width, height); stills.set(key, still);
    }
    const image = doc.createElement('img'); image.className = 'mesh-still'; image.alt = ''; image.src = still.url;
    job.host.append(image); job.host.dataset.mesh = 'ready';
    if (job.stats) job.stats.textContent = `${still.calls} draw calls · ${still.triangles.toLocaleString('en')} triangles`;
  }
}
function rerenderAll() { for (const pane of panes) renderFrame(pane); }

function syncScroll(source) {
  if (!state.linked || syncing || !source.doc) return;
  const from = source.doc.scrollingElement, ratio = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
  syncing = true;
  for (const pane of panes) if (pane !== source && pane.doc) { const to = pane.doc.scrollingElement; to.scrollTop = ratio * (to.scrollHeight - to.clientHeight); }
  requestAnimationFrame(() => { syncing = false; });
}
/** Each phone fills the height left below its pane head, so both phones and their controls share one viewport. */
function fitPhones() {
  for (const pane of panes) {
    const top = pane.phone.getBoundingClientRect().top + scrollY;
    const available = Math.max(380, innerHeight - top - 24);
    pane.frame.style.setProperty('--scale', Math.min(1, (pane.phone.clientWidth - 20) / 375, available / 812).toFixed(3));
  }
}

function refreshControls() {
  const differing = [];
  for (const axis of AXES) {
    const differs = new Set(panes.map(pane => pane.settings[axis.key])).size > 1;
    if (differs) differing.push(axis.label);
    for (const pane of panes) { pane.groups[axis.key].root.dataset.differs = String(differs); pane.groups[axis.key].set(pane.settings[axis.key]); }
  }
  for (const pane of panes) {
    const threeD = state.view === '3d' && !meshFailed && pane.settings.critters !== 'art';
    const why = state.view !== '3d' ? 'Simple view shows portraits, so the 3D surface does not apply' : 'Deck art is a painting, so the 3D surface does not apply';
    pane.groups.surface.disable(!threeD, why); pane.groups.outline.disable(!threeD, why);
    pane.groups.glow.disable(!threeD || pane.settings.critters === 'v1', pane.settings.critters === 'v1' ? 'Version 1 critters have no glow point' : why);
    pane.preset.value = presetOf(pane.settings);
    pane.summary.textContent = AXES.filter(axis => !pane.groups[axis.key].root.querySelector('input:disabled'))
      .map(axis => `${axis.label} ${axis.options.find(([key]) => key === pane.settings[axis.key])[1]}`).join(' · ');
  }
  document.body.classList.toggle('hide-controls', !state.controls);
  document.getElementById('differs').textContent = differing.length ? `A and ${panes.length === 3 ? 'the others' : 'B'} differ in ${differing.join(', ').toLowerCase()}.` : 'The panes match.';
  document.getElementById('hint').textContent = SCREENS.find(([key]) => key === state.screen)[2];
  writeHash();
}
function paneChanged(pane) { refreshControls(); renderFrame(pane); }
function globalChanged() { refreshControls(); rerenderAll(); }

function setPaneCount(count) {
  const host = document.getElementById('panes');
  while (panes.length > count) { const pane = panes.pop(); observer.unobserve(pane.phone); pane.root.remove(); }
  while (panes.length < count) { const pane = createPane(panes.length, panes.length === 2 ? PRESETS.deck : PRESETS.proposal); panes.push(pane); host.append(pane.root); observer.observe(pane.phone); }
  host.style.setProperty('--count', String(count));
  refreshControls(); fitPhones();
}
const observer = new ResizeObserver(fitPhones);

function buildBar() {
  const add = (id, options) => document.getElementById(id).replaceWith(segmented(options).root);
  add('screen-group', { name: 'screen', label: 'Screen', options: SCREENS.map(([key, label, hint]) => [key, label, hint]), value: state.screen, onChange: value => { state.screen = value; globalChanged(); } });
  add('view-group', { name: 'view', label: 'Critters as', options: [['3d', '3D', 'Stages render the mesh, as the app does once its 3D chunk loads'], ['simple', 'Simple view', 'Portraits only: the Simple view setting, and every list']], value: state.view, onChange: value => { state.view = value; globalChanged(); } });
  add('light-group', { name: 'light', label: 'Light', options: [['auto', 'Auto', 'The preset Design System §4.2 assigns to this screen'], ['day', 'Day'], ['dusk', 'Dusk'], ['feast', 'Feast']], value: state.light, onChange: value => { state.light = value; globalChanged(); } });
  add('count-group', { name: 'count', label: 'Panes', options: [['2', 'Two'], ['3', 'Three']], value: String(panes.length || 2), onChange: value => { setPaneCount(Number(value)); writeHash(); } });
  const linked = document.getElementById('linked');
  linked.checked = state.linked;
  linked.addEventListener('change', () => { state.linked = linked.checked; writeHash(); });
  const controls = document.getElementById('show-controls');
  controls.checked = state.controls;
  controls.addEventListener('change', () => { state.controls = controls.checked; refreshControls(); fitPhones(); });
  document.getElementById('swap').addEventListener('click', () => { const [a, b] = [panes[0].settings, panes[1].settings]; panes[0].settings = { ...b }; panes[1].settings = { ...a }; globalChanged(); });
}

function buildReference() {
  const tokens = Object.keys(TOKEN_USES);
  const swatch = (palette, name) => {
    const value = PALETTES[palette].colours[name];
    if (!value) return el('td', { class: 'none' }, '—');
    const chip = el('span', { class: 'chip' }); chip.style.background = value;
    return el('td', {}, chip, el('code', {}, value), el('small', {}, `${contrast(value, PALETTES[palette].colours.oat).toFixed(1)} : 1 on Oat`));
  };
  document.getElementById('palette-table').append(
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Token'), el('th', { scope: 'col' }, 'Today'), el('th', { scope: 'col' }, 'World palette'), el('th', { scope: 'col' }, 'Use'))),
    el('tbody', {}, tokens.map(name => el('tr', {}, el('th', { scope: 'row' }, el('code', {}, `--cc-${name}`)), swatch('today', name), swatch('world', name), el('td', {}, TOKEN_USES[name])))));
  const pairs = [
    ['Burrow on Oat', 'burrow', 'oat'], ['Burrow on Surface', 'burrow', 'surface'], ['Burrow on Sunken', 'burrow', 'sunken'],
    ['Soil on Oat', 'soil', 'oat'], ['Soil on Surface', 'soil', 'surface'], ['Soil on Sunken', 'soil', 'sunken'],
    ['Bark on Oat', 'bark', 'oat'], ['Bark on Surface', 'bark', 'surface'], ['Bark on Sunken', 'bark', 'sunken'],
    ['Moss-ink on Oat', 'moss-ink', 'oat'], ['Moss-ink on Moss-tint', 'moss-ink', 'moss-tint'],
    ['Clay-ink on Oat', 'clay-ink', 'oat'], ['Clay-ink on Clay-tint', 'clay-ink', 'clay-tint'], ['Oat on Burrow (buttons)', 'oat', 'burrow'],
    ['Line-strong on Oat', 'line-strong', 'oat', 3], ['Line-strong on Surface', 'line-strong', 'surface', 3],
    ['Crust on Oat', 'crust', 'oat', 3], ['Moss on Oat', 'moss', 'oat', 3], ['Clay on Oat', 'clay', 'oat', 3],
  ];
  const verdict = (palette, [, text, ground, need = 4.5]) => { const value = contrast(PALETTES[palette].colours[text], PALETTES[palette].colours[ground]); return el('td', { class: value >= need ? 'pass' : 'fail' }, `${value.toFixed(2)} ${value >= need ? '✓' : '✗'}`); };
  document.getElementById('contrast-table').append(
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Pair'), el('th', { scope: 'col' }, 'Today'), el('th', { scope: 'col' }, 'World palette'), el('th', { scope: 'col' }, 'Needs'))),
    el('tbody', {}, pairs.map(pair => el('tr', {}, el('th', { scope: 'row' }, pair[0]), verdict('today', pair), verdict('world', pair), el('td', {}, pair[3] ? '3 : 1 (not text)' : '4.5 : 1')))));
  const found = {};
  for (const member of MEMBERS) for (let variant = 0; variant <= 4; variant++) { const params = generate2(member.address, variant); found[params.element] ??= { params, member, variant }; }
  const world = PALETTES.world.colours, host = document.getElementById('elements');
  for (const element of Object.keys(ELEMENTS)) {
    const entry = found[element], name = element[0].toUpperCase() + element.slice(1);
    const card = el('figure', { class: 'element' });
    const pair = el('div', { class: 'pair' });
    if (entry) pair.append(el('div', { class: 'stage-box' }, createPortrait(document, entry.params, { name, size: 'stage', ink: world.burrow, eyeWhite: world.surface })));
    pair.append(el('img', { src: ART[element], alt: `The deck’s ${element} critter`, width: 160, height: 200 }));
    const sizes = el('div', { class: 'sizes' }, entry ? [40, 64, 96].map(size => createPortrait(document, entry.params, { name, size, ink: world.burrow, eyeWhite: world.surface })) : []);
    card.append(pair, sizes, el('figcaption', {}, el('strong', {}, name), entry ? ` · ${entry.member.name}, variant ${entry.variant}: ${entry.params.earType} ears, ${entry.params.crest} crest, ${entry.params.tailType} tail, ${entry.params.markings} markings` : ' · not drawn by any rehearsal seed in variants 0–4'));
    host.append(card);
  }
  const counts = { earth: 0, water: 0, fire: 0, air: 0 };
  for (const critter of CRITTERS.v2) counts[critter.params.element]++;
  document.getElementById('element-counts').textContent = `With version 2, the eight rehearsal accounts at variant 0 draw ${Object.entries(counts).map(([element, n]) => `${n} ${element}`).join(', ')}.`;
}

document.head.append(el('link', { rel: 'stylesheet', href: ASSETS.portraitsCss }));
const initial = readHash();
buildBar();
for (const settings of initial) { const pane = createPane(panes.length, settings); panes.push(pane); document.getElementById('panes').append(pane.root); observer.observe(pane.phone); }
document.getElementById('panes').style.setProperty('--count', String(panes.length));
document.querySelector('input[name="count"][value="3"]').checked = panes.length === 3;
document.querySelector('input[name="count"][value="2"]').checked = panes.length === 2;
addEventListener('resize', fitPhones);
refreshControls(); fitPhones(); buildReference();
if (state.view === '3d') loadMesh().catch(() => {});
