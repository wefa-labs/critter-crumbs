import { useEffect, useRef, useState, type Ref } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
import { useNotification } from './announcements.js';
import { burrowFloor, type YourPlace } from './burrow-scenes.js';
import { activeMembers, sameAddress, youLast, type BurrowMember, type BurrowView } from './burrow-view.js';
import type { RunAction } from './burrows.js';
import { copyBurrowLink } from './clipboard.js';
import { FloorCritter } from './painted-floor.js';
import { standingStyle, type Standing } from './painted-scene.js';
import type { AppApi, Me } from './session.js';
import { CritterFace, Link, displayName } from './ui.js';

/**
 * Reads a view again when `key` changes, once it has had one: the phases of a burrow's feasts by the trusted clock
 * (burrow-view.ts, phasesKey), which the clock moves at a deadline before the store's answer is read again. The answer
 * changes there too: scattering freezes who takes part, and a people feast left with fewer than three critters ends.
 * Without it the screen would wait for its next half-minute poll, and a feast would show a scattering card with nobody
 * taking part, or stay under way after it ended.
 */
export function useRereadOnChange(key: string, reread: () => void) {
  const last = useRef(key);
  useEffect(() => { if (last.current && key && last.current !== key) reread(); last.current = key; }, [key, reread]);
}

/** Your critter on a screen's floor, where the screen's scene puts it (burrow-scenes.ts). */
export function YourCritter({ me, place, asleep = false }: { me: Me; place: YourPlace; asleep?: boolean }) {
  return <FloorCritter critter={{ ...place.critter, address: me.address, variant: me.variant, asleep }} />;
}

/** A sleeper's "z" over its head (flow page, .zz): decoration, drawn by the stylesheet. */
export const SleepingZ = ({ at }: { at: Standing }) => <span className="floor-z" style={standingStyle(at)} aria-hidden="true" />;

/** The burrow's critters on its floor (burrow-scenes.ts, burrowFloor): you at the right of the front row, awake, and the others not yet joined asleep. */
export function BurrowFloor({ view, you }: { view: BurrowView; you: string }) {
  const members = youLast(activeMembers(view), you);
  return <>{burrowFloor(members.length).map(spot => {
    const member = members[spot.index]!;
    return <FloorCritter key={member.address} critter={{ x: spot.x, y: spot.y, size: spot.size, face: spot.face, address: member.address, variant: member.variant, asleep: member.joinedAt === null && !sameAddress(member.address, you) }} />;
  })}</>;
}

/** A few critters' faces, overlapping (flow page, faces()). Decoration: the words beside them say who and how many. */
export function Faces({ members, size }: { members: readonly BurrowMember[]; size: number }) {
  return <span className="face-row-faces">{members.map(member => <span key={member.address} className="face-row-face"><CritterFace address={member.address} variant={member.variant} name={displayName(member)} size={size} /></span>)}</span>;
}

/** The burrow's critters behind one card (flow page, membersCard()): three faces, how many, and the screen where they are added and removed. */
export function CrittersCard({ view }: { view: BurrowView }) {
  const members = activeMembers(view);
  return (
    <Link className="link-card" href={`/burrows/${view.id}/critters`}>
      <Faces members={members.slice(0, 3)} size={30} />
      <span className="link-card-words"><b>{copy['burrow.members.title']}</b><span>{formatCopy('home.critterCount', { n: members.length })}</span></span>
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
      <label className="field"><span>{copy['burrow.add.label']}</span><input ref={field} autoCapitalize="none" autoComplete="off" spellCheck={false} required placeholder={copy['burrow.add.placeholder']} value={address} onChange={event => setAddress(event.target.value)} /></label>
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
    <section className="feast-card feast-card-empty">
      <h3>{copy['burrow.feasts.empty.title']}</h3>
      <p className="feast-card-line">{copy['burrow.feasts.empty.body']}</p>
      <Link className={primary ? 'pill wide' : 'pill soft wide'} href={`/burrows/${id}/feasts/new`}>{copy['burrow.feasts.new']}</Link>
    </section>
  );
}
