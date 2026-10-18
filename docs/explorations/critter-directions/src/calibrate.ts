// Calibration: the production (v1) and development (v2) painters, unchanged, for the review fixture set.
import { generate, generate2 } from './core-shim.ts';
import { createPortrait } from '../../../../packages/app/src/portraits/index.ts';
import { paintV2 } from '../../../../packages/app/src/portraits/painter-v2.ts';
import members from '../../../../packages/app/src/dev/game-members.ts';

const root = document.getElementById('root')!;
for (const size of [40, 64, 140] as const) {
  for (const version of ['1', '2'] as const) {
    const row = document.createElement('div'); row.className = 'row'; row.dataset.label = `v${version} · ${size}px`;
    for (const m of members) {
      const svg = version === '1' ? createPortrait(document, generate(m.address, 0), { name: m.name, decorative: true, size: 'stage' })
        : paintV2(document, generate2(m.address, 0), { name: m.name, decorative: true, size: 'stage' });
      const cell = document.createElement('div'); cell.className = 'cell'; cell.style.width = `${size}px`; cell.append(svg); row.append(cell);
    }
    root.append(row);
  }
}
