import { useId, useState } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { useAudio } from '../audio/context.js';
import type { Me, Session } from './session.js';
import { PaintedFloor, FloorCritter } from './painted-floor.js';
import { LAUNCHER_SCENE } from './painted-scene.js';
import { Dialog, Field } from './ui.js';

/** One first meeting. Rerolls keep the draft name; keeping saves the name and identity atomically. */
export function Onboarding({ me, session, run, busy, close, announce, visible }: { me: Me; session: Session; run: (action: () => Promise<void>) => Promise<void>; busy: boolean; close: () => void; announce: (text: string) => void; visible: boolean }) {
  const [name, setName] = useState(me.displayName ?? ''), form = useId(), audio = useAudio();
  const [choosing, setChoosing] = useState(!me.critterLocked);
  const needsName = !me.ensName, locked = me.critterLocked, meeting = choosing || !locked;
  const needsCompletion = meeting || (needsName && !me.displayName);
  // The fourth reroll already locks on the server. Keep this meeting open so that never discards an edited name.
  if (!visible || !needsCompletion) return null;
  return <Dialog title={copy[meeting ? 'critter.meet.title' : 'name.title']} className="meet-dialog" onClose={close} busy={busy} actions={<>
    {meeting ? <button type="button" className="secondary" disabled={busy || locked || me.rerollsUsed >= 4} onClick={event => { const control = event.currentTarget; void run(async () => {
      await session.updateProfile({ variant: me.variant + 1 }); audio.play('reroll');
      announce(formatCopy('critter.reroll.announce', { remaining: 4 - session.snapshot().me!.rerollsUsed }));
    }).then(() => requestAnimationFrame(() => {
      const dialog = control.closest('dialog'), target = control.disabled ? dialog?.querySelector<HTMLElement>('button[form]:not(:disabled)') ?? dialog?.querySelector<HTMLElement>('input') : control;
      if (target?.isConnected) target.focus();
    })); }}>{me.rerollsUsed === 3 ? copy['critter.reroll.last'] : formatCopy('critter.reroll', { remaining: 4 - me.rerollsUsed })}</button> : null}
    <button form={form} disabled={busy || (needsName && !name.trim())}>{copy[meeting ? 'critter.keep' : 'name.save']}</button>
  </>}>
    <PaintedFloor painting={LAUNCHER_SCENE.painting} className="meet-scene room-scene"><FloorCritter critter={{ address: me.address, variant: me.variant, x: 50, y: 94, size: 260, asleep: false, face: null }} /></PaintedFloor>
    <form id={form} onSubmit={event => { event.preventDefault(); void run(async () => { await session.updateProfile({ ...(needsName ? { displayName: name } : {}), ...(meeting ? { keepCritter: true } : {}) }); setChoosing(false); close(); }); }}>
      <p>{locked ? copy['critter.locked'] : formatCopy('critter.meet.body', { max: 4 })}</p>
      {needsName ? <Field label="name.label"><input required maxLength={40} autoComplete="nickname" value={name} onChange={event => setName(event.target.value)} /></Field> : <p className="meet-name">{me.ensName}</p>}
    </form>
  </Dialog>;
}
