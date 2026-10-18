import type { CritterV2 } from '@critter-crumbs/core';
import type { PortraitOptions } from './index.js';
import type { PortraitExtent } from './metrics.js';
type GardenRenderer = {
  paint: (document: Document, params: CritterV2, state: PortraitOptions & { delighted?: boolean }) => SVGSVGElement;
  metrics: (params: CritterV2, fed: number) => { extent: PortraitExtent };
};
let renderer: GardenRenderer | undefined;
export function registerGardenRenderer(value: GardenRenderer) { renderer = value; }
export function gardenRenderer() {
  if (!renderer) throw new Error('Garden review renderer has not loaded');
  return renderer;
}
