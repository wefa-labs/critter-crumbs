import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { copy, formatCopy, type Target } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import { useNotification } from './announcements.js';
import type { RunAction } from './burrows.js';
import { deadlineLine } from './deadlines.js';
import { feastFrame, gatheringRow, GATHERING_SCENE, optionsRow, type Viewer } from './feast-place.js';
import { portraitVariant, type MemberFeast } from './feast-view.js';
import { FloorCritter } from './painted-floor.js';
import { FaceRow, PlaceScreen } from './place-screen.js';
import type { AppApi, Me } from './session.js';
import { cappedStatement, statementParts } from './statements.js';
import { absoluteDeadline } from './time.js';
import { targetLabel } from './ui.js';
import { useSaveReply } from './writer-nod.js';
import '../styles/feast-pages.css';

/** A statement as text, links as elements (never HTML). `paragraphs` sets each blank-line-separated part as its own
 *  paragraph, as the review pages do in the game's statement panels. */
export function StatementText({ body, paragraphs = false }: { body: string; paragraphs?: boolean }) {
  const inline = (text: string) => statementParts(text).map((part, index) => part.href ? <a key={index} href={part.href} title={part.href} rel="noopener nofollow ugc">{part.label}</a> : part.text);
  return <div className="statement-text">{paragraphs ? body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{inline(paragraph)}</p>) : inline(body)}</div>;
}

interface Writing { feast: MemberFeast; api: AppApi; run: RunAction; busy: boolean; refresh: () => void; announce: (text: string) => void }

const sameAddress = (a: string | null, b: string) => a?.toLowerCase() === b.toLowerCase();

/**
 * A statement being written: the field, its count and whether it is saved, which for a person's own statement are the
 * flow page's "Your statement" (the prompt above the field, the count and "Saved." on one line, the hidden line once as
 * a leaf notice and the gold Save) and for an option one card (its name, the field, the count, and Save until it is
 * saved). `saved` follows each save the store accepts.
 */
function StatementEditor({ target, feast, api, run, busy, refresh, announce, saved }: Writing & { target: Target; saved: () => void }) {
  const initial = feast.statements.find(statement => statement.targetId === target.id)?.body ?? '';
  const [body, setBody] = useState(initial), [stored, setStored] = useState(initial), [limited, setLimited] = useState(false);
  const current = useRef(body), limitAnnounced = useRef(false), storedRef = useRef(initial), closesAt = useRef(feast.gatheringEndsAt);
  closesAt.current = feast.gatheringEndsAt;
  const notify = useNotification(), heading = useId(), prompt = useId();
  /* The page turns to the statements the second gathering closes, and this editor goes with it. Words not yet saved
     cannot be any more (PRD R13), so the member is told rather than finding them gone (QA edge-states-03). */
  useEffect(() => () => {
    const now = api.now();
    if (current.current !== storedRef.current && now !== null && now >= closesAt.current) notify(copy['gathering.closed']);
  }, [api, notify]);
  const person = feast.kind === 'people', unsaved = body === '' || body !== stored;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted = current.current, form = event.currentTarget;
    void run(async () => {
      await api.write(`/api/feasts/${feast.id}/statements/${target.id}`, 'PUT', { body: submitted });
      setStored(submitted); storedRef.current = submitted; announce(copy['gathering.saved']); saved(); refresh();
      /* an option's Save gives way to "Saved.", so the focus it held stays in the card, on that line */
      requestAnimationFrame(() => { if (form.isConnected && !form.contains(document.activeElement)) form.querySelector<HTMLElement>('.statement-saved')?.focus(); });
    });
  }
  const field = <textarea aria-labelledby={heading} {...(person ? { 'aria-describedby': prompt } : { placeholder: copy['setup.option.statement'] })} value={body} onChange={event => {
    const next = cappedStatement(event.target.value); current.current = next.body; setBody(next.body); setLimited(next.truncated);
    if (next.truncated && !limitAnnounced.current) announce(copy['gathering.limit']);
    limitAnnounced.current = next.truncated;
  }} />;
  const count = <span aria-live="off">{formatCopy('gathering.counter', { n: Array.from(body).length })}</span>;
  const limit = limited ? <p className="feast-help">{copy['gathering.limit']}</p> : null;
  return person
    ? <form className="statement-editor" onSubmit={submit}>
        <h2 id={heading}>{copy['gathering.yours.title']}</h2>
        <p id={prompt} className="feast-help">{copy['gathering.prompt']}</p>
        {field}
        <div className="statement-state">{count}{unsaved ? null : <span>{copy['gathering.saved']}</span>}</div>
        {limit}
        <SheetNotice>{copy['gathering.hidden']}</SheetNotice>
        <button className="pill wide" disabled={busy}>{copy['gathering.save']}</button>
      </form>
    : <form className="statement-editor feast-card" onSubmit={submit}>
        <h3 id={heading}>{targetLabel(target)}</h3>
        {field}
        <div className="statement-state">{count}{unsaved ? <button className="pill soft small" disabled={busy}>{copy['gathering.save']}</button> : <span className="statement-saved" tabIndex={-1}>{copy['gathering.saved']}</span>}</div>
        {limit}
      </form>;
}

/**
 * The creator's statements for an options feast (flow page, SCREENS['gathering-options']; PRD P1), written during the
 * draft or while gathering: one help line over a card for each option.
 */
export function OptionStatements(props: Writing) {
  return <>
    <h2>{copy['gathering.options.title']}</h2>
    <p className="feast-help">{copy['setup.type.options.help']}</p>
    {props.feast.targets.map(target => <StatementEditor key={target.id} target={target} {...props} saved={() => {}} />)}
  </>;
}

/** The close in the sheet's first row, "Gathering closes in 2 days", with the absolute time a tap away as a plain disclosure (the audit's X1). */
function CloseLine({ phase, at, now }: { phase: 'gathering' | 'scattering'; at: number; now: number }) {
  const [open, setOpen] = useState(false), time = useId();
  return (
    <span className="close-line">
      <button type="button" aria-expanded={open} aria-controls={time} onClick={() => setOpen(value => !value)}>{deadlineLine(phase, at, now, true)}</button>
      <time id={time} dateTime={new Date(at).toISOString()} hidden={!open}>{absoluteDeadline(at)}</time>
    </span>
  );
}

/**
 * Start from your notes (PRD P15): the prompt to take to your own assistant, copied in one press. Where the browser will
 * not copy, the prompt opens in a field, selected, to be copied by hand.
 */
function NotesCard({ feast, announce }: { feast: MemberFeast; announce: (text: string) => void }) {
  const prompt = formatCopy('gathering.assistant.prompt', { title: feast.title, context: feast.context, kind: copy[feast.kind === 'people' ? 'setup.type.people' : 'setup.type.options'], gathering: new Date(feast.gatheringEndsAt).toISOString(), scattering: new Date(feast.scatteringEndsAt).toISOString() });
  const [byHand, setByHand] = useState(false), field = useRef<HTMLTextAreaElement>(null), heading = useId();
  const select = () => { field.current?.focus(); field.current?.select(); };
  useEffect(() => { if (byHand) select(); }, [byHand]);
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(prompt); announce(copy['gathering.assistant.copied']); }
    catch { if (byHand) select(); else setByHand(true); announce(copy['gathering.assistant.select']); }
  }
  return (
    <section className="feast-card" aria-labelledby={heading}>
      <h3 id={heading}>{copy['gathering.assistant.title']}</h3>
      <p className="feast-help">{copy['gathering.assistant.help']}</p>
      {byHand ? <label className="field"><span>{copy['gathering.assistant.label']}</span><textarea ref={field} readOnly value={prompt} rows={8} /></label> : null}
      <button type="button" className="pill soft small" onClick={() => { void copyPrompt(); }}>{copy['gathering.assistant.copy']}</button>
    </section>
  );
}

/**
 * Gathering (flow page, SCREENS.gathering and ['gathering-more'], ['gathering-options']; the November UI audit's screens
 * 28 to 30). The burrow's critters on the floor, those who have written awake and the rest asleep, or an options feast's
 * critters asleep. The sheet's first row is the phase and the close (X1). In a people feast you write your statement,
 * take the prompt for your own assistant from your notes, and see who has written; in an options feast the creator
 * writes a card for each option, and the members, who write nothing (PRD P1), see only how many are written (QA
 * lifecycle-10). The creator's own actions (`creator`) end the sheet. Statements are not secret from the host (Technical
 * Spec §2), so the hidden line says nobody else in the burrow sees them. The writer's critter smiles and nods when its
 * statement saves; `still` keeps it from moving. `trouble` is a refresh the store did not answer.
 */
export function Gathering({ feast, me, viewer, now, still, trouble, creator, ...writing }: Writing & {
  me: Me; viewer: Viewer; now: number; still: boolean; trouble: string; creator: ReactNode;
}) {
  const people = feast.kind === 'people', written = new Set(feast.participation.written);
  const own = people ? feast.targets.find(target => sameAddress(target.ownerAddress, me.address)) : undefined;
  const writer = useSaveReply(still);
  const faces = feast.targets.map(target => ({ key: target.id, address: target.ownerAddress ?? target.id, variant: portraitVariant(feast, target), name: targetLabel(target), done: written.has(target.id) }));
  const progress = <FaceRow count={formatCopy('gathering.participation', { written: faces.filter(face => face.done).length, total: faces.length })} faces={faces} notYet="gathering.notYet" />;
  const spots = (people ? gatheringRow : optionsRow)(feast.targets.length);
  return (
    <PlaceScreen {...feastFrame(feast, viewer)} painting={GATHERING_SCENE.painting} sheetHeight={GATHERING_SCENE.sheetHeight} className="feast-page feast-gathering"
      floor={spots.map(({ index, ...spot }) => {
        const target = feast.targets[index]!;
        return <FloorCritter key={target.id} critter={{ ...spot, address: target.ownerAddress ?? target.id, variant: portraitVariant(feast, target), asleep: !people || !written.has(target.id) }} delighted={target === own && writer.pleased}>
          {target === own ? <span ref={writer.mark} hidden /> : null}
        </FloorCritter>;
      })}>
      {trouble ? <SheetNotice trouble>{trouble}</SheetNotice> : null}
      <div className="phase-row"><span className="chip">{copy['phase.gathering']}</span><CloseLine phase="gathering" at={feast.gatheringEndsAt} now={now} /></div>
      {people
        ? <>{own ? <StatementEditor target={own} feast={feast} {...writing} saved={writer.reply} /> : null}<NotesCard feast={feast} announce={writing.announce} />{progress}</>
        : sameAddress(feast.createdBy, me.address)
          ? <><OptionStatements feast={feast} {...writing} /><SheetNotice>{copy['gathering.hidden']}</SheetNotice></>
          : <>{progress}<SheetNotice>{copy['gathering.hidden']}</SheetNotice></>}
      {creator}
    </PlaceScreen>
  );
}
