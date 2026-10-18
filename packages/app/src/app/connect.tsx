import type { AccountOption } from '@critter-crumbs/core';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
import { CrumbGlyph } from '../game/mound.js';
import { Loader, SheetNotice } from '../game/sheet-parts.js';
import { optionInitial, optionPicture } from './connect-option.js';
import { Dialog } from './ui.js';

function OptionGlyph({ option }: { option: AccountOption }) {
  const picture = optionPicture(option);
  return picture ? <img className="connect-glyph" src={picture} alt="" width={36} height={36} /> : <span className="connect-glyph" aria-hidden="true">{optionInitial(option)}</span>;
}

/**
 * Choosing how to connect (flow page, SCREENS.connect, signing and ['connect-empty']): a sheet from the bottom on the
 * phone, a centred card on desktop. The choices are the apps the browser offers, by their own names; once one is
 * chosen the sheet waits on it, since the app asks for the connection and then for a signature.
 */
export function ConnectSheet({ options, discovering, reason, waiting, busy, choose, cancel }: {
  options: AccountOption[]; discovering: boolean; reason: string; waiting: AccountOption | null; busy: boolean; choose: (option: AccountOption) => void; cancel: () => void;
}) {
  return (
    <Dialog title={copy['connect.title']} className="connect-sheet" onClose={cancel} busy={busy}
      actions={<button type="button" className="secondary" disabled={busy} onClick={cancel}>{copy['action.cancel']}</button>}>
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
        )) : <SheetNotice trouble>{copy['connect.empty']}</SheetNotice>}
      </div>
    </Dialog>
  );
}
