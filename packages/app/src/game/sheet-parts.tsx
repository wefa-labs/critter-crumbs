import type { ReactNode } from 'react';
import { GameIcon } from './icons.js';

/**
 * The small pieces a sheet is made of, shared by the core game's surfaces (surface.tsx) and the screens around it. In a
 * module of their own so that those screens do not bring the statement and results surfaces into the app shell
 * (Technical Spec §17).
 */

/** In a sheet, pushes what follows it to the foot. */
export const Grow = () => <div className="sheet-grow" />;

/** A notice inside a sheet: a leaf beside the line, or a cloud when something is not right yet. Not a live region. */
export function SheetNotice({ trouble = false, children }: { trouble?: boolean; children: ReactNode }) {
  return trouble
    ? <div className="sheet-notice"><GameIcon name="cloud" /><span>{children}</span></div>
    : <div className="sheet-notice"><GameIcon name="leaf" /><span>{children}</span></div>;
}

/** Three bobbing crumbs while the feast is laid out. */
export function Loader({ crumb }: { crumb: ReactNode }) {
  return <div className="sheet-loader" aria-hidden="true">{[0, 1, 2].map(index => <span key={index}>{crumb}</span>)}</div>;
}
