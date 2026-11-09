import { useId } from 'react';
import { copy, type CopyId } from '@critter-crumbs/shared';
import { ElementChip } from '../game/icons.js';
import { critterVersion, supportsMesh } from '../portraits/version.js';
import { settingKeys, type StoredSetting } from '../sim/settings.js';
import type { GameSettings } from '../world/index.js';
import { useNotification } from './announcements.js';
import type { RunAction } from './burrows.js';
import { copyText } from './clipboard.js';
import { FloorCritter } from './painted-floor.js';
import { PROFILE_SCENE } from './painted-scene.js';
import { PlaceScreen } from './place-screen.js';
import type { Me } from './session.js';
import { Link, critterElementOf, displayName, shortAddress } from './ui.js';

/** Each stored setting's name and the line under it */
const WORDS = {
  effects: ['sound.effects.label', 'sound.effects.help'], music: ['sound.music.label', 'sound.music.help'],
  still: ['motion.still.label', 'motion.still.help'], simple: ['view.simple.label', 'view.simple.help'],
} as const satisfies Record<StoredSetting, readonly [CopyId, CopyId]>;

/**
 * Your critter's profile, one screen in place of the profile and Settings dialogs (flow page, SCREENS.profile; the
 * November UI audit's screen 51): your critter on the floor, delighted, under its element, your name and "This one's yours.", the
 * short address with Copy address, the settings as switches, and How it works and Disconnect at the foot. The face in
 * every header opens it over the screen it was pressed on, and its back chevron returns there (app.tsx). Simple view is
 * left out while no critter has a 3D mesh (Design System D34); dark mode stays (D26).
 */
export function YourCritter({ me, back, settings, choose, dark, chooseDark, disconnect, run, busy }: {
  me: Me; back: () => void; settings: GameSettings; choose: (key: StoredSetting, on: boolean) => void;
  dark: boolean; chooseDark: (on: boolean) => void; disconnect: () => void; run: RunAction; busy: boolean;
}) {
  const notify = useNotification();
  const element = critterElementOf(me.address, me.variant);
  const shown = (Object.keys(settingKeys) as StoredSetting[]).filter(key => key !== 'simple' || supportsMesh(critterVersion));
  return (
    <PlaceScreen over title={copy['profile.title']} back={back} painting={PROFILE_SCENE.painting} sheetHeight={PROFILE_SCENE.sheetHeight} className="your-critter"
      floor={<>
        <FloorCritter critter={{ ...PROFILE_SCENE.critter, address: me.address, variant: me.variant, asleep: false, face: null }} delighted />
        {element ? <div className="floor-chip"><ElementChip element={element} /></div> : null}
      </>}
      actions={<><Link className="quiet" href="/how-it-works">{copy['launch.learn']}</Link><button type="button" className="quiet" disabled={busy} onClick={disconnect}>{copy['action.disconnect']}</button></>}>
      <div className="place-heading"><h2>{displayName(me)}</h2><span className="profile-kept">{copy['critter.locked']}</span></div>
      <div className="critter-address">
        <span className="address">{shortAddress(me.address)}</span>
        <button type="button" className="quiet" disabled={busy} onClick={event => { const origin = event.currentTarget; void run(async () => { await copyText(me.address); notify(copy['profile.address.copied'], origin); }); }}>{copy['profile.address.copy']}</button>
      </div>
      <h3>{copy['settings.title']}</h3>
      <div className="switches">
        {shown.map(key => <Switch key={key} label={WORDS[key][0]} help={WORDS[key][1]} on={settings[key]} choose={on => choose(key, on)} />)}
        <Switch label="view.dark.label" help="view.dark.help" on={dark} choose={chooseDark} />
      </div>
    </PlaceScreen>
  );
}

/** A setting as a switch (flow page, .switch-row): its name, the line under it and the switch at the right; the whole row takes the press. */
function Switch({ label, help, on, choose }: { label: CopyId; help: CopyId; on: boolean; choose: (on: boolean) => void }) {
  const name = useId(), line = useId();
  return (
    <label className="switch-row">
      <b id={name}>{copy[label]}</b><small id={line}>{copy[help]}</small>
      <input type="checkbox" role="switch" checked={on} aria-labelledby={name} aria-describedby={line} onChange={event => choose(event.target.checked)} />
    </label>
  );
}
