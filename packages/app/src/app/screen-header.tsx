import type { ReactNode } from 'react';
import { copy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
import { Link } from './ui.js';

/**
 * Where the app stands while it is in development: a chip beside the burrow line in every header, in place of the
 * banner over every screen (decision D2 of the November UI audit; the launcher's plate says it in a line). It reads
 * "Beta"; its name and the words under it say the rest to a screen reader.
 */
export function BetaChip() {
  return (
    <span className="beta-chip" role="note" aria-label={copy['app.environment.label']}>
      <span aria-hidden="true">{copy['app.environment.chip']}</span>
      <span className="sr-only">{copy['app.environment.badge']} {copy['app.environment.help']}</span>
    </span>
  );
}

/**
 * The 64 px header over every screen with a floor (flow page, hdr()): a back chevron where the screen has somewhere to
 * go back to, the burrow's line over the screen's title, and at the right your critter's face, or Connect, or the Music
 * toggle (`end`). A screen with no place of its own yet (the first meeting, the first steps) has the wordmark instead
 * of a title, and carries its h1 in its sheet. The beta chip stands beside the burrow line, or beside the title or the
 * wordmark where there is none. `children` go between the title and the right: the game's closing line on desktop.
 */
export function ScreenHeader({ title, burrow, href = '/', back, end, children }: {
  /** the screen's h1; without one, the wordmark */
  title?: string;
  /** the line over the title, and where it leads: the burrow */
  burrow?: string; href?: string;
  back?: () => void;
  end?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="game-header">
      {back ? <button type="button" className="screen-back" aria-label={copy['action.back']} onClick={back}><GameIcon name="left" /></button> : null}
      {title === undefined
        ? <div className="screen-mark"><Link href="/" className="wordmark">{copy['app.name']}</Link><BetaChip /></div>
        : burrow
          ? <div className="game-context"><div className="game-line"><Link className="game-burrow" href={href}>{burrow}</Link><BetaChip /></div><h1>{title}</h1></div>
          : <div className="screen-title"><h1>{title}</h1><BetaChip /></div>}
      {children}
      {end}
    </header>
  );
}
