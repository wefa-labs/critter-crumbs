import { useRef, useState } from 'react';
import { copy, formatCopy, MAX_FEAST_TARGETS, parseFeastSetup, ValidationError, type FeastKind } from '@critter-crumbs/shared';
import type { AppApi } from './session.js';
import type { BurrowView, RunAction } from './burrows.js';
import { Field, Link, Page, navigate, useResource } from './ui.js';
import { cappedStatement } from './statements.js';
import { localDateTime, localTimeZone } from './time.js';
export function SetupRoute({ burrowId, api, run, busy, announce }: { burrowId: string; api: AppApi; run: RunAction; busy: boolean; announce: (text: string) => void }) {
  const resource = useResource<BurrowView>(api, `/api/burrows/${burrowId}`);
  if (!resource.data) return <Page title={resource.error ? copy['burrow.unknown.title'] : copy['app.loading']}>{resource.error ? <button onClick={resource.refresh}>{copy['action.retry']}</button> : null}</Page>;
  return <SetupForm burrow={resource.data} api={api} run={run} busy={busy} announce={announce} />;
}
function SetupForm({ burrow, api, run, busy, announce }: { burrow: BurrowView; api: AppApi; run: RunAction; busy: boolean; announce: (text: string) => void }) {
  const [title, setTitle] = useState(''), [context, setContext] = useState(''), [kind, setKind] = useState<FeastKind>('people');
  const [crumbs, setCrumbs] = useState(100), [gathering, setGathering] = useState(() => localDateTime(burrow.serverNow + 86400000)), [scattering, setScattering] = useState(() => localDateTime(burrow.serverNow + 172800000));
  const [aggregatePublic, setAggregate] = useState(false), [individualOpen, setIndividual] = useState(false);
  const [options, setOptions] = useState([{ id: crypto.randomUUID(), name: '', statement: '' }]);
  const count = burrow.members.filter(member => member.leftAt === null).length;
  const capacity = kind === 'people' ? count > MAX_FEAST_TARGETS : options.length > MAX_FEAST_TARGETS;
  const minimum = kind === 'people' && count < 3;
  const [error, setError] = useState('');
  const limits = useRef(new Set<number>()), [limited, setLimited] = useState<number | null>(null);
  function edit(index: number, update: Partial<{ name: string; statement: string }>) { setOptions(options => options.map((option, i) => i === index ? { ...option, ...update } : option)); }
  function statement(index: number, value: string) { const next = cappedStatement(value); edit(index, { statement: next.body }); setLimited(next.truncated ? index : null); if (next.truncated && !limits.current.has(index)) announce(copy['gathering.limit']); if (next.truncated) limits.current.add(index); else limits.current.delete(index); }
  return <Page title={copy['setup.title']} context={burrow.name}><p>{burrow.name}</p><p className="chip">{copy['setup.draft.chip']}</p><form className="form-column" onSubmit={event => { event.preventDefault(); setError(''); void run(async () => {
    try {
      const setup = parseFeastSetup({ title, context, kind, crumbsPerCritter: crumbs, gatheringEndsAt: new Date(gathering).getTime(), scatteringEndsAt: new Date(scattering).getTime(), aggregatePublic, individualOpen, options });
      const now = api.now(); if (now === null || setup.gatheringEndsAt <= now) throw new ValidationError('setup.deadline.order');
      const draft = await api.write(`/api/burrows/${burrow.id}/feasts`, 'POST', setup); navigate(`/feasts/${draft.id}`);
    } catch (error) { if (error instanceof ValidationError) setError(copy[error.copyId]); throw error; }
  }); }}>
    <Field label="setup.field.title"><input required maxLength={80} value={title} onChange={event => setTitle(event.target.value)} /></Field>
    <Field label="setup.field.context" help="setup.field.context.help"><input maxLength={140} value={context} onChange={event => setContext(event.target.value)} /></Field>
    <fieldset><legend>{copy['setup.field.type']}</legend><label><input type="radio" name="kind" checked={kind === 'people'} onChange={() => setKind('people')} />{copy['setup.type.people']}<small>{copy['setup.type.people.help']}</small></label><label><input type="radio" name="kind" checked={kind === 'options'} onChange={() => setKind('options')} />{copy['setup.type.options']}<small>{copy['setup.type.options.help']}</small></label></fieldset>
    {kind === 'options' ? <fieldset><legend>{copy['setup.options.title']}</legend>{options.map((option, index) => <div className="option-fields" key={option.id}><Field label="setup.option.name"><input required maxLength={80} value={option.name} onChange={event => edit(index, { name: event.target.value })} /></Field><Field label="setup.option.statement"><textarea value={option.statement} onChange={event => statement(index, event.target.value)} /></Field><p aria-live="off">{formatCopy('gathering.counter', { n: Array.from(option.statement).length })}</p>{limited === index ? <p>{copy['gathering.limit']}</p> : null}<button type="button" className="quiet" disabled={options.length === 1} onClick={() => setOptions(options => options.filter(item => item.id !== option.id))}>{copy['setup.option.remove']}</button></div>)}<button type="button" className="secondary" aria-disabled={options.length >= MAX_FEAST_TARGETS} onClick={() => options.length >= MAX_FEAST_TARGETS ? void run(async () => { setError(copy['err.feastCapacity']); throw new ValidationError('err.feastCapacity'); }) : setOptions(options => [...options, { id: crypto.randomUUID(), name: '', statement: '' }])}>{copy['setup.options.add']}</button></fieldset> : null}
    <Field label="setup.field.crumbs" help="setup.crumbs.help"><input type="number" min={10} max={1000} required value={Number.isNaN(crumbs) ? '' : crumbs} onChange={event => setCrumbs(event.target.valueAsNumber)} /></Field>
    <Field label="setup.field.gathering"><input type="datetime-local" required value={gathering} onInput={event => setGathering(event.currentTarget.value)} onChange={event => setGathering(event.target.value)} /></Field>
    <Field label="setup.field.scattering"><input type="datetime-local" required value={scattering} onInput={event => setScattering(event.currentTarget.value)} onChange={event => setScattering(event.target.value)} /></Field><p>{formatCopy('setup.deadline.help', { tz: localTimeZone() })}</p>
    <fieldset><legend>{copy['setup.privacy.title']}</legend><fieldset><legend>{copy['setup.privacy.aggregate.label']}</legend><label><input type="radio" name="aggregate" checked={!aggregatePublic} onChange={() => { setAggregate(false); }} />{copy['setup.privacy.aggregate.burrow']}</label><label><input type="radio" name="aggregate" checked={aggregatePublic} onChange={() => setAggregate(true)} />{copy['setup.privacy.aggregate.public']}</label></fieldset><label><input type="checkbox" checked={individualOpen} onChange={event => { setIndividual(event.target.checked); }} />{copy['setup.privacy.individual.label']}</label><p>{individualOpen ? copy[aggregatePublic ? 'setup.privacy.individual.open' : 'setup.privacy.individual.burrow'] : copy['setup.privacy.individual.closed']}</p></fieldset>
    {minimum ? <p>{formatCopy('setup.min.people', { n: count })}</p> : null}{capacity ? <p>{copy['err.feastCapacity']}</p> : null}{error ? <p className="notice error">{error}</p> : null}
    <div className="actions"><button aria-disabled={minimum || capacity} disabled={busy} onClick={event => { if (minimum || capacity) event.preventDefault(); }}>{copy['setup.save']}</button><Link href={`/burrows/${burrow.id}`}>{copy['action.cancel']}</Link></div>
  </form></Page>;
}
