import { copy } from '@critter-crumbs/shared';
import { useNotification } from './announcements.js';
import type { RunAction } from './burrows.js';
import { copyText } from './clipboard.js';
import { shortAddress } from './ui.js';

/**
 * Your address in its short form with Copy address beside it (flow page, SCREENS.profile and SCREENS.unknown): the whole
 * address is copied, and the notice says so where the button was pressed. On your critter's profile, and on a feast's
 * page in a burrow that has not added you, where it is the one thing to send to someone in that burrow.
 */
export function CopyAddress({ address, run, busy }: { address: string; run: RunAction; busy: boolean }) {
  const notify = useNotification();
  return (
    <div className="critter-address">
      <span className="address">{shortAddress(address)}</span>
      <button type="button" className="quiet" disabled={busy} onClick={event => { const origin = event.currentTarget; void run(async () => { await copyText(address); notify(copy['profile.address.copied'], origin); }); }}>{copy['profile.address.copy']}</button>
    </div>
  );
}
