import { useId, useState } from 'react';
import { generateCritter } from '@critter-crumbs/core';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { useAudio } from '../audio/context.js';
import { ElementChip } from '../game/icons.js';
import { critterVersion } from '../portraits/version.js';
import { NameField, nameFits } from './name-field.js';
import { FloorCritter } from './painted-floor.js';
import { MEETING_SCENE } from './painted-scene.js';
import { PlaceScreen } from './place-screen.js';
import type { Me, Session } from './session.js';

/**
 * The first meeting, a whole screen over the one the member connected on (flow page, SCREENS.meet and SCREENS.name;
 * decision D6 of the November UI audit): your critter large on the floor, its element beside the title, the line, the
 * name when the address has no ENS name, and Re-roll and Keep this one pinned at the foot. Nothing closes it but Keep.
 * Rerolls keep the draft name, and Keep saves the name and the lock in one profile update. The fourth reroll already
 * locks the critter on the server; the meeting stays until Keep, so an edited name is never lost. A kept critter
 * without a name is only named (SCREENS.name), asleep until it has one. `done` follows the saved update.
 */
export function Onboarding({ me, session, run, busy, announce, done }: { me: Me; session: Session; run: (action: () => Promise<void>) => Promise<void>; busy: boolean; announce: (text: string) => void; done: () => void }) {
  const [name, setName] = useState(me.displayName ?? ''), form = useId(), audio = useAudio();
  const [meeting] = useState(!me.critterLocked);
  const needsName = !me.ensName, locked = me.critterLocked;
  /* a name saved before the 16-character limit stands unless it is changed (D10) */
  const renamed = name.trim() !== (me.displayName ?? '');
  const ready = !needsName || (renamed ? nameFits(name) : name.trim() !== '');
  const drawn = generateCritter(me.address, me.variant, critterVersion), element = drawn.version === '2' ? drawn.element : null;
  const title = copy[meeting ? 'critter.meet.title' : 'name.title'], { sheetHeight, ...spot } = meeting ? MEETING_SCENE.meet : MEETING_SCENE.name;
  return (
    <PlaceScreen over wordmark title={title} painting={MEETING_SCENE.painting} sheetHeight={sheetHeight} className="first-meeting"
      floor={<FloorCritter critter={{ ...spot, address: me.address, variant: me.variant, asleep: !meeting, face: null }} />}
      actions={<>
        {meeting ? <button type="button" className="pill soft" disabled={busy || locked || me.rerollsUsed >= 4} onClick={event => { const control = event.currentTarget; void run(async () => {
          await session.updateProfile({ variant: me.variant + 1 }); audio.play('reroll');
          announce(formatCopy('critter.reroll.announce', { remaining: 4 - session.snapshot().me!.rerollsUsed }));
        }).then(() => requestAnimationFrame(() => {
          const screen = control.closest('.first-meeting'), target = control.disabled ? screen?.querySelector<HTMLElement>('button[form]:not(:disabled)') ?? screen?.querySelector<HTMLElement>('input') : control;
          if (target?.isConnected) target.focus();
        })); }}>{me.rerollsUsed === 3 ? copy['critter.reroll.last'] : formatCopy('critter.reroll', { remaining: 4 - me.rerollsUsed })}</button> : null}
        <button className="pill" form={form} disabled={busy || !ready}>{copy[meeting ? 'critter.keep' : 'name.save']}</button>
      </>}>
      <div className="place-heading"><h1>{title}</h1>{meeting && element ? <ElementChip element={element} /> : null}</div>
      <p>{meeting ? locked ? copy['critter.locked'] : formatCopy('critter.meet.body', { max: 4 }) : copy['name.help']}</p>
      <form id={form} onSubmit={event => { event.preventDefault(); if (!ready) return; void run(async () => {
        await session.updateProfile({ ...(needsName && renamed ? { displayName: name } : {}), ...(meeting ? { keepCritter: true } : {}) }); done();
      }); }}>
        {needsName ? <NameField label="name.label" value={name} change={setName} autoComplete="nickname" /> : <p className="meeting-name">{me.ensName}</p>}
      </form>
    </PlaceScreen>
  );
}
