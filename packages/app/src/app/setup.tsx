import { useId, useRef, useState } from 'react';
import { copy, CRUMBS_PER_CRITTER, formatCopy, MAX_FEAST_TARGETS, parseFeastSetup, ValidationError, type CopyId, type FeastKind } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import '../styles/setup.css';
import type { AppApi, Me } from './session.js';
import type { BurrowView, RunAction } from './burrows.js';
import { Field, Link, Page, navigate, useResource } from './ui.js';
import { NameField } from './name-field.js';
import { FloorCritter } from './painted-floor.js';
import { SETUP_SCENE, type Spot } from './painted-scene.js';
import { PlaceScreen } from './place-screen.js';
import { cappedStatement } from './statements.js';
import { absoluteDeadline, localDateTime, zoneName } from './time.js';

/** How far − and + move crumbs per critter; any whole number within CRUMBS_PER_CRITTER can still be typed. */
const CRUMB_STEP = 10;

export function SetupRoute({ burrowId, api, me, onProfile, run, busy, announce }: { burrowId: string; api: AppApi; me: Me; onProfile: () => void; run: RunAction; busy: boolean; announce: (text: string) => void }) {
  const resource = useResource<BurrowView>(api, `/api/burrows/${burrowId}`);
  if (!resource.data) return <Page title={resource.error ? copy['burrow.unknown.title'] : copy['app.loading']}>{resource.error ? <button onClick={resource.refresh}>{copy['action.retry']}</button> : null}</Page>;
  return <SetupForm burrow={resource.data} api={api} me={me} onProfile={onProfile} run={run} busy={busy} announce={announce} />;
}

/**
 * Start a feast on the frame (flow page, SCREENS.setup, ['setup-options'] and ['setup-few']; screens 23 to 25 of the
 * November UI audit): the burrow's line and a back chevron over the title, a strip of the room with you in the middle,
 * and in the sheet the draft chip and the fields in the flow page's order. The type and the two privacy choices are
 * cards on native radios, crumbs per critter a stepper on a native number field, and each deadline shows its absolute
 * time in the field. Save draft and Cancel stay at the foot; a people feast in a burrow of fewer than three critters
 * holds Save draft, with the reason beside it (PRD R6).
 */
function SetupForm({ burrow, api, me, onProfile, run, busy, announce }: { burrow: BurrowView; api: AppApi; me: Me; onProfile: () => void; run: RunAction; busy: boolean; announce: (text: string) => void }) {
  const [title, setTitle] = useState(''), [context, setContext] = useState(''), [kind, setKind] = useState<FeastKind>('people');
  const [crumbs, setCrumbs] = useState<number>(CRUMBS_PER_CRITTER.norm), [gathering, setGathering] = useState(() => localDateTime(burrow.serverNow + 86400000)), [scattering, setScattering] = useState(() => localDateTime(burrow.serverNow + 172800000));
  const [aggregatePublic, setAggregate] = useState(false), [individualOpen, setIndividual] = useState(false);
  const [options, setOptions] = useState([{ id: crypto.randomUUID(), name: '', statement: '' }]);
  const count = burrow.members.filter(member => member.leftAt === null).length;
  const capacity = kind === 'people' ? count > MAX_FEAST_TARGETS : options.length > MAX_FEAST_TARGETS;
  const minimum = kind === 'people' && count < 3;
  /* the zone is named as it stands when scattering closes, the time the line sits under */
  const closes = new Date(scattering).getTime();
  /* why Save draft is held, said beside it */
  const held = minimum ? formatCopy('setup.min.people', { n: count }) : capacity ? copy['err.feastCapacity'] : '';
  const [error, setError] = useState('');
  const limits = useRef(new Set<number>()), [limited, setLimited] = useState<number | null>(null);
  const form = useId(), reason = useId(), crumbsField = useId(), crumbsHelp = useId();
  function edit(index: number, update: Partial<{ name: string; statement: string }>) { setOptions(options => options.map((option, i) => i === index ? { ...option, ...update } : option)); }
  function statement(index: number, value: string) { const next = cappedStatement(value); edit(index, { statement: next.body }); setLimited(next.truncated ? index : null); if (next.truncated && !limits.current.has(index)) announce(copy['gathering.limit']); if (next.truncated) limits.current.add(index); else limits.current.delete(index); }
  /* − and + move to the next ten, and do nothing at their bound (aria-disabled); a typed amount outside the bounds is the field's to refuse */
  const { fewest, most, norm } = CRUMBS_PER_CRITTER, atFewest = crumbs <= fewest, atMost = crumbs >= most;
  function step(direction: 1 | -1) {
    if (direction > 0 ? atMost : atFewest) return;
    const from = Math.min(most, Math.max(fewest, Number.isFinite(crumbs) ? crumbs : norm));
    const next = direction > 0 ? Math.min(most, Math.floor(from / CRUMB_STEP) * CRUMB_STEP + CRUMB_STEP) : Math.max(fewest, Math.ceil(from / CRUMB_STEP) * CRUMB_STEP - CRUMB_STEP);
    setCrumbs(next); announce(formatCopy('setup.crumbs.announce', { n: next }));
  }
  return (
    <PlaceScreen title={copy['setup.title']} burrow={burrow.name} href={`/burrows/${burrow.id}`} back={() => navigate(`/burrows/${burrow.id}`)}
      viewer={{ address: me.address, variant: me.variant, open: onProfile }}
      painting={SETUP_SCENE.painting} sheetHeight={SETUP_SCENE.sheetHeight} className="start-feast" floor={<SetupFloor members={burrow.members} you={me.address} />}
      actions={<>
        {held ? <SheetNotice id={reason}>{held}</SheetNotice> : error ? <SheetNotice id={reason} trouble>{error}</SheetNotice> : null}
        <div className="place-choices"><Link className="quiet" href={`/burrows/${burrow.id}`}>{copy['action.cancel']}</Link>
          <button className="pill" form={form} aria-disabled={held !== ''} aria-describedby={held || error ? reason : undefined} disabled={busy} onClick={event => { if (held) event.preventDefault(); }}>{copy['setup.save']}</button></div>
      </>}>
      <p className="chip">{copy['setup.draft.chip']}</p>
      <form id={form} className="setup-form" onSubmit={event => { event.preventDefault(); if (held) return; setError(''); void run(async () => {
        try {
          const setup = parseFeastSetup({ title, context, kind, crumbsPerCritter: crumbs, gatheringEndsAt: new Date(gathering).getTime(), scatteringEndsAt: new Date(scattering).getTime(), aggregatePublic, individualOpen, options });
          const now = api.now(); if (now !== null && setup.gatheringEndsAt <= now) throw new ValidationError('setup.deadline.past');
          const draft = await api.write(`/api/burrows/${burrow.id}/feasts`, 'POST', setup); navigate(`/feasts/${draft.id}`);
        } catch (error) { if (error instanceof ValidationError) setError(copy[error.copyId]); throw error; }
      }); }}>
        <Field label="setup.field.title"><input required maxLength={80} value={title} onChange={event => setTitle(event.target.value)} /></Field>
        {/* one line for the invite, wrapped in a box that grows as the flow page draws it; Enter saves, as in a one-line field */}
        <Field label="setup.field.context" help="setup.field.context.help"><textarea rows={2} maxLength={140} value={context} onChange={event => setContext(event.target.value.replace(/\s*\n\s*/g, ' '))}
          onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /></Field>
        <Choices legend="setup.field.type" name="kind" choices={[
          { label: 'setup.type.people', help: 'setup.type.people.help', checked: kind === 'people', choose: () => setKind('people') },
          { label: 'setup.type.options', help: 'setup.type.options.help', checked: kind === 'options', choose: () => setKind('options') },
        ]} />
        {kind === 'options' ? <>
          <h2>{copy['setup.options.title']}</h2>
          {options.map((option, index) => <div className="option-card" key={option.id}>
            <NameField label="setup.option.name" value={option.name} change={name => edit(index, { name })} />
            <Field label="setup.option.statement"><textarea rows={2} value={option.statement} onChange={event => statement(index, event.target.value)} /></Field>
            {limited === index ? <p>{copy['gathering.limit']}</p> : null}
            <button type="button" className="quiet" disabled={options.length === 1} onClick={() => setOptions(options => options.filter(item => item.id !== option.id))}>{copy['setup.option.remove']}</button>
          </div>)}
          <button type="button" className="pill soft wide" aria-disabled={options.length >= MAX_FEAST_TARGETS} onClick={() => options.length >= MAX_FEAST_TARGETS ? void run(async () => { setError(copy['err.feastCapacity']); throw new ValidationError('err.feastCapacity'); }) : setOptions(options => [...options, { id: crypto.randomUUID(), name: '', statement: '' }])}>{copy['setup.options.add']}</button>
        </> : null}
        <div className="field">
          <label htmlFor={crumbsField}>{copy['setup.field.crumbs']}</label>
          <span className="crumb-stepper">
            <button type="button" className="icon-button" aria-label={copy['setup.crumbs.fewer']} aria-disabled={atFewest} onClick={() => step(-1)}>{copy['scatter.remove.symbol']}</button>
            <input id={crumbsField} type="number" inputMode="numeric" min={fewest} max={most} required aria-describedby={crumbsHelp} value={Number.isNaN(crumbs) ? '' : crumbs} onChange={event => setCrumbs(event.target.valueAsNumber)} />
            <button type="button" className="icon-button" aria-label={copy['setup.crumbs.more']} aria-disabled={atMost} onClick={() => step(1)}>{copy['scatter.add.symbol']}</button>
          </span>
          <small id={crumbsHelp}>{copy['setup.crumbs.help']}</small>
        </div>
        <DeadlineField label="setup.field.gathering" value={gathering} change={setGathering} />
        <DeadlineField label="setup.field.scattering" value={scattering} change={setScattering} help={formatCopy('setup.deadline.help', { tz: zoneName(Number.isFinite(closes) ? closes : burrow.serverNow) })} />
        <h2>{copy['setup.privacy.title']}</h2>
        <Choices legend="setup.privacy.aggregate.label" name="aggregate" choices={[
          { label: 'setup.privacy.aggregate.public', checked: aggregatePublic, choose: () => setAggregate(true) },
          { label: 'setup.privacy.aggregate.burrow', checked: !aggregatePublic, choose: () => setAggregate(false) },
        ]} />
        <Choices legend="setup.privacy.individual.label" name="individual" choices={[
          { label: 'setup.privacy.individual.closed', checked: !individualOpen, choose: () => setIndividual(false) },
          { label: 'setup.privacy.individual.open', checked: individualOpen, choose: () => setIndividual(true) },
        ]} />
      </form>
    </PlaceScreen>
  );
}

/** Who stands in the strip of the room: you in the middle with two of the burrow either side, the two of you, or you alone. */
function SetupFloor({ members, you }: { members: BurrowView['members']; you: string }) {
  const here = members.filter(member => member.leftAt === null), own = here.find(member => member.address.toLowerCase() === you.toLowerCase()) ?? here[0];
  if (!own) return null;
  const [left, right] = here.filter(member => member !== own), middle: Spot = { ...SETUP_SCENE.you, face: null }, { pair, beside } = SETUP_SCENE;
  const standing: [BurrowView['members'][number], Spot][] = !left ? [[own, middle]] : !right ? [[own, pair[0]], [left, pair[1]]] : [[left, beside[0]], [own, middle], [right, beside[1]]];
  return <>{standing.map(([member, spot]) => <FloorCritter key={member.address} critter={{ ...spot, address: member.address, variant: member.variant, asleep: false }} />)}</>;
}

/**
 * One of two, as cards (flow page, .choices): native radios under the group's legend, so the keyboard and the screen
 * reader lose nothing; a card's name names its radio and the line under it describes it.
 */
function Choices({ legend, name, choices }: { legend: CopyId; name: string; choices: readonly { label: CopyId; help?: CopyId; checked: boolean; choose: () => void }[] }) {
  const group = useId();
  return (
    <fieldset className="choices"><legend>{copy[legend]}</legend>
      {choices.map((choice, index) => <label key={choice.label} className="choice">
        <input type="radio" name={name} checked={choice.checked} onChange={choice.choose} aria-labelledby={`${group}${index}`} aria-describedby={choice.help ? `${group}${index}h` : undefined} />
        {choice.help ? <><b id={`${group}${index}`}>{copy[choice.label]}</b><small id={`${group}${index}h`}>{copy[choice.help]}</small></> : <span id={`${group}${index}`}>{copy[choice.label]}</span>}
      </label>)}
    </fieldset>
  );
}

/**
 * A deadline as the flow page draws it, its absolute time in the field ("Wed 7 Oct, 18:00 (PDT)"), over the platform's
 * own picker, whose text shows instead while it has the focus.
 */
function DeadlineField({ label, value, change, help }: { label: CopyId; value: string; change: (value: string) => void; help?: string }) {
  const field = useId(), at = new Date(value).getTime(), shown = Number.isFinite(at);
  return (
    <div className="field">
      <label htmlFor={field}>{copy[label]}</label>
      <span className="deadline-box">
        <input id={field} type="datetime-local" required value={value} data-shown={shown} aria-describedby={help ? `${field}h` : undefined} onInput={event => change(event.currentTarget.value)} onChange={event => change(event.target.value)} />
        {shown ? <span aria-hidden="true">{absoluteDeadline(at)}</span> : null}
      </span>
      {help ? <small id={`${field}h`}>{help}</small> : null}
    </div>
  );
}
