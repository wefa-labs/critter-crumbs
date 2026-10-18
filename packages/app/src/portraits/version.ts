import type { CritterVersion } from '@critter-crumbs/core';
import { canReviewGarden } from './review.js';
export const gardenReview = canReviewGarden(import.meta.env.DEV, import.meta.env.VITE_GARDEN_REVIEW, typeof location === 'undefined' ? '' : location.search);
/**
 * Change this setting only when Afolabi chooses to ship v2. Workshops may pin v1, and so may any development page
 * opened with ?critters=1, which is then drawn as production draws it: version 1, with 3D and its fallback.
 */
const asProduction = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).get('critters') === '1';
export const critterVersion: CritterVersion = gardenReview || import.meta.env.DEV && !asProduction ? '2' : '1';

export const meshVersions = new Set<CritterVersion>(['1']);
export const supportsMesh = (version:CritterVersion) => meshVersions.has(version);
