import { copy, formatCopy } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import { useNotification } from './announcements.js';
import type { RunAction } from './burrows.js';
import { copyText } from './clipboard.js';
import { burrowPath, ENDED_SCENE, feastFrame, LATE_SCENE, NOWHERE_SCENE, type Viewer } from './feast-place.js';
import { isMemberFeast, portraitVariant, type MemberFeast, type PublicFeast } from './feast-view.js';
import { FloorCritter } from './painted-floor.js';
import { JUNIPER, openingVariant } from './painted-scene.js';
import { FaceRow, FloorRing, PlaceScreen } from './place-screen.js';
import type { Me } from './session.js';
import { Link, shortAddress, targetLabel } from './ui.js';
import '../styles/feast-pages.css';

/** A feast's critters standing in their ring, all awake or all asleep. */
function ring(feast: PublicFeast, asleep: boolean) {
  return <FloorRing critters={feast.targets.map(target => ({ key: target.id, address: target.ownerAddress ?? target.id, variant: portraitVariant(feast, target), asleep }))} />;
}

/**
 * A feast that was cancelled, or that ended before scattering because a people feast had fewer than three critters
 * when scattering opened (PRD P11): its critters asleep in their ring and, for a void feast, why in a leaf notice. The
 * page no longer counts down (QA edge-states-15). Back leads a member to the burrow.
 */
export function EndedFeast({ feast, viewer, trouble }: { feast: PublicFeast | MemberFeast; viewer: Viewer | undefined; trouble: string }) {
  return (
    <PlaceScreen {...feastFrame(feast, viewer)} painting={ENDED_SCENE.painting} sheetHeight={ENDED_SCENE.sheetHeight} className="feast-page feast-ended" floor={ring(feast, true)}
      actions={<Link className="pill soft wide" href={isMemberFeast(feast) ? burrowPath(feast) : '/'}>{copy['action.back']}</Link>}>
      {trouble ? <SheetNotice trouble>{trouble}</SheetNotice> : null}
      {feast.phase === 'void' ? <SheetNotice>{formatCopy('feast.tooFew', { feastTitle: feast.title })}</SheetNotice> : <span className="chip">{copy['feast.cancelled']}</span>}
      {feast.context ? <p>{feast.context}</p> : null}
    </PlaceScreen>
  );
}

/**
 * Joined too late (flow page, SCREENS.late; PRD R7): a member who joined the burrow after the feast's critters were
 * fixed when scattering opened watches from the edge of the floor. They are told before anything invites them to read
 * or scatter (QA edge-states-07), with how many have scattered and their faces.
 */
export function JoinedTooLate({ feast, me, viewer, trouble }: { feast: MemberFeast; me: Me; viewer: Viewer; trouble: string }) {
  const scattered = new Set(feast.participation.scattered.map(address => address.toLowerCase()));
  const done = feast.participants.filter(address => scattered.has(address.toLowerCase())).length;
  const faces = feast.targets.filter(target => target.ownerAddress && scattered.has(target.ownerAddress.toLowerCase()))
    .map(target => ({ key: target.id, address: target.ownerAddress!, variant: portraitVariant(feast, target), name: targetLabel(target), done: true }));
  return (
    <PlaceScreen {...feastFrame(feast, viewer)} painting={LATE_SCENE.painting} sheetHeight={LATE_SCENE.sheetHeight} className="feast-page feast-late"
      floor={<>{ring(feast, false)}<FloorCritter critter={{ ...LATE_SCENE.viewer, address: me.address, variant: me.variant, asleep: false }} /></>}
      actions={<Link className="pill soft wide" href={burrowPath(feast)}>{copy['action.back']}</Link>}>
      {trouble ? <SheetNotice trouble>{trouble}</SheetNotice> : null}
      <SheetNotice>{copy['err.notParticipant']}</SheetNotice>
      <FaceRow count={formatCopy('scatter.participation', { done, total: feast.participants.length })} faces={faces} notYet="scatter.notYet" />
    </PlaceScreen>
  );
}

/**
 * A feast's link that leads nowhere: the store has no feast by that id, or the id is not one (feast.tsx). The wordmark
 * heads the screen, since there is no burrow to name, and a critter sleeps on the floor: yours, or for someone who has
 * not connected, one of the critters the launcher shows.
 */
export function NoFeastHere({ me, viewer }: { me: Me | null; viewer: Viewer | undefined }) {
  const sleeper = me ? { address: me.address, variant: me.variant } : { address: JUNIPER, variant: openingVariant(JUNIPER) };
  return (
    <PlaceScreen wordmark title={copy['feast.missing.title']} {...(viewer ? { viewer } : {})} painting={NOWHERE_SCENE.painting} sheetHeight={NOWHERE_SCENE.sheetHeight} className="feast-page feast-nowhere"
      floor={<FloorCritter critter={{ ...NOWHERE_SCENE.critter, ...sleeper, asleep: true }} />}
      actions={<Link className="pill soft wide" href="/">{copy['action.back']}</Link>}>
      <h1>{copy['feast.missing.title']}</h1>
      <p>{copy['feast.missing.body']}</p>
    </PlaceScreen>
  );
}

/**
 * A feast in a burrow that has not added you (flow page, SCREENS.unknown; PRD P2): your critter on the floor, what to
 * ask for, and your short address with Copy address, the one thing to send to someone in the burrow.
 */
export function NotInBurrow({ feast, me, viewer, run, busy }: { feast: PublicFeast; me: Me; viewer: Viewer; run: RunAction; busy: boolean }) {
  const notify = useNotification();
  return (
    <PlaceScreen title={feast.burrowName} viewer={viewer} painting={NOWHERE_SCENE.painting} sheetHeight={NOWHERE_SCENE.sheetHeight} className="feast-page feast-nowhere"
      floor={<FloorCritter critter={{ ...NOWHERE_SCENE.critter, address: me.address, variant: me.variant, asleep: false }} />}
      actions={<Link className="pill soft wide" href="/">{copy['action.back']}</Link>}>
      <h2>{copy['burrow.unknown.title']}</h2>
      <p>{formatCopy('burrow.unknown.body', { burrowName: feast.burrowName, shortAddress: shortAddress(me.address) })}</p>
      <div className="critter-address">
        <span className="address">{shortAddress(me.address)}</span>
        <button type="button" className="quiet" disabled={busy} onClick={event => { const origin = event.currentTarget; void run(async () => { await copyText(me.address); notify(copy['profile.address.copied'], origin); }); }}>{copy['profile.address.copy']}</button>
      </div>
    </PlaceScreen>
  );
}
