import { copy } from '@critter-crumbs/shared';
import { ELEMENT_ICON, ICON_PATHS, ROUND, elementStyle, type CritterElement, type IconName } from './styles.js';
export type { CritterElement, IconName } from './styles.js';

/** The few icons the core game draws, from the review kit's sprite (docs/explorations/scatter-layouts/lib/kit.js). */
export function GameIcon({ name }: { name: IconName }) {
  const icon = ICON_PATHS[name];
  return (
    <svg className="game-icon" viewBox={icon.box} aria-hidden="true">
      {icon.stroke
        ? <path d={icon.d} fill="none" stroke="currentColor" strokeWidth={icon.stroke} strokeLinecap={ROUND} strokeLinejoin={ROUND} />
        : <path d={icon.d} fill="currentColor" />}
    </svg>
  );
}

/** A version 2 critter's element, as the review pages label a statement: icon and name on the element's soft colour. */
export function ElementChip({ element }: { element: CritterElement }) {
  return <span className="element-chip" style={elementStyle(element)}><GameIcon name={ELEMENT_ICON[element]} />{copy[`element.${element}`]}</span>;
}
