import type { CritterVersion } from '@critter-crumbs/core';
/** Change this setting only when Afolabi chooses to ship v2. Workshops may pin v1. */
export const critterVersion: CritterVersion = import.meta.env.DEV ? '2' : '1';

export const meshVersions = new Set<CritterVersion>(['1']);
export const supportsMesh = (version:CritterVersion) => meshVersions.has(version);
