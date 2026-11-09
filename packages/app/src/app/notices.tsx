import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { copy, formatCopy, type CopyId } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';

/**
 * The notices that stand on a screen (flow page, SCREENS.notices; the November UI audit, screen 53): the device's clock
 * being off and ENS names that could not be looked up, which are the app's own, and the simple view standing in for 3D,
 * which the game posts while it shows. Each is said once through the app's announcer as it arrives and stays in view,
 * stacked as the flow page stacks them: a cloud when something is not right, a leaf when it is only so, with a way to
 * try again where there is one. The stack is not a live region, so nothing is read twice.
 */
export interface StandingNotice { text: string; trouble: boolean; retry?: { label: string; run: () => void } }
type Placed = StandingNotice & { key: string };
type Post = (key: string, notice: StandingNotice | null) => void;
const Notices = createContext<{ app: readonly Placed[]; posted: readonly Placed[]; post: Post }>({ app: [], posted: [], post: () => {} });

/**
 * The app's own notices, in the flow page's order: the device's clock off by `skew` minutes, once a response has shown
 * it, which stands for the rest of the session (Design System §8), then a warning on the profile, which is ENS names
 * that could not be looked up, for as long as the profile carries it.
 */
export function appNotices(skew: number | null, warning: CopyId | undefined): Placed[] {
  return [
    ...(skew === null ? [] : [{ key: 'err.clockSkew', text: formatCopy('err.clockSkew', { minutes: skew }), trouble: true }]),
    ...(warning ? [{ key: warning, text: copy[warning], trouble: true }] : []),
  ];
}

/** The app's own notices (`notices`), and those the screens post while they are shown. */
export function NoticeProvider({ notices, children }: { notices: readonly Placed[]; children: ReactNode }) {
  const [posted, setPosted] = useState<readonly Placed[]>([]);
  const post = useCallback<Post>((key, notice) => setPosted(current => {
    const others = current.filter(entry => entry.key !== key);
    return notice ? [...others, { ...notice, key }] : others.length === current.length ? current : others;
  }), []);
  const value = useMemo(() => ({ app: notices, posted, post }), [notices, posted, post]);
  return <Notices value={value}>{children}</Notices>;
}

/** Stands `notice` over the game's floor while the calling screen shows it, or nothing while it is null. */
export function useGameNotice(notice: StandingNotice | null) {
  const { post } = useContext(Notices), key = useId();
  useEffect(() => {
    if (!notice) return;
    post(key, notice);
    return () => post(key, null);
  }, [post, key, notice]);
}

/**
 * The stack, where a screen shows it: the app's notices at the head of its sheet; or `overFloor`, over the top of the
 * game's floor, the game's own (the simple view, where it always lay). They stay apart: a whole session of a wrong
 * device clock never covers the circle, and a screen drawn over a game (your critter's profile) does not offer to retry
 * the game's 3D beneath it (docs/decisions.md, 2026-11-09).
 */
export function ScreenNotices({ overFloor = false }: { overFloor?: boolean }) {
  const { app, posted } = useContext(Notices), notices = overFloor ? posted : app;
  if (!notices.length) return null;
  return (
    <div className={overFloor ? 'screen-notices game-notices' : 'screen-notices'}>
      {notices.map(notice => (
        <SheetNotice key={notice.key} trouble={notice.trouble}>
          <span>{notice.text}</span>
          {notice.retry ? <button type="button" className="quiet left" onClick={notice.retry.run}>{notice.retry.label}</button> : null}
        </SheetNotice>
      ))}
    </div>
  );
}
