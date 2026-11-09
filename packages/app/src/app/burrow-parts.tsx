import { useEffect, useRef, useState, type Ref, type RefObject } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
import { useNotification } from './announcements.js';
import { burrowFloor, type YourPlace } from './burrow-scenes.js';
import { activeMembers, phasesKey, sameAddress, youLast, type BurrowMember, type BurrowView } from './burrow-view.js';
import type { RunAction } from './burrows.js';
import { copyBurrowLink } from './clipboard.js';
import { FloorCritter } from './painted-floor.js';
import { standingStyle, type Standing } from './painted-scene.js';
import type { RowFace } from './place-screen.js';
import type { AppApi, Me } from './session.js';
import { CritterFace, Field, Link, displayName, useResource } from './ui.js';

/** What every screen here is handed: who you are, the store, and the app's way of running a write. `onProfile` opens your critter's profile from the face in the header. */
export interface ScreenProps { me: Me; api: AppApi; run: RunAction; busy: boolean; onProfile: () => void }
/** Your critter's face at the right of the frame's header (place-screen.tsx, `viewer`). */
export const viewerOf = ({ me, onProfile }: Pick<ScreenProps, 'me' | 'onProfile'>) => ({ address: me.address, variant: me.variant, open: onProfile });

/**
 * Reads a view again when `key` changes, once it has had one: the phases of a burrow's feasts by the trusted clock
 * (burrow-view.ts, phasesKey), which the clock moves at a deadline before the store's answer is read again. The answer
 * changes there too: scattering freezes who takes part, and a people feast left with fewer than three critters ends.
 * Without it the screen would wait for its next half-minute poll, and a feast would show a scattering card with nobody
 * taking part, or stay under way after it ended.
 */
export function useRereadOnChange(key: string, reread: () => void) {
  const last = useRef(key), latest = useRef(reread);
  latest.current = reread;
  useEffect(() => { if (last.current && key && last.current !== key) latest.current(); last.current = key; }, [key]);
}

/** A burrow's view, read again every half minute (useResource) and when one of its feasts changes phase at `now`. */
export function useBurrow(api: AppApi, id: string, now: number | null) {
  const resource = useResource<BurrowView>(api, `/api/burrows/${id}`);
  useRereadOnChange(resource.data ? phasesKey(resource.data.feasts, now ?? resource.data.serverNow) : '', resource.refresh);
  return resource;
}

/**
 * Puts the focus in `field` when the screen arrives. The frame puts it on the page first (place-screen.tsx), so this is
 * called by the screen that draws the frame, whose effects run after the frame's.
 */
export function useFocusOnArrival(field: RefObject<HTMLElement | null>) {
  useEffect(() => { field.current?.focus(); }, [field]);
}

/**
 * What a screen where you stand alone hands the frame (burrow-scenes.ts): its painting, its sheet's height, and you on
 * its floor, asleep with a "z" over your head where the screen says so (flow page, .zz; drawn by the stylesheet).
 */
export function yourPlace(me: Me, place: YourPlace & { z?: Standing }, asleep = false) {
  return {
    painting: place.painting, sheetHeight: place.sheetHeight,
    floor: <>
      <FloorCritter critter={{ ...place.critter, address: me.address, variant: me.variant, asleep }} />
      {asleep && place.z ? <span className="burrow-z" style={standingStyle(place.z)} aria-hidden="true" /> : null}
    </>,
  };
}

/** The burrow's critters on its floor (burrow-scenes.ts, burrowFloor): you at its right, awake, and the others not yet joined asleep. */
export function BurrowFloor({ view, you }: { view: BurrowView; you: string }) {
  const members = youLast(activeMembers(view), you);
  return <>{burrowFloor(members.length).map(spot => {
    const member = members[spot.index]!;
    return <FloorCritter key={member.address} critter={{ x: spot.x, y: spot.y, size: spot.size, face: spot.face, address: member.address, variant: member.variant, asleep: member.joinedAt === null && !sameAddress(member.address, you) }} />;
  })}</>;
}

/** A face for `Faces`, as FaceRow takes them (place-screen.tsx): a member's, with nothing yet done or left undone. */
export const memberFace = (member: BurrowMember): Omit<RowFace, 'done'> => ({ key: member.address, address: member.address, variant: member.variant, name: displayName(member) });
/**
 * A few critters' faces, overlapping, as the frame's FaceRow draws them (flow page, faces()); those that have not done
 * something yet are dimmed. Decoration: the words beside them say who and how many.
 */
export function Faces({ faces, size }: { faces: readonly (Omit<RowFace, 'done'> & { done?: boolean })[]; size: number }) {
  return <span className="face-row-faces">{faces.map(face => (
    <span key={face.key} className="face-row-face" data-done={face.done}><CritterFace address={face.address} variant={face.variant} name={face.name} size={size} /></span>
  ))}</span>;
}

/** The burrow's critters behind one card (flow page, membersCard()): three faces, how many, and the screen where they are added and removed. */
export function CrittersCard({ view }: { view: BurrowView }) {
  const members = activeMembers(view);
  return (
    <Link className="burrow-link" href={`/burrows/${view.id}/critters`}>
      <Faces faces={members.slice(0, 3).map(memberFace)} size={30} />
      <span className="burrow-link-words"><b>{copy['burrow.members.title']}</b><span>{formatCopy('home.critterCount', { n: members.length })}</span></span>
      <GameIcon name="right" />
    </Link>
  );
}

/** Copy burrow link: the burrow's address on the clipboard, and said so once it is there (clipboard.ts). */
export function CopyLink({ id, run, className }: { id: string; run: RunAction; className: string }) {
  const notify = useNotification();
  return <button type="button" className={className} onClick={event => { const origin = event.currentTarget; void run(async () => { await copyBurrowLink(id); notify(copy['burrow.link.copied'], origin); }); }}>{copy['burrow.link.copy']}</button>;
}

/**
 * The add field (flow page, the inline field and Add): an address or ENS name, said back once it is in the burrow.
 * `field` is the input, for a screen that puts the focus there when it opens.
 */
export function AddCritter({ id, api, run, busy, added, field }: { id: string; api: AppApi; run: RunAction; busy: boolean; added: () => void; field?: Ref<HTMLInputElement> }) {
  const [address, setAddress] = useState(''), notify = useNotification();
  return (
    <form className="burrow-add" onSubmit={event => { event.preventDefault(); void run(async () => { await api.write(`/api/burrows/${id}/members`, 'POST', { address }); notify(formatCopy('burrow.add.done', { name: address })); setAddress(''); added(); }); }}>
      <Field label="burrow.add.label"><input ref={field} autoCapitalize="none" autoComplete="off" spellCheck={false} required placeholder={copy['burrow.add.placeholder']} value={address} onChange={event => setAddress(event.target.value)} /></Field>
      <button className="pill soft small" disabled={busy || !address.trim()}>{copy['burrow.add.cta']}</button>
    </form>
  );
}

/**
 * No feasts yet (flow page, emptyFeasts()): the card says so and holds Start a feast, gold when it is the screen's one
 * action, and soft on a burrow that is only you, where a feast must wait for more critters.
 */
export function NoFeasts({ id, primary }: { id: string; primary: boolean }) {
  return (
    <section className="burrow-feast burrow-feast-empty">
      <h2 className="burrow-heading">{copy['burrow.feasts.empty.title']}</h2>
      <p className="burrow-feast-line">{copy['burrow.feasts.empty.body']}</p>
      <Link className={primary ? 'pill wide' : 'pill soft wide'} href={`/burrows/${id}/feasts/new`}>{copy['burrow.feasts.new']}</Link>
    </section>
  );
}
