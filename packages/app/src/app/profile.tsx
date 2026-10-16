import { copy } from '@critter-crumbs/shared';
import type { Me } from './session.js';
import { CritterFace, Dialog, Link, PortraitImage, displayName } from './ui.js';
import { gardenReview } from '../portraits/version.js';
import type { RunAction } from './burrows.js';
import { useNotification } from './announcements.js';
import { copyText } from './clipboard.js';

/** Profile navigation is shared by the page shell and game headers. */
export function ProfileMenu({ me, close, settings, meet, disconnect, run, busy }: {
  me: Me; close: () => void; settings: () => void; meet: () => void; disconnect: () => void;
  run: RunAction; busy: boolean;
}) {
  const notify = useNotification();
  return <Dialog title={copy['profile.title']} onClose={close} busy={busy} className="profile-menu"
    actions={<button type="button" className="secondary" disabled={busy} onClick={disconnect}>{copy['action.disconnect']}</button>}>
    <div className="profile-identity">{gardenReview ? <CritterFace address={me.address} variant={me.variant} name={displayName(me)} size={44} /> : <PortraitImage address={me.address} variant={me.variant} name={displayName(me)} />}<strong>{displayName(me)}</strong></div>
    <div className="profile-address"><p className="address">{me.address}</p><button type="button" className="secondary" disabled={busy} onClick={event => { const origin = event.currentTarget; void run(async () => { await copyText(me.address); notify(copy['profile.address.copied'], origin); }); }}>{copy['profile.address.copy']}</button></div>
    <nav className="profile-links" aria-label={copy['app.navigation']}>
      <Link href="/">{copy['home.title']}</Link>
      <Link href="/burrows/new">{copy['home.empty.cta']}</Link>
      {!me.critterLocked ? <button type="button" className="quiet" onClick={meet}>{copy['critter.meet.title']}</button> : null}
      <button type="button" className="quiet" onClick={settings}>{copy['action.settings']}</button>
      <Link href="/how-it-works">{copy['launch.learn']}</Link>
    </nav>
  </Dialog>;
}
