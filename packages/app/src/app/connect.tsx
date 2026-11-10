import { useState } from 'react';
import type { AccountOption } from '@critter-crumbs/core';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
import { CrumbGlyph } from '../game/mound.js';
import { Loader, SheetNotice } from '../game/sheet-parts.js';
import { useNotification } from './announcements.js';
import type { RunAction } from './burrows.js';
import { copyText } from './clipboard.js';
import { optionInitial, optionPicture } from './connect-option.js';
import { Dialog } from './ui.js';

function OptionGlyph({ option }: { option: AccountOption }) {
  const picture = optionPicture(option);
  return picture ? <img className="connect-glyph" src={picture} alt="" width={36} height={36} /> : <span className="connect-glyph" aria-hidden="true">{optionInitial(option)}</span>;
}

/**
 * Choosing how to connect (flow page, SCREENS.connect, signing and ['connect-empty']): a sheet from the bottom on the
 * phone, a centred card on desktop. The choices are the apps the browser offers, by their own names; once one is
 * chosen the sheet waits on it, since the app asks for the connection and then for a signature. A browser with none,
 * as a phone's own or a chat app's is when a feast link is tapped there, gets the way forward instead: what to do, and
 * the page's link to take to the app the member connects with (QA production-build-07). Where the browser refuses the
 * clipboard, as some apps' own browsers do, the link itself shows under the notice once Copy link fails, and one press
 * selects all of it to copy by hand (docs/decisions.md, 2026-11-09).
 */
export function ConnectSheet({ options, discovering, reason, waiting, busy, choose, cancel, run }: {
  options: AccountOption[]; discovering: boolean; reason: string; waiting: AccountOption | null; busy: boolean; choose: (option: AccountOption) => void; cancel: () => void; run: RunAction;
}) {
  const notify = useNotification(), [refusedLink, setRefusedLink] = useState('');
  return (
    <Dialog title={copy['connect.title']} className="connect-sheet" onClose={cancel} busy={busy} dismiss="action.cancel">
      <div className="stack" aria-busy={discovering || !!waiting}>
      {reason ? <p>{reason}</p> : null}
      {waiting ? <>
        <div className="connect-option"><OptionGlyph option={waiting} /><span>{formatCopy('connect.waiting', { name: waiting.name })}</span><span className="spinner" aria-hidden="true" /></div>
        <p className="sheet-help">{copy['connect.sign.body']}</p>
      </> : discovering ? <><Loader crumb={<CrumbGlyph />} /><p className="sr-only">{copy['app.loading']}</p></>
        : options.length ? options.map(option => (
          <button key={option.id} type="button" className="connect-option" disabled={busy} onClick={() => choose(option)}>
            <OptionGlyph option={option} /><span>{option.name}</span><GameIcon name="right" />
          </button>
        )) : <>
          <SheetNotice trouble>{copy['connect.empty']}</SheetNotice>
          {refusedLink ? <p className="address">{refusedLink}</p> : null}
          <button type="button" disabled={busy} onClick={event => { const origin = event.currentTarget, link = location.href; void run(async () => { await copyText(link).catch((error: unknown) => { setRefusedLink(link); throw error; }); notify(copy['connect.link.copied'], origin); }); }}>{copy['connect.link.copy']}</button>
        </>}
      </div>
    </Dialog>
  );
}
