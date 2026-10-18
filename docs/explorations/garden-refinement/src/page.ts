import fixtures from '../fixtures.json';
import { generate2 } from '../../critter-directions/src/core-shim.js';
import { paintGarden as paintBefore } from '../../critter-directions/src/garden.js';
import { gardenDraw, gardenLayout, paintGarden } from '../../../../packages/app/src/portraits/garden/species.js';
import { faceCrop } from '../../../../packages/app/src/game/styles.js';
import { createWorld, Portrait } from '../../../../packages/app/src/world/index.js';
import { renderPortraits } from '../../../../packages/app/src/portraits/pose.js';
import { disposePortrait } from '../../../../packages/app/src/portraits/index.js';
import '../../../../packages/app/src/styles/portraits.css';
import '../../../../packages/app/src/portraits/garden/style.css';

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, cls?: string) => {
  const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el;
};
const main = document.querySelector('main')!;
const section = (id: string, title: string, lede: string) => {
  const el = h('section'); el.id = id; el.append(h('h2', title), h('p', lede, 'lede')); main.append(el); return el;
};
const hero = section('cast', 'Eight inhabitants, one painted world', 'Acorn squirrel · lichen moth · pond turtle · koi kite · ember fox · phoenix chick · flying lemur · cloud lamb. The refined portraits use soft gradients and static paper marks, with no live SVG filters.');
const cast = h('div', undefined, 'cast'); hero.append(cast);
for (const group of fixtures.groups) {
  const p = generate2(group.address, 0), item = h('figure');
  const label = h('a', group.name); label.href = `#species-${group.species}`;
  const caption = h('figcaption'); caption.append(label);
  item.append(paintGarden(document, p, { finish: 'painted', size: 140, name: group.name, decorative: false }), caption); cast.append(item);
}

const compare = section('compare', 'Before and after, three variants of every species', 'Left: the selected prototype. Right: the refinement. Matching addresses and variants throughout. These fixtures deliberately keep one species across three rerolls so variation is easy to compare; normal rerolls can change species.');
for (const group of fixtures.groups) {
  const block = h('article', undefined, 'species-block'); block.id = `species-${group.species}`; block.append(h('h3', group.name), h('code', group.address));
  const strip = h('div', undefined, 'variants');
  for (const variant of group.variants) {
    const p = generate2(group.address, variant), card = h('div', undefined, 'variant'), pair = h('div', undefined, 'pair');
    card.append(h('h4', `Variant ${variant}`));
    for (const [label, paint] of [['Prototype', paintBefore], ['Refined', paintGarden]] as const) {
      const figure = h('figure'); figure.append(paint(document, p, { finish: 'painted', size: 130, decorative: true }), h('figcaption', label)); pair.append(figure);
    }
    card.append(pair); strip.append(card);
  }
  block.append(strip); compare.append(block);
}

const faces = section('faces', 'Faces that stay recognisable at list sizes', '40, 44 and 64 pixels. Each crop uses the head’s own centre and radius, including off-centre fox, turtle and koi heads.');
for (const group of fixtures.groups) {
  const row = h('div', undefined, 'face-row'); row.append(h('strong', group.name));
  for (const variant of group.variants) for (const size of [40, 44, 64]) {
    const p = generate2(group.address, variant), extent = gardenLayout(gardenDraw(p)).extent, face = h('span', undefined, 'face');
    const style = faceCrop(size, extent.headY, extent.headX, extent.headRadius) as Record<string, string>;
    for (const [key, value] of Object.entries(style)) face.style.setProperty(key, value);
    face.append(paintGarden(document, p, { finish: 'painted', decorative: true })); row.append(face);
  }
  faces.append(row);
}
const silhouettes = section('silhouettes', 'Recognition beyond colour', 'The same three variants per species, shown without colour. Proportion, ear, wing, crown and tail differences carry part of each identity; eight species do not guarantee unique critters.');
for (const group of fixtures.groups) {
  const row = h('div', undefined, 'silhouette-row'); row.append(h('strong', group.name));
  for (const variant of group.variants) row.append(paintGarden(document, generate2(group.address, variant), { finish: 'painted', size: 100, decorative: true })); silhouettes.append(row);
}

const states = section('states', 'Quiet expressions and a crumb-holding alternative', 'Awake · asleep · receiving a crumb · fed · delighted · holding a crumb (review alternative). Low shares never create a sad expression. Paws holding crumbs are proposed here and remain off in the integrated renderer.');
for (const name of ['fox', 'squirrel', 'lemur']) {
  const group = fixtures.groups.find(group => group.species === name)!, row = h('div', undefined, 'states');
  const p = generate2(group.address, 0);
  for (const [label, state] of [['Awake', {}], ['Asleep', { asleep: true }], ['Crumb arrives', { delighted: true }], ['Fed', { fed: .8 }], ['Delighted', { delighted: true, fed: 1 }], ['Holding?', { delighted: true, holding: true }]] as const) {
    const fig = h('figure'), svg = paintGarden(document, p, { ...state, finish: 'painted', size: 110, decorative: true });
    if (label === 'Crumb arrives') svg.style.setProperty('--scale-x', '1.08');
    fig.append(svg, h('figcaption', label)); row.append(fig);
  }
  states.append(row);
}

const bench = section('motion', 'Motion through the app’s real pose system', 'Ten critters, including three foxes, driven by createWorld.tick and renderPortraits. Measure six seconds after a one-second warmup. This measures frame pacing in this browser, not calibrated phone GPU performance.');
const controls = h('div', undefined, 'controls'), run = h('button', 'Measure refined portraits'), before = h('button', 'Measure prototype'), quiet = h('input'), quietLabel = h('label', ' Still critters '), sleep = h('button', 'Sleep / wake'), crumb = h('button', 'Give a crumb');
quiet.type = 'checkbox'; quietLabel.prepend(quiet); const stop = h('button', 'Stop motion'); controls.append(run, before, quietLabel, sleep, crumb, stop);
const status = h('output', 'Ready. Start a measurement to watch breathing, blinking and hover.'), stage = h('div', undefined, 'motion-stage'); status.id = 'measurement'; status.setAttribute('aria-live', 'polite'); bench.append(controls, status, stage);
const fox = fixtures.groups.find(group => group.species === 'fox')!;
const group = [...fox.variants.map(variant => ({ address: fox.address, variant, name: `Fox ${variant}` })), ...fixtures.groups.filter(g => g.species !== 'fox').map(g => ({ address: g.address, variant: 0, name: g.name }))];
let cleanup = () => {}, world: ReturnType<typeof createWorld> | undefined, sleeping = false;
const start = (prototype: boolean) => {
  cleanup(); sleeping = false; stage.replaceChildren(); run.disabled = before.disabled = true; delete status.dataset.result; status.textContent = 'Measuring…';
  const game = createWorld({ critterVersion: '2', issued: 100, critters: group.map((g, i) => ({ ...g, id: String(i) })), settings: { still: quiet.checked, simple: true, reducedMotion: quiet.checked }, outputs: { render2d: renderPortraits } }); world = game;
  const svgs = group.map((g, i) => {
    const box = h('div', undefined, 'stage'), svg = (prototype ? paintBefore : paintGarden)(document, generate2(g.address, g.variant), { finish: 'painted', decorative: true });
    game.critters[i]!.add(Portrait(svg)); box.append(svg, h('small', g.name)); stage.append(box); return svg;
  });
  let request = 0, first: number | undefined, last: number | undefined, finished = false; const deltas: number[] = [];
  const frame = (now: number) => {
    first ??= now; game.tick(now);
    if (last !== undefined && now - first > 1000 && !finished) deltas.push(now - last); last = now;
    if (!finished && now - first >= 7000) {
      finished = true; const sorted = [...deltas].sort((a, b) => a - b), mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      const result = { renderer: prototype ? 'prototype' : 'refined', frames: deltas.length, fps: +(1000 / mean).toFixed(1), medianMs: +sorted[Math.floor(sorted.length * .5)]!.toFixed(2), p95Ms: +sorted[Math.floor(sorted.length * .95)]!.toFixed(2), over50ms: deltas.filter(n => n > 50).length, still: quiet.checked, svgNodes: svgs.reduce((n, svg) => n + svg.querySelectorAll('*').length, 0), filters: stage.querySelectorAll('filter').length, viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, visibility: document.visibilityState, userAgent: navigator.userAgent };
      status.textContent = JSON.stringify(result); status.dataset.result = JSON.stringify(result); run.disabled = before.disabled = false;
    }
    request = requestAnimationFrame(frame);
  };
  request = requestAnimationFrame(frame);
  cleanup = () => { cancelAnimationFrame(request); svgs.forEach(disposePortrait); game.destroy(); world = undefined; run.disabled = before.disabled = false; };
};
stop.onclick = () => cleanup();
run.onclick = () => start(false); before.onclick = () => start(true);
quiet.onchange = () => world?.actions.setSettings({ still: quiet.checked, reducedMotion: quiet.checked });
sleep.onclick = () => { if (!world) return; sleeping = !sleeping; if (sleeping) world.actions.fallAsleep(); else { cleanup(); start(false); } };
crumb.onclick = () => { if (world && !sleeping) world.actions.giveCrumb(world.critters[0]!); };
addEventListener('pagehide', () => cleanup(), { once: true });

const data = section('data', 'Appearance and rollback boundaries', 'This is renderer garden-refined-review-1 over frozen generator v2 comparison inputs. It does not assign a production generator version or migrate saved identities. The application’s review choice is ?critters=garden in development, or an explicitly enabled VITE_GARDEN_REVIEW build. Remove the query or use ?critters=1 to return to the baseline.');
const record = h('a', 'Read the design record, verification and rollback instructions'); record.href = 'README.md'; data.append(record);
const seed = h('details'); seed.append(h('summary', 'Exact fixture data'), h('pre', JSON.stringify(fixtures, null, 2))); data.append(seed);
const links = h('p');
for (const [label, path] of [['Launcher', '/?critters=garden'], ['Scattering', '/dev/screens?critters=garden&capture&state=scatter&count=10&scene=window'], ['Results', '/dev/screens?critters=garden&capture&state=results&count=10&scene=window']] as const) { const a = h('a', label); a.href = path; links.append(a, document.createTextNode(' · ')); }
data.append(links);

const scenes = section('scenes', 'The portraits in the application', 'Unretouched captures from the integrated review renderer. Scattering and results use the app’s development fixtures. Launcher, first meeting and all four tutorial steps use the current app. Light game surfaces and dark tutorial surfaces retain the existing theme treatment.');
const captures = h('div', undefined, 'captures'); scenes.append(captures);
for (const [label, file] of [['Ten-critter scattering · desktop', 'scattering-desktop'], ['Ten-critter results · desktop', 'results-desktop'], ['First meeting · phone', 'onboarding-phone'], ['Worked result tutorial · phone', 'tutorial-4-phone']] as const) {
  const figure = h('figure'), link = h('a'), img = h('img'); link.href = `images/${file}.jpg`; img.src = link.href; img.alt = label; img.loading = 'lazy'; link.append(img); figure.append(link, h('figcaption', label)); captures.append(figure);
}
