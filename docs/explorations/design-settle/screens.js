// Phone screens built with the markup and class names of packages/app/src/app (app.tsx, feast.tsx,
// scatter.tsx, read.tsx, results.tsx, heap.ts), so the app's own app.css styles them unchanged.
// The data is the rehearsal seed: fixtures/statements.json on the eight rehearsal accounts.
import { copy, formatCopy } from './copy.js';
import { createPortrait } from './portrait.js';

export const BURROW = 'Rehearsal burrow';
export const FEAST = { title: 'Our shared work', crumbs: 100 };
export const MEMBERS = [
  ['Moss', '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', 'I planted six fruit trees and kept the shared garden watered.'],
  ['Fern', '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF', 'I repaired the library shelves and organised our book swap.'],
  ['Pebble', '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69', 'I cooked lunch for the workshop and cleaned the community kitchen.'],
  ['Clover', '0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718', 'I checked in with neighbours and arranged two accessible lifts.'],
  ['Hazel', '0xe1AB8145F7E55DC933D51a18c793F901A3A0b276', 'I balanced the shared expenses and published clear receipts.'],
  ['Willow', '0xE57bFE9F44b819898F47BF37E5AF72a0783e1141', 'I hosted the repair afternoon and fixed four bicycles.'],
  ['Acorn', '0xd41c057fd1c78805AAC12B0A94a405c0461A6FBb', 'I gathered supplies and helped prepare the next planting day.'],
  ['Juniper', '0xF1F6619B38A98d6De0800F1DefC0a6399eB6d30C', 'I welcomed three new neighbours and shared our meeting notes.'],
].map(([name, address, statement], index) => ({ id: `target-${index}`, name, address, statement }));
export const VIEWER = 7;
const GIVEN = [24, 20, 14, 12, 10, 8, 0, 0];
const RECEIVED = [142, 118, 96, 88, 81, 67, 58, 50];
const NOT_SCATTERED = ['Acorn'];
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function maker(document) {
  return function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === false || value === null || value === undefined) continue;
      if (key === 'class') node.className = value; else node.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
    }
    return node;
  };
}

/**
 * ctx: { document, critters, mode ('v1' | 'v2' | 'art'), view ('3d' | 'simple'), ink, eyeWhite,
 *        arrival { src }, art(critter) → url, meshes [] (filled here), after [] (filled here) }
 */
export function buildScreen(screen, ctx) {
  const h = maker(ctx.document), critters = ctx.critters, viewer = critters[VIEWER];
  const portrait = (critter, size, options = {}) => createPortrait(ctx.document, critter.params, { name: critter.name, size, ink: ctx.ink, eyeWhite: ctx.eyeWhite, ...options });
  function slot(critter, size, options) {
    if (ctx.mode === 'art') return h('div', { class: 'portrait-slot' }, h('img', { class: 'art-slot', src: ctx.art(critter), alt: '', width: size, height: size * 1.25 }));
    return h('div', { class: 'portrait-slot' }, portrait(critter, size, options));
  }
  function stage(critter, { asleep = false, fed = 0, decorative = true, mesh = true, stats } = {}) {
    const host = h('div', { class: 'stage', 'data-critter-id': critter.id });
    if (ctx.mode === 'art') { host.append(h('img', { class: 'art-still', src: ctx.art(critter), alt: '' })); return host; }
    host.append(portrait(critter, 'stage', { asleep, fed, decorative }));
    if (mesh && ctx.view === '3d') ctx.meshes.push({ host, critter, asleep, fed, stats });
    return host;
  }
  function header({ connected, phase, deadlines = [] }) {
    const nav = connected
      ? [h('button', { class: 'quiet connected-name' }, slot(viewer, 40), viewer.name), h('button', { class: 'quiet' }, copy['action.disconnect'])]
      : [h('button', {}, copy['action.connect'])];
    const top = phase ? h('div', { class: 'feast-top' },
      h('p', {}, formatCopy('arrive.burrow', { burrowName: BURROW, n: critters.length })),
      h('span', { class: 'chip' }, copy[`phase.${phase}`]),
      h('div', { class: 'deadline-strip', 'aria-live': 'off' }, deadlines.map(text => h('div', { class: 'deadline' }, h('button', { class: 'quiet', 'aria-expanded': 'false' }, text))))) : null;
    return h('header', {}, h('a', { href: '#', class: 'brand' }, copy['app.name']),
      h('nav', { class: 'actions', 'aria-label': copy['app.navigation'] }, nav, h('button', { class: 'secondary' }, copy['action.settings'])),
      h('div', { id: 'feast-header' }, top));
  }
  function heap(remaining, issued) {
    const ns = 'http://www.w3.org/2000/svg', svg = ctx.document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 96 56'); svg.setAttribute('aria-hidden', 'true');
    const visible = Math.ceil(remaining / issued * 24);
    for (let index = 0; index < 24; index++) {
      const row = index < 11 ? 0 : index < 19 ? 1 : 2, col = index - (row === 0 ? 0 : row === 1 ? 11 : 19), n = [11, 8, 5][row];
      const group = ctx.document.createElementNS(ns, 'g'), glyph = ctx.document.createElementNS(ns, 'svg');
      const rotation = ((index * 17 + 11) % 51) - 25, scale = .9 + ((index * 7) % 21) / 100;
      group.setAttribute('transform', `translate(${48 + (col - (n - 1) / 2) * 7.2} ${45 - row * 13}) rotate(${rotation}) scale(${scale})`);
      for (const [key, value] of Object.entries({ viewBox: '-8 -8 16 16', x: -8, y: -8, width: 16, height: 16, class: 'crumb-glyph' })) glyph.setAttribute(key, String(value));
      const path = ctx.document.createElementNS(ns, 'path'); path.setAttribute('d', 'M-6-3 -1-6 5-4 7 1 2 6 -5 4Z');
      const fleck = ctx.document.createElementNS(ns, 'path'); fleck.setAttribute('d', 'M-3-3 -1-4 1-3'); fleck.setAttribute('class', 'crumb-fleck');
      glyph.append(path, fleck); group.append(glyph); svg.append(group);
      group.style.display = index < (visible || 3) ? '' : 'none';
      if (visible === 0) group.classList.add('empty-crumb');
    }
    return svg;
  }
  const statementDetails = critter => h('details', {}, h('summary', {}, critter.statement.split('\n')[0]), h('div', { class: 'statement-text' }, critter.statement));
  const feastLink = () => h('a', { href: '#' }, BURROW);

  if (screen === 'arrival') return [
    header({ connected: false }),
    h('main', { id: 'content' }, h('h1', {}, copy['app.tagline']),
      h('section', { class: 'arrival' }, h('div', {}, h('p', {}, copy['arrive.explainer']), h('button', {}, copy['arrive.cta'])), h('img', { src: ctx.arrival.src, alt: '', width: 960, height: 538 }))),
  ];

  if (screen === 'meet') {
    const dialog = h('dialog', { class: 'mock-modal', open: true, 'aria-labelledby': 'meet-title' },
      h('div', { class: 'dialog-heading' }, h('h2', { id: 'meet-title' }, copy['critter.meet.title']), h('button', { class: 'secondary' }, copy['action.close'])),
      h('div', { class: 'meet-portrait' }, stage(viewer, { decorative: false, mesh: false })),
      h('p', {}, formatCopy('critter.meet.body', { max: 4 })),
      h('div', { class: 'actions' }, h('button', { class: 'secondary' }, formatCopy('critter.reroll', { remaining: 4 })), h('button', {}, copy['critter.keep'])));
    return [
      header({ connected: true }),
      h('main', { id: 'content' }, h('h1', {}, copy['home.title']), h('div', { class: 'page-actions' }, h('a', { class: 'button', href: '#' }, copy['home.empty.cta'])),
        h('ul', { role: 'list', class: 'link-list' }, h('li', {}, h('div', {}, h('a', { href: '#' }, BURROW), h('small', {}, `${formatCopy('home.critterCount', { n: critters.length })} · ${formatCopy('home.nextDeadline', { deadline: 'Friday 2 October, 18:00' })}`))))),
      h('div', { class: 'mock-backdrop' }), dialog,
    ];
  }

  if (screen === 'scatter') {
    const given = [...GIVEN], issued = FEAST.crumbs;
    const remaining = () => issued - given.reduce((sum, value) => sum + value, 0);
    const pileCount = h('p', {}), pileHelp = h('small', {}), heapHost = h('div', { class: 'pile-heap' }), submit = h('button', { 'data-sound': 'ui.tap' }, copy['scatter.submit']);
    const outputs = [];
    function refresh() {
      const left = remaining();
      pileCount.className = left ? 'pile-count' : 'chip pile-empty';
      pileCount.textContent = left ? formatCopy('pile.remaining', { n: left }) : copy['pile.empty'];
      pileHelp.textContent = left ? formatCopy('scatter.submit.help', { n: issued }) : '';
      pileHelp.hidden = !left;
      submit.setAttribute('aria-disabled', String(left !== 0));
      heapHost.replaceChildren(heap(left, issued));
      for (const { index, input, visual, spoken, minus, plus } of outputs) {
        input.value = String(given[index]); visual.textContent = String(given[index]); spoken.textContent = String(given[index]);
        minus.setAttribute('aria-disabled', String(given[index] === 0)); plus.setAttribute('aria-disabled', String(left === 0));
      }
    }
    function controls(critter, index) {
      const button = direction => h('button', { type: 'button', 'data-give': String(direction > 0), class: 'secondary crumb-control', 'aria-label': formatCopy(direction > 0 ? 'scatter.add' : 'scatter.remove', { name: critter.name }) }, direction > 0 ? copy['scatter.add.symbol'] : copy['scatter.remove.symbol']);
      const minus = button(-1), plus = button(1);
      const input = h('input', { 'data-editing': 'false', type: 'text', inputmode: 'numeric', pattern: '[0-9]*', 'aria-label': formatCopy('scatter.count.label', { name: critter.name }), readonly: true });
      const visual = h('span', { 'aria-hidden': 'true' }), spoken = h('span', { class: 'sr-only' });
      minus.addEventListener('click', () => { if (given[index] > 0) { given[index] -= 1; refresh(); } });
      plus.addEventListener('click', () => { if (remaining() > 0) { given[index] += 1; refresh(); } });
      outputs.push({ index, input, visual, spoken, minus, plus });
      return h('div', { class: 'scatter-controls', 'data-pouring': 'false' }, minus, h('div', { class: 'number-field' }, input, h('output', { 'aria-live': 'off', class: 'count-output' }, visual, spoken)), plus);
    }
    const cells = critters.map((critter, index) => h('li', { class: 'critter-cell' },
      h('div', { class: 'stage-input' }, stage(critter, { asleep: index === VIEWER })), h('h2', {}, critter.name), statementDetails(critter),
      index === VIEWER ? h('div', { class: 'own-critter' }, h('strong', {}, copy['scatter.own.label']), h('p', {}, copy['scatter.own.body'])) : controls(critter, index)));
    const surface = h('section', { class: 'scatter-surface' },
      h('p', {}, copy['scatter.instruction']),
      h('p', {}, formatCopy('scatter.participation', { done: 5, total: critters.length })),
      h('p', {}, formatCopy('scatter.notYet', { names: 'Willow, Acorn, Juniper' })),
      h('ul', { role: 'list', class: 'critter-grid' }, cells),
      h('aside', { class: 'pile-bar', 'aria-label': copy['pile.label'] }, heapHost, h('div', {}, pileCount, pileHelp), submit));
    refresh();
    return [
      header({ connected: true, phase: 'scattering', deadlines: [formatCopy('deadline.closed', { phase: copy['phase.gathering'], relative: relative.format(-2, 'day') }), formatCopy('deadline.scattering', { relative: relative.format(2, 'day') })] }),
      h('main', { id: 'content' }, h('h1', {}, FEAST.title), feastLink(), surface),
    ];
  }

  if (screen === 'read') return [
    header({ connected: true, phase: 'scattering', deadlines: [formatCopy('deadline.closed', { phase: copy['phase.gathering'], relative: relative.format(-2, 'day') }), formatCopy('deadline.scattering', { relative: relative.format(2, 'day') })] }),
    h('main', { id: 'content' }, h('h1', {}, FEAST.title), feastLink(),
      h('section', {}, h('div', { class: 'actions' }, h('p', { 'aria-live': 'off' }, formatCopy('read.position', { i: 1, n: critters.length })), h('button', { class: 'secondary', disabled: true }, copy['read.prev']), h('button', { class: 'secondary' }, copy['read.next']), h('a', { href: '#' }, copy['read.skip'])),
        h('ul', { role: 'list', class: 'read-carousel', tabindex: 0 }, critters.map((critter, index) => h('li', { 'data-index': index },
          h('article', { 'aria-labelledby': critter.id }, slot(critter, 64), h('h2', { id: critter.id }, critter.name), h('div', { class: 'statement-text' }, critter.statement))))))),
  ];

  if (screen === 'feast') {
    const total = RECEIVED.reduce((sum, value) => sum + value, 0);
    const percent = new Intl.NumberFormat('en', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const fed = index => Math.min(1, RECEIVED[index] / total * critters.length / 2.5) ** 0.75;
    const heapHost = h('div', { class: 'feast-heap', 'aria-hidden': 'true' }, heap(0, 1));
    const rows = critters.map((critter, index) => ({ critter, crumbs: RECEIVED[index] })).sort((a, b) => b.crumbs - a.crumbs);
    return [
      header({ connected: true, phase: 'feast', deadlines: [formatCopy('deadline.closed', { phase: copy['phase.gathering'], relative: relative.format(-4, 'day') }), formatCopy('deadline.closed', { phase: copy['phase.scattering'], relative: relative.format(-2, 'hour') })] }),
      h('main', { id: 'content' }, h('p', { class: 'feast-title' }, FEAST.title), feastLink(),
        h('section', { class: 'feast-results' },
          h('div', { class: 'actions' }, h('h1', { tabindex: -1 }, copy['results.title']), h('button', {}, copy['feast.replay'])),
          heapHost, h('p', { class: 'feast-total' }, String(total)),
          h('ul', { role: 'list', class: 'critter-grid' }, critters.map((critter, index) => h('li', { class: 'critter-cell' }, stage(critter, { fed: fed(index) }), h('h2', {}, critter.name), h('p', {}, formatCopy('results.received', { n: RECEIVED[index] }))))),
          h('div', { class: 'table-scroll' }, h('table', {}, h('caption', {}, formatCopy('results.caption', { feastTitle: FEAST.title })),
            h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, copy['results.col.critter']), h('th', { scope: 'col' }, copy['results.col.crumbs']), h('th', { scope: 'col' }, copy['results.col.share']))),
            h('tbody', {}, rows.map(({ critter, crumbs }) => h('tr', {}, h('th', { scope: 'row' }, h('div', { class: 'result-name' }, slot(critter, 40), critter.name)), h('td', {}, String(crumbs)), h('td', {}, percent.format(crumbs / total))))))),
          h('p', {}, formatCopy('results.summary', { scatterers: critters.length - NOT_SCATTERED.length, total: critters.length, totalCrumbs: total })),
          h('p', {}, formatCopy('results.didNotScatter', { names: NOT_SCATTERED.join(', ') })),
          h('p', {}, copy['results.private']),
          h('div', { class: 'actions' }, h('button', {}, copy['results.export'])),
          h('details', {}, h('summary', {}, copy['results.verification']), h('code', { class: 'receipt-evidence' }, '0xdc4525921c05a9b00c20b03fd59e291cd46df7982dad1418bbdcf4c3b1d1ae4c')))),
    ];
  }

  // Close-up: not an app screen. Each stage at the phone's full width so surface details read.
  return [
    header({ connected: true }),
    h('main', { id: 'content' }, h('h1', {}, 'Close-up'), h('p', {}, 'Not an app screen: each stage at the full phone width, awake and unfed.'),
      h('ul', { role: 'list', class: 'critter-grid', style: 'grid-template-columns:1fr' }, critters.map(critter => {
        const stats = h('p', { class: 'mock-stats' }, ctx.mode === 'art' ? 'Deck art (a painting, not generated)' : ctx.view === '3d' ? 'Rendering…' : 'Portrait (SVG)');
        const element = critter.params.element ? h('p', { class: 'mock-stats' }, critter.params.element[0].toUpperCase() + critter.params.element.slice(1)) : null;
        return h('li', { class: 'critter-cell' }, stage(critter, { stats }), h('h2', {}, critter.name), element, stats);
      }))),
  ];
}
