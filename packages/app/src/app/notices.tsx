import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { copy, formatCopy, type CopyId } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';

/**
 * The notices that stand on a screen while their cause lasts (flow page, SCREENS.notices; the November UI audit,
 * screen 53): the device's clock being off, ENS names that could not be looked up, and the simple view standing in for
 * 3D. Each is said once through the app's announcer as it arrives and stays in view, stacked as the flow page stacks
 * them: a cloud when something is not right, a leaf when it is only so, with a way to try again where there is one.
 * The stack is not a live region, so nothing is read twice. A notice's `key` is the copy it says, or for the simple view
 * the setting it stands for.
 */
export interface StandingNotice { key: CopyId; text: string; trouble: boolean; retry?: { label: string; run: () => void } }
type Post = (key: CopyId, notice: StandingNotice | null) => void;
const Notices = createContext<{ app: readonly StandingNotice[]; posted: readonly StandingNotice[]; post: Post }>({ app: [], posted: [], post: () => {} });

/**
 * The app's own notices, in the flow page's order: the device's clock off by `skew` minutes, once a response has shown
 * it (Design System §8), then a warning from the profile, which is ENS names that could not be looked up.
 */
export function appNotices(skew: number | null, warning: CopyId | undefined): StandingNotice[] {
  return [
    ...(skew === null ? [] : [{ key: 'err.clockSkew' as const, text: formatCopy('err.clockSkew', { minutes: skew }), trouble: true }]),
    ...(warning ? [{ key: warning, text: copy[warning], trouble: true }] : []),
  ];
}

/** The app's own notices (`notices`), and those a screen posts while it is shown (the renderer's simple view). */
export function NoticeProvider({ notices, children }: { notices: readonly StandingNotice[]; children: ReactNode }) {
  const [posted, setPosted] = useState<readonly StandingNotice[]>([]);
  const post = useCallback<Post>((key, notice) => setPosted(current => {
    const others = current.filter(entry => entry.key !== key);
    return notice ? [...others, notice] : others.length === current.length ? current : others;
  }), []);
  const value = useMemo(() => ({ app: notices, posted, post }), [notices, posted, post]);
  return <Notices value={value}>{children}</Notices>;
}

/** Puts a notice on the stack under `key`, or takes it off with null. */
export const usePostNotice = () => useContext(Notices).post;

/**
 * The stack, where a screen shows it: at the head of its sheet, the app's notices and then the screen's own; or
 * `overFloor`, over the top of the game's floor, where only the game's own notice stands (the simple view, where it
 * always has), so that nothing covers the circle for a whole session (docs/decisions.md, 2026-11-09).
 */
export function ScreenNotices({ overFloor = false }: { overFloor?: boolean }) {
  const { app, posted } = useContext(Notices), notices = overFloor ? posted : [...app, ...posted];
  if (!notices.length) return null;
  return (
    <div className={overFloor ? 'screen-notices game-notices' : 'screen-notices'}>
      {notices.map(notice => (
        <SheetNotice key={notice.key} trouble={notice.trouble}>
          {notice.text}
          {notice.retry ? <button type="button" className="quiet left" onClick={notice.retry.run}>{notice.retry.label}</button> : null}
        </SheetNotice>
      ))}
    </div>
  );
}
