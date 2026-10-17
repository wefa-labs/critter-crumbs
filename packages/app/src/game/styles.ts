import type { CSSProperties } from 'react';
import type { Rect } from './layout.js';

/**
 * The few values the core game's components hand to CSS: the icons' drawings and the custom properties that place a
 * cropped face, an element's colours and a scene's layers. Kept as data here so the components stay free of wording.
 */
export const ICON_PATHS = {
  left: { box: '0 0 20 20', d: 'M12.5 4l-6 6 6 6', stroke: 2.4 },
  right: { box: '0 0 20 20', d: 'M7.5 4l6 6-6 6', stroke: 2.4 },
  close: { box: '0 0 20 20', d: 'M5 5l10 10M15 5L5 15', stroke: 2.2 },
  leaf: { box: '0 0 16 16', d: 'M13.5 2.5c-6 0-10 3-10.5 9.5 3-5 7-6 8-6.5-1.5 2.5-5 4.5-8 5.5 4 1.5 9 0 10.5-8.5z', stroke: 0 },
  drop: { box: '0 0 16 16', d: 'M8 1.5C8 1.5 3 7 3 10a5 5 0 0 0 10 0c0-3-5-8.5-5-8.5z', stroke: 0 },
  flame: { box: '0 0 16 16', d: 'M8.5 1.5C9 5 12 6 12 10a4 4 0 0 1-8 0c0-1.5.6-2.5 1.3-3.3.1 1.2.8 1.8 1.5 1.8-.3-2.5.7-5 1.7-7z', stroke: 0 },
  cloud: { box: '0 0 16 16', d: 'M4.5 12.5a3 3 0 0 1-.4-6 4 4 0 0 1 7.6-1 3.5 3.5 0 0 1 .3 7z', stroke: 0 },
  music: { box: '0 0 20 20', d: 'M7 3.6 16.5 1.8v11a2.6 2.1 0 1 1-1.8-2V5.9L8.8 7v7.6a2.6 2.1 0 1 1-1.8-2z', stroke: 0 },
} as const;
export type IconName = keyof typeof ICON_PATHS;
export const ELEMENT_ICON = { earth: 'leaf', water: 'drop', fire: 'flame', air: 'cloud' } as const;
/** A version 2 critter's element (the generator's earth, water, fire or air). */
export type CritterElement = keyof typeof ELEMENT_ICON;
/** A stroke-drawn icon's line ends and joins. */
export const ROUND = 'round';
/** The focus row's name takes the largest size on the type scale that fits between − and +. */
export const NAME_SIZES = ['20', '16', '14'] as const;

/**
 * A rectangle placed by its left, top, width and height. The lengths carry their unit because the game's frame loop
 * assigns them to `element.style` directly, where a bare number is ignored unless it is 0 (QA lifecycle-02).
 */
export const rectStyle = (r: Rect): CSSProperties => ({ left: `${r.x}px`, top: `${r.y}px`, width: `${r.width}px`, height: `${r.height}px` });
export const elementStyle = (element: CritterElement) => ({ '--element-soft': `var(--cc-element-${element}-soft)`, '--element-shadow': `var(--cc-element-${element}-shadow)` }) as CSSProperties;
/** A face cropped to the head at any size, as the flow page's face(): the drawing 1.9 times the circle. */
export function faceCrop(size: number, headY: number, headX = .5, headRadius?: number) {
  const scale = headRadius === undefined ? 1.9 : Math.max(1.7, Math.min(3.2, .4 / headRadius));
  const width = size * scale, height = width * 150 / 120;
  return { '--face-size': `${size}px`, '--face-width': `${width}px`, '--face-top': `${size / 2 - headY * height}px`, '--face-left': `${size / 2 - headX * width}px` } as CSSProperties;
}
/** A scene's image filter by its token, so the look in use (light or dark) decides it. */
export const sceneFilterStyle = (token: string) => ({ '--scene-image-filter': `var(--cc-${token})` }) as CSSProperties;
export const sceneLayerStyle = (layers: { floor: string; wall: string; cornerL: string; cornerR: string }) => ({ '--scene-floor': `url(${layers.floor})`, '--scene-wall': `url(${layers.wall})`, '--scene-corner-left': `url(${layers.cornerL})`, '--scene-corner-right': `url(${layers.cornerR})` }) as CSSProperties;
