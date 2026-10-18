// Working sandbox (not a deliverable): fixtures in version 2 and each new direction, and a sampler of every species.
import { generate2 } from './core-shim.ts';
import { paintV2 } from '../../../../packages/app/src/portraits/painter-v2.ts';
import members from '../../../../packages/app/src/dev/game-members.ts';
import { paintGarden, gardenDraw, SPECIES, type GardenSpecies } from './garden.ts';
import { paintCompanion, companionDraw } from './companions.ts';

const root = document.getElementById('root')!, params = new URLSearchParams(location.search);
const size = Number(params.get('size') ?? 140), which = params.get('show') ?? 'fixtures', asleep = params.has('asleep'), delighted = params.has('delighted');
function row(label: string) { const r = document.createElement('div'); r.className = 'row'; r.dataset.label = label; root.append(r); return r; }
function cell(r: HTMLElement, svg: SVGSVGElement, caption = '') { const c = document.createElement('div'); c.className = 'cell'; c.style.width = `${size}px`; c.append(svg); if (caption) { const p = document.createElement('p'); p.textContent = caption; c.append(p); } r.append(c); }
if (which === 'one') {
  const m = members[Number(params.get('i') ?? 0)]!, p = generate2(m.address, 0);
  cell(row('one'), paintGarden(document, p, { finish: params.get('finish') === 'painted' ? 'painted' : 'ink' }), m.name);
} else if (which === 'fixtures') {
  const a = row('v2'), b = row('garden'), c = row('companions'), fedRow = params.has('fed') ? row('fed') : null;
  for (const m of members) {
    const p = generate2(m.address, 0);
    cell(a, paintV2(document, p, { name: m.name, decorative: true, size: 'stage', asleep }), `${m.name} · ${p.element}`);
    cell(b, paintGarden(document, p, { asleep, delighted }), gardenDraw(p).species);
    cell(c, paintCompanion(document, p, { asleep, delighted }), `${companionDraw(p).plan} · ${companionDraw(p).element}`);
    if (fedRow) cell(fedRow, paintCompanion(document, p, { fed: 0.6 }), 'fed 0.6');
  }
} else {
  // a sampler: synthetic addresses until every species has four examples
  const found = new Map<GardenSpecies, string[]>();
  for (let i = 1; i < 4000 && [...found.values()].reduce((s, v) => s + v.length, 0) < 32; i++) {
    const address = `0x${(i * 2654435761 >>> 0).toString(16).padStart(8, '0')}${'0'.repeat(32)}`, p = generate2(address, 0), sp = gardenDraw(p).species;
    const list = found.get(sp) ?? []; if (list.length < 4) { list.push(address); found.set(sp, list); }
  }
  for (const el of Object.keys(SPECIES) as (keyof typeof SPECIES)[]) for (const sp of SPECIES[el]) {
    const r = row(sp);
    for (const address of found.get(sp) ?? []) cell(r, paintGarden(document, generate2(address, 0), { asleep, delighted }), address.slice(0, 10));
  }
}
