import type { CritterVersion } from '@critter-crumbs/core';
import { critterLook } from './look.js';
const look = critterLook(import.meta.env.DEV, typeof location === 'undefined' ? '' : location.search);
/** Garden Spirits paint version 2 parameters; a page opened with ?critters=1 draws version 1, with 3D and its fallback. */
export const gardenSpirits = look === 'garden';
export const critterVersion: CritterVersion = look === 'baseline' ? '1' : '2';

export const meshVersions = new Set<CritterVersion>(['1']);
export const supportsMesh = (version:CritterVersion) => meshVersions.has(version);
