import { useEffect, useRef, type ReactNode } from 'react';
import { formatCopy } from '@critter-crumbs/shared';
import { sceneCircle } from './invite-circle.js';
import { FloorCritter, PaintedFloor } from './painted-floor.js';
import { sheetScreenStyle, type Painting } from './painted-scene.js';
import { ScreenHeader } from './screen-header.js';
import { joinNames } from './time.js';
import { CritterFace, ProfileButton } from './ui.js';

/**
 * A connected screen as the flow page draws every one (docs/explorations/app-screens: hdr(), sceneLayer() and the
 * sheet; decision D1 of the November UI audit, docs/reviews/ui-audit-2026-11): the 64 px header, the painted floor with
 * critters standing on it, and one sheet for the words, which is the side panel on desktop. It is made of the invite's
 * and the first steps' pieces (.sheet-screen, .screen-floor and .screen-sheet in screens.css).
 *
 * - `title` names the screen: the header's h1 and the page's title. A `wordmark` screen shows the wordmark in the header
 *   instead, and its sheet carries the h1.
 * - `burrow` puts the burrow's name over the title, leading to `href`, its page; `back` puts a chevron at the left.
 * - `viewer` puts your critter's face at the right of the header; pressing it opens your profile.
 * - `painting` is the floor's painting and `floor` what stands on it: FloorCritter, FloorRing or FloorHeap, placed by
 *   their feet in percent of the floor and sized in the design's phone pixels.
 * - `sheetHeight` is the sheet's height on the design's 812 px phone; a shorter phone gets a shorter one.
 * - `actions` stay pinned at the sheet's foot while the rest of the sheet scrolls.
 * - `over` is for a screen drawn over the one it was opened from, which stays as it was beneath it (app.tsx, which also
 *   returns the focus): it takes the focus, Escape goes back, and on leaving it the page's title is the beneath one's.
 */
export function PlaceScreen({ title, wordmark = false, burrow, href, back, viewer, painting, floor, sheetHeight, actions, over = false, className = '', children }: {
  title: string; wordmark?: boolean; burrow?: string; href?: string; back?: () => void;
  viewer?: { address: string; variant: number; open: () => void };
  painting: Painting; floor: ReactNode; sheetHeight: number; actions?: ReactNode; over?: boolean; className?: string; children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  /* before the page's title changes, so that leaving can give the screen beneath its own back */
  useEffect(() => {
    if (!over) { document.getElementById('content')?.focus(); return; }
    const beneath = document.title;
    root.current?.focus();
    return () => { document.title = beneath; };
  }, [over]);
  useEffect(() => { document.title = burrow ? formatCopy('app.contextTitle', { screen: title, burrow }) : formatCopy('app.pageTitle', { title }); }, [title, burrow]);
  return (
    <section ref={root} className={`core-game place-screen ${className}`} aria-label={title} tabIndex={over ? -1 : undefined}
      onKeyDown={event => { if (over && back && event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); back(); } }}>
      <ScreenHeader {...(wordmark ? {} : { title })} {...(burrow ? { burrow } : {})} {...(href ? { href } : {})} {...(back ? { back } : {})}
        end={viewer ? <ProfileButton address={viewer.address} variant={viewer.variant} onClick={viewer.open} /> : null} />
      <div className="sheet-screen" style={sheetScreenStyle(sheetHeight)}>
        <PaintedFloor painting={painting} className="screen-floor">{floor}</PaintedFloor>
        <div className="screen-sheet place-sheet">
          <div className="place-words">{children}</div>
          {actions ? <div className="place-actions">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}

/** One of the critters in a ring: who it is, which of its drawings, and whether it is awake. */
export interface RingCritter { key: string; address: string; variant: number; asleep: boolean }

/**
 * Critters in a ring around the middle of the floor (flow page, circle(); invite-circle.ts), each awake or asleep: the
 * first at the front, the rest going round it, smaller at the back, each turned toward the middle.
 */
export function FloorRing({ critters }: { critters: readonly RingCritter[] }) {
  return <>{sceneCircle(critters.length).map(spot => {
    const { key, address, variant, asleep } = critters[spot.index]!;
    return <FloorCritter key={key} critter={{ x: spot.x, y: spot.y, size: spot.size, face: spot.face, address, variant, asleep }} />;
  })}</>;
}

/** One face in a row: whose, which of its drawings, its name for the not-yet line, and whether it has done the thing. */
export interface RowFace { key: string; address: string; variant: number; name: string; done: boolean }
/** The faces' size in the row, the flow page's 26 to 28 */
const ROW_FACE = 28;

/**
 * Who has done something, at a glance (flow page, faces()): the screen's own count ("3 of 8 statements written"), then
 * everyone's face in a row, those who have not yet dimmed, and under them who has not, by name (`notYet`, "Not yet: …").
 * The faces are for the eye; the two lines say it all to a screen reader.
 */
export function FaceRow({ count, faces, notYet }: { count: string; faces: readonly RowFace[]; notYet: 'gathering.notYet' | 'scatter.notYet' }) {
  const waiting = faces.filter(face => !face.done);
  return (
    <div className="face-row">
      <div className="face-row-count">
        <span>{count}</span>
        <span className="face-row-faces">{faces.map(face => <span key={face.key} className="face-row-face" data-done={face.done}><CritterFace address={face.address} variant={face.variant} name={face.name} size={ROW_FACE} /></span>)}</span>
      </div>
      {waiting.length ? <p className="face-row-waiting">{formatCopy(notYet, { names: joinNames(waiting.map(face => face.name)) })}</p> : null}
    </div>
  );
}
