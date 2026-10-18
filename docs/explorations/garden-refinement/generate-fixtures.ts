import { writeFileSync } from 'node:fs';
import { generate2 } from '@critter-crumbs/core';
import { gardenDraw, gardenLayout, SPECIES_NAMES, type GardenSpecies } from '../../../packages/app/src/portraits/garden/species.js';
const order: GardenSpecies[] = ['squirrel', 'moth', 'turtle', 'koi', 'fox', 'phoenix', 'lemur', 'lamb'];
const groups = new Map<GardenSpecies, { species: GardenSpecies; name: string; address: string; variants: number[] }>();
for (let n = 1; n < 20000 && groups.size < 8; n++) {
  const address = `0x${n.toString(16).padStart(40, '0')}`, variants = [0, 1, 2];
  const draws = variants.map(variant => gardenDraw(generate2(address, variant)));
  const species = draws[0]!.species;
  if (!groups.has(species) && draws.every(draw => draw.species === species)) groups.set(species, { species, name: SPECIES_NAMES[species], address, variants });
}
if (groups.size !== 8) throw new Error('Could not find the complete eight-species fixture set');
writeFileSync(new URL('./fixtures.json', import.meta.url), JSON.stringify({ generatorVersion: '2', renderer: 'garden-refined-review-1', note: 'Comparison fixtures selected to keep one species across variants 0–2; ordinary rerolls can change species. No saved identities are changed.', groups: order.map(species => groups.get(species)!) }, null, 2) + '\n');
writeFileSync(new URL('./anchors.json', import.meta.url), JSON.stringify({ box: [120, 150], contact: [60, 140], units: 'Normalised to the SVG viewBox; hover is the authored ground-to-body offset.', fixtures: order.flatMap(species => {
  const group = groups.get(species)!;
  return group.variants.map(variant => ({ species, address: group.address, variant, ...gardenLayout(gardenDraw(generate2(group.address, variant))).extent }));
}) }, null, 2) + '\n');
