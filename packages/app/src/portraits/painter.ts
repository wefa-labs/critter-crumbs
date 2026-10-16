import type { VersionedCritter } from '@critter-crumbs/core';
import { createPortrait, type PortraitOptions } from './index.js';
import { critterVersion, gardenReview } from './version.js';
import { gardenRenderer } from './garden-registry.js';
import { paintV2, inkedPortraitLook, type PortraitLook } from './painter-v2.js';
export type { PortraitLook } from './painter-v2.js';
/** The build setting keeps the October painter out of production until its release is chosen. */
export function paintCritter(document:Document,params:VersionedCritter,state:PortraitOptions&{delighted?:boolean},look?:PortraitLook){
 if(gardenReview&&params.version==='2')return gardenRenderer().paint(document,params,state);
 if(import.meta.env.DEV&&critterVersion==='2'&&params.version==='2')return paintV2(document,params,state,look??inkedPortraitLook);
 if(params.version!=='1')throw new RangeError('The selected build has no painter for this version');
 return createPortrait(document,params,state);
}
