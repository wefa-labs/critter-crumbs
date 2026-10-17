import type { CSSProperties } from 'react';
import { gardenReview } from '../portraits/version.js';

/**
 * A screen's painted floor, as the flow page draws it (docs/explorations/app-screens, sceneLayer): one of the project's
 * paintings, and critters, heaps and pods standing on it by their feet. Every position is the feet, in percent of the
 * scene; every size is the drawing's width in the design's phone pixels, which the stylesheet scales to the screen.
 * A room-scene instead uses the 1600 × 897 painting's coordinates and pixels (learn-steps.ts).
 */
export type Painting = 'window' | 'dusk';
export type Facing = 'left' | 'right' | null;
export interface Standing { x: number; y: number; size: number }
export interface SceneCritter extends Standing { address: string; /** which of the address's drawings, for a critter someone re-rolled; the first unless given */ variant?: number; asleep: boolean; face: Facing }
export interface SceneHeap extends Standing { crumbs: number }
/**
 * Where something stands on desktop when the two halves of a scene gather either side of a card: `side` is the card's
 * edge it stands beside and `beside` its distance from that edge, in the design's desktop pixels.
 */
export interface Beside { side: -1 | 1; beside: number }

/** The review burrow's critters (docs/explorations/scatter-layouts/lib/kit.js, MEMBERS), by the address each is drawn from. */
export const MOSS = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', FERN = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF';
export const JUNIPER = '0xF1F6619B38A98d6De0800F1DefC0a6399eB6d30C', CLOVER = '0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718';
/**
 * Which drawing of an opening critter the launcher and the first steps show: the first, except under the Garden Spirits
 * review art, which draws Moss's first as a pale lichen moth like Juniper's. There Moss shows its third, an ember fox,
 * so the four are one critter of each element (packages/app/test/garden-review.test.ts).
 */
export const openingVariant = (address: string, review = gardenReview) => review && address === MOSS ? 2 : 0;

/**
 * The launcher: four critters dozing around a heap of ten crumbs; on desktop they gather either side of the card. They
 * are drawn about 1.4 times the flow page's, which stands them at the height of the painting's table and cushions
 * (docs/decisions.md, 2026-10-11).
 */
export const LAUNCHER_SCENE: { painting: Painting; critters: readonly (SceneCritter & Beside)[]; heap: SceneHeap & Beside } = {
  painting: 'window',
  critters: [
    { address: MOSS, variant: openingVariant(MOSS), x: 17, y: 90, size: 124, asleep: true, face: 'right', side: -1, beside: 300 },
    { address: CLOVER, variant: openingVariant(CLOVER), x: 38, y: 94, size: 138, asleep: false, face: null, side: -1, beside: 140 },
    { address: JUNIPER, variant: openingVariant(JUNIPER), x: 64, y: 93, size: 140, asleep: false, face: 'left', side: 1, beside: 140 },
    { address: FERN, variant: openingVariant(FERN), x: 84, y: 89, size: 118, asleep: true, face: 'left', side: 1, beside: 300 },
  ],
  heap: { crumbs: 10, x: 51, y: 95, size: 80, side: -1, beside: 64 },
};

/** Arriving by a link: the feast's own critters asleep in a ring, over a sheet 400 pixels tall on the phone. */
export const INVITE_SCENE: { painting: Painting; sheetHeight: number } = { painting: 'window', sheetHeight: 400 };

/**
 * A screen whose words are in a sheet under the floor (the side panel on desktop): the sheet's height on the phone, and
 * with it the height the design's 812-pixel phone leaves the floor between the 64-pixel header and the sheet, which
 * rises 24 pixels over the floor's foot. The stylesheet scales the floor's drawings from the two.
 */
export const sheetScreenStyle = (sheetHeight: number) => ({ '--sheet-h': `${sheetHeight}px`, '--floor-h': 812 - 64 - sheetHeight + 24 }) as CSSProperties;

/** Where a drawing stands, handed to the stylesheet. */
export const standingStyle = ({ x, y, size }: Standing, beside?: Beside) =>
  ({ '--x': x, '--y': y, '--size': size, ...(beside ? { '--side': beside.side, '--beside': beside.beside } : {}) }) as CSSProperties;
