import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { SheetNotice } from '../game/sheet-parts.js';

/**
 * The notices that stand on a screen while their cause lasts (flow page, SCREENS.notices; the November UI audit,
 * screen 53): the device's clock being off, ENS names that could not be looked up, and the simple view standing in for
 * 3D. Each is said once through the app's announcer as it arrives and stays in view, stacked as the flow page stacks
 * them: a cloud when something is not right, a leaf when it is only so, with a way to try again where there is one.
 * The stack is not a live region, so nothing is read twice.
 */
export interface StandingNotice { key: string; text: string; trouble: boolean; retry?: { label: string; run: () => void } }
type Post = (key: string, notice: StandingNotice | null) => void;
const Notices = createContext<{ notices: readonly StandingNotice[]; post: Post }>({ notices: [], post: () => {} });

/** The app's own notices first (`notices`), then those a screen posts while it is shown (the renderer's simple view). */
export function NoticeProvider({ notices, children }: { notices: readonly StandingNotice[]; children: ReactNode }) {
  const [posted, setPosted] = useState<readonly StandingNotice[]>([]);
  const post = useCallback<Post>((key, notice) => setPosted(current => {
    const others = current.filter(entry => entry.key !== key);
    return notice ? [...others, notice] : others.length === current.length ? current : others;
  }), []);
  const value = useMemo(() => ({ notices: [...notices, ...posted], post }), [notices, posted, post]);
  return <Notices value={value}>{children}</Notices>;
}

/** Puts a notice on the stack under `key`, or takes it off with null. */
export const usePostNotice = () => useContext(Notices).post;

/** The stack, where a screen shows it: at the top of its sheet, or over the top of the game's floor. */
export function ScreenNotices({ className = 'screen-notices' }: { className?: string }) {
  const { notices } = useContext(Notices);
  if (!notices.length) return null;
  return (
    <div className={className}>
      {notices.map(notice => (
        <SheetNotice key={notice.key} trouble={notice.trouble}>
          {notice.text}
          {notice.retry ? <button type="button" className="quiet left" onClick={notice.retry.run}>{notice.retry.label}</button> : null}
        </SheetNotice>
      ))}
    </div>
  );
}
