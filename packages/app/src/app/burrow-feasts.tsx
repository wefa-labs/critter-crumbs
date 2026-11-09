import { useState } from 'react';
import { phaseAt } from '@critter-crumbs/core';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import { Faces, useRereadOnChange } from './burrow-parts.js';
import { feastAction, feastDay, feastProgress, progressFaces, sameAddress, weekdayDate, type BurrowFeast, type BurrowView, type OpenPhase, type UnderWay } from './burrow-view.js';
import { deadlineLine, phaseCopy } from './deadline-lines.js';
import type { MemberFeast } from './feast-view.js';
import { FaceRow, type RowFace } from './place-screen.js';
import type { AppApi } from './session.js';
import { absoluteDeadline, joinNames } from './time.js';
import { CritterFace, Dialog, Link, useResource } from './ui.js';

/** How a feast's card counts who has done this phase's part, and names who has not (PRD R5 and P3). */
const COUNTS = {
  scattering: { count: (done: number, total: number) => formatCopy('scatter.participation', { done, total }), notYet: 'scatter.notYet' },
  gathering: { count: (done: number, total: number) => formatCopy('gathering.participation', { written: done, total }), notYet: 'gathering.notYet' },
} as const satisfies Record<OpenPhase, unknown>;

/**
 * A feast under way, first on the burrow's page (flow page, feastCard(); the November UI audit's screen 17): its title
 * and phase, when it closes, who has done this phase's part so far with their faces, and the action for the phase
 * (burrow-view.ts, feastAction). While scattering, the count opens the list of who has scattered and who has not
 * (audit decision D5). Who has done what is the feast's own view, asked for again every half minute and when the
 * feast's phase changes. Only the card closing next has its action in gold (`primary`), so a burrow with two feasts
 * under way still has one gold action (the audit's X5).
 */
export function FeastCard({ underWay: { feast, phase, closes }, primary, view, api, you, now }: { underWay: UnderWay; primary: boolean; view: BurrowView; api: AppApi; you: string; now: number }) {
  const { data, refresh } = useResource<MemberFeast>(api, `/api/feasts/${feast.id}`), [listing, setListing] = useState(false);
  useRereadOnChange(phase, refresh);
  const progress = data && feastProgress(data, phase), faces = progress?.length ? progressFaces(progress, view.members) : null;
  const action = feastAction(phase, data, you), counts = COUNTS[phase];
  const count = faces ? counts.count(faces.filter(face => face.done).length, faces.length) : '';
  const waiting = faces?.filter(face => !face.done) ?? [];
  return (
    <section className="burrow-feast">
      <div className="place-heading"><h2 className="burrow-heading">{feast.title}</h2><span className="chip">{copy[phaseCopy[phase]]}</span></div>
      <p className="burrow-feast-line">{formatCopy('deadline.line', { deadline: deadlineLine(phase, closes, now, true), date: absoluteDeadline(closes) })}</p>
      {faces ? phase === 'scattering'
        /* the count opens the list; the button lies over the row, which says it all to the eye, and its name says it to a screen reader */
        ? <div className="burrow-feast-who">
          <div aria-hidden="true"><FaceRow count={count} faces={faces} notYet={counts.notYet} /></div>
          <button type="button" className="burrow-feast-open" aria-label={waiting.length ? `${count}. ${formatCopy('scatter.notYet', { names: joinNames(waiting.map(face => face.name)) })}` : count} onClick={() => setListing(true)} />
        </div>
        : <FaceRow count={count} faces={faces} notYet={counts.notYet} /> : null}
      {action ? <Link className={primary ? 'pill wide' : 'pill soft wide'} href={`/feasts/${feast.id}`}>{copy[action]}</Link> : null}
      {listing && faces ? <WhoScattered count={count} faces={faces} you={you} close={() => setListing(false)} /> : null}
    </section>
  );
}

/**
 * Who has scattered (flow page, SCREENS['who-scattered']; audit decision D5): the count as the title, so the rows carry
 * names only, you marked as you; then who has not yet, their faces dimmed, in one line. Close is the way out.
 */
function WhoScattered({ count, faces, you, close }: { count: string; faces: readonly RowFace[]; you: string; close: () => void }) {
  const scattered = faces.filter(face => face.done), waiting = faces.filter(face => !face.done);
  return (
    <Dialog title={count} onClose={close} dismiss="action.close" className="game-dialog burrow-who">
      {scattered.length ? <ul role="list" className="burrow-rows">{scattered.map(face => (
        <li key={face.key} className="burrow-row"><CritterFace address={face.address} variant={face.variant} name={face.name} size={32} /><b>{sameAddress(face.address, you) ? formatCopy('burrow.members.you', { name: face.name }) : face.name}</b></li>
      ))}</ul> : null}
      {waiting.length ? <div className="burrow-waiting">
        <Faces faces={waiting} size={28} />
        <p>{formatCopy('scatter.notYet', { names: joinNames(waiting.map(face => face.name)) })}</p>
      </div> : null}
    </Dialog>
  );
}

/**
 * The burrow's other feasts under Feasts (flow page, the rows on SCREENS.burrow): a creator's drafts and the feasts that
 * have ended, each a row with its day and a chip for how it stands, which opens the feast. A people feast that ended
 * because fewer than three critters were left when scattering opened says so under its row, as a leaf notice (PRD R6
 * and P11; flow page, SCREENS.offline; audit screen 52), rather than as a card that still counts down.
 */
export function FeastRows({ feasts, now }: { feasts: readonly BurrowFeast[]; now: number }) {
  return <>
    <h2 className="burrow-heading">{copy['burrow.feasts.title']}</h2>
    <ul role="list" className="burrow-rows">{feasts.map(feast => {
      const phase = phaseAt(feast, now), day = feastDay(feast, phase);
      return <li key={feast.id}>
        <Link className="burrow-row burrow-feast-row" href={`/feasts/${feast.id}`}>
          <span className="burrow-row-words"><b>{feast.title}</b><time dateTime={new Date(day).toISOString()}>{weekdayDate(day)}</time></span>
          <span className="chip">{copy[phaseCopy[phase]]}</span>
        </Link>
        {phase === 'void' ? <SheetNotice>{formatCopy('feast.tooFew', { feastTitle: feast.title })}</SheetNotice> : null}
      </li>;
    })}</ul>
  </>;
}
