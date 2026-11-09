import { useState } from 'react';
import { phaseAt } from '@critter-crumbs/core';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import { dayLabel, feastAction, feastDay, feastProgress, sameAddress, type BurrowFeast, type BurrowView, type UnderWay } from './burrow-view.js';
import { deadlineLine, phaseCopy } from './deadline-lines.js';
import type { MemberFeast } from './feast-view.js';
import { FaceRow, type RowFace } from './place-screen.js';
import type { AppApi } from './session.js';
import { absoluteDeadline, joinNames } from './time.js';
import { CritterFace, Dialog, Link, displayName, shortAddress, useResource } from './ui.js';

/**
 * A feast under way, first on the burrow's page (flow page, feastCard(); the November UI audit's screen 17): its title
 * and phase, when it closes, who has done this phase's part so far with their faces (PRD R5 and P3), and the one gold
 * action for the phase (burrow-view.ts, feastAction). While scattering, the count opens the list of who has scattered
 * and who has not (audit decision D5). Who has done what is the feast's own view, asked for again every half minute.
 */
export function FeastCard({ underWay: { feast, phase, closes }, view, api, you, now }: { underWay: UnderWay; view: BurrowView; api: AppApi; you: string; now: number }) {
  const { data } = useResource<MemberFeast>(api, `/api/feasts/${feast.id}`), [listing, setListing] = useState(false);
  const progress = data ? feastProgress(data, phase) : null, action = feastAction(phase, data, you);
  const faces = progress?.map(({ address, done }): RowFace => {
    const member = view.members.find(one => sameAddress(one.address, address));
    return { key: address, address, variant: member?.variant ?? 0, name: member ? displayName(member) : shortAddress(address), done };
  });
  const done = faces?.filter(face => face.done).length ?? 0, total = faces?.length ?? 0;
  const count = phase === 'scattering' ? formatCopy('scatter.participation', { done, total }) : formatCopy('gathering.participation', { written: done, total });
  return (
    <section className="feast-card">
      <div className="place-heading"><h3>{feast.title}</h3><span className="chip">{copy[phaseCopy[phase]]}</span></div>
      <p className="feast-card-line">{formatCopy('deadline.line', { deadline: deadlineLine(phase, closes, now, true), date: absoluteDeadline(closes) })}</p>
      {faces ? phase === 'scattering'
        ? <button type="button" className="feast-card-who" onClick={() => setListing(true)}><FaceRow count={count} faces={faces} notYet="scatter.notYet" /></button>
        : <FaceRow count={count} faces={faces} notYet="gathering.notYet" /> : null}
      {action ? <Link className="pill wide" href={`/feasts/${feast.id}`}>{copy[action]}</Link> : null}
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
    <Dialog title={count} onClose={close} dismiss="action.close" className="who-scattered">
      {scattered.length ? <ul role="list" className="burrow-rows">{scattered.map(face => (
        <li key={face.key} className="burrow-row"><CritterFace address={face.address} variant={face.variant} name={face.name} size={32} /><b>{sameAddress(face.address, you) ? formatCopy('burrow.members.you', { name: face.name }) : face.name}</b></li>
      ))}</ul> : null}
      {waiting.length ? <div className="who-waiting">
        <span className="face-row-faces">{waiting.map(face => <span key={face.key} className="face-row-face" data-done="false"><CritterFace address={face.address} variant={face.variant} name={face.name} size={28} /></span>)}</span>
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
    <h3>{copy['burrow.feasts.title']}</h3>
    <ul role="list" className="burrow-rows">{feasts.map(feast => {
      const phase = phaseAt(feast, now), day = feastDay(feast, phase);
      return <li key={feast.id}>
        <Link className="burrow-row feast-row" href={`/feasts/${feast.id}`}>
          <span className="burrow-row-words"><b>{feast.title}</b><time dateTime={new Date(day).toISOString()}>{dayLabel(day)}</time></span>
          <span className="chip">{copy[phaseCopy[phase]]}</span>
        </Link>
        {phase === 'void' ? <SheetNotice>{formatCopy('feast.tooFew', { feastTitle: feast.title })}</SheetNotice> : null}
      </li>;
    })}</ul>
  </>;
}
