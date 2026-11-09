import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { copy, formatCopy, type FeastClock, type Target } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import { useNotification } from './announcements.js';
import { deadlineLines } from './deadline-lines.js';
import { feastFrame, gatheringRow, GATHERING_SCENE, optionsRow, type FeastWriting, type Viewer } from './feast-place.js';
import { portraitVariant, type MemberFeast } from './feast-view.js';
import { targetOwnedBy } from './names.js';
import { FloorCritter } from './painted-floor.js';
import { FaceRow, PlaceScreen } from './place-screen.js';
import type { Me } from './session.js';
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

/**
 * A statement being written for `target`: its words, capped at 2,000 characters (PRD R10), whether the store has them,
 * and the save, after which `onSaved` runs with the form that was sent. The page turns to the statements the second
 * gathering closes, and the editor goes with it; words not yet saved cannot be any more (PRD R13), so the member is told
 * rather than finding them gone (QA edge-states-03).
 */
function useStatement(target: Target, { feast, api, run, refresh, announce }: FeastWriting, onSaved: (form: HTMLFormElement) => void) {
  const initial = feast.statements.find(statement => statement.targetId === target.id)?.body ?? '';
  const [body, setBody] = useState(initial), [stored, setStored] = useState(initial), [limited, setLimited] = useState(false);
  const current = useRef(body), limitAnnounced = useRef(false), storedRef = useRef(initial), closesAt = useRef(feast.gatheringEndsAt);
  closesAt.current = feast.gatheringEndsAt;
  const notify = useNotification();
  useEffect(() => () => {
    const now = api.now();
    if (current.current !== storedRef.current && now !== null && now >= closesAt.current) notify(copy['gathering.closed']);
  }, [api, notify]);
  function change(value: string) {
    const next = cappedStatement(value); current.current = next.body; setBody(next.body); setLimited(next.truncated);
    if (next.truncated && !limitAnnounced.current) announce(copy['gathering.limit']);
    limitAnnounced.current = next.truncated;
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted = current.current, form = event.currentTarget;
    void run(async () => {
      await api.write(`/api/feasts/${feast.id}/statements/${target.id}`, 'PUT', { body: submitted });
      setStored(submitted); storedRef.current = submitted; announce(copy['gathering.saved']); onSaved(form); refresh();
    });
  }
  return { body, change, submit, limited, saved: body !== '' && body === stored, count: formatCopy('gathering.counter', { n: Array.from(body).length }) };
}

/**
 * Your own statement (flow page, gatheringSheet()): the prompt above the field, the count and "Saved." on one line, the
 * hidden line once as a leaf notice, and the gold Save.
 */
function OwnStatement({ target, onSaved, ...writing }: FeastWriting & { target: Target; onSaved: () => void }) {
  const statement = useStatement(target, writing, onSaved), heading = useId(), prompt = useId();
  return (
    <form className="statement-editor" onSubmit={statement.submit}>
      <h2 id={heading}>{copy['gathering.yours.title']}</h2>
      <p id={prompt} className="feast-help">{copy['gathering.prompt']}</p>
      <textarea aria-labelledby={heading} aria-describedby={prompt} value={statement.body} onChange={event => statement.change(event.target.value)} />
      <div className="statement-state"><span aria-live="off">{statement.count}</span>{statement.saved ? <span>{copy['gathering.saved']}</span> : null}</div>
      {statement.limited ? <p className="feast-help">{copy['gathering.limit']}</p> : null}
      <SheetNotice>{copy['gathering.hidden']}</SheetNotice>
      <button className="pill wide" disabled={writing.busy}>{copy['gathering.save']}</button>
    </form>
  );
}

/** When an option's Save gives way to "Saved.", the focus it held stays in the card, on that line, unless it has moved on. */
const keepFocusIn = (form: HTMLFormElement) => requestAnimationFrame(() => {
  if (form.isConnected && (document.activeElement === document.body || !document.activeElement)) form.querySelector<HTMLElement>('.statement-saved')?.focus();
});

/** An option's statement as a card (flow page, SCREENS['gathering-options']): its name, the field, the count, and Save until it is saved. */
function OptionStatement({ target, ...writing }: FeastWriting & { target: Target }) {
  const statement = useStatement(target, writing, keepFocusIn), heading = useId();
  return (
    <form className="statement-editor feast-card" onSubmit={statement.submit}>
      <h3 id={heading}>{targetLabel(target)}</h3>
      <textarea aria-labelledby={heading} placeholder={copy['setup.option.statement']} value={statement.body} onChange={event => statement.change(event.target.value)} />
      <div className="statement-state">
        <span aria-live="off">{statement.count}</span>
        {statement.saved ? <span className="statement-saved" tabIndex={-1}>{copy['gathering.saved']}</span> : <button className="pill soft small" disabled={writing.busy}>{copy['gathering.save']}</button>}
      </div>
      {statement.limited ? <p className="feast-help">{copy['gathering.limit']}</p> : null}
    </form>
  );
}

/**
 * The creator's statements for an options feast (flow page, SCREENS['gathering-options']; PRD P1), written during the
 * draft or while gathering: one help line over a card for each option.
 */
export function OptionStatements(writing: FeastWriting) {
  return <>
    <h2>{copy['gathering.options.title']}</h2>
    <p className="feast-help">{copy['setup.type.options.help']}</p>
    {writing.feast.targets.map(target => <OptionStatement key={target.id} target={target} {...writing} />)}
  </>;
}

/**
 * The two closes in the sheet's first row, out of the header (the audit's X1) but both on screen, as PRD §6 asks: "Gathering
 * closes in 2 days", then "Scattering closes in 5 days", the next one "Closing soon" inside six hours. One plain
 * disclosure shows each one's absolute time under it.
 */
function Closes({ feast, now }: { feast: FeastClock; now: number }) {
  const [open, setOpen] = useState(false), at = [feast.gatheringEndsAt, feast.scatteringEndsAt];
  return (
    <button type="button" className="close-lines" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      {deadlineLines(feast, now).map((line, index) => <span key={index}>{line}{open ? <time dateTime={new Date(at[index]!).toISOString()}>{absoluteDeadline(at[index]!)}</time> : null}</span>)}
    </button>
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
 * critters asleep. The sheet's first row is the phase and both closes (X1, PRD §6). In a people feast you write your
 * statement, take the prompt for your own assistant from your notes, and see who has written; in an options feast the
 * creator writes a card for each option, and the members, who write nothing (PRD P1), see only how many are written
 * (QA lifecycle-10). The creator's own actions (`creator`) end the sheet. Statements are not secret from the host
 * (Technical Spec §2), so the hidden line says nobody else in the burrow sees them. The writer's critter smiles and nods
 * when its statement saves; `still` keeps it from moving. `trouble` is a refresh the store did not answer.
 */
export function Gathering({ me, viewer, now, still, trouble, creator, ...writing }: FeastWriting & {
  me: Me; viewer: Viewer; now: number; still: boolean; trouble: string; creator: ReactNode;
}) {
  const { feast } = writing, people = feast.kind === 'people', written = new Set(feast.participation.written);
  const own = people ? targetOwnedBy(feast, me.address) : undefined, writer = useSaveReply(still);
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
      <div className="phase-row"><span className="chip">{copy['phase.gathering']}</span><Closes feast={feast} now={now} /></div>
      {people
        ? <>{own ? <OwnStatement target={own} {...writing} onSaved={writer.reply} /> : null}<NotesCard feast={feast} announce={writing.announce} />{progress}</>
        : feast.createdBy.toLowerCase() === me.address.toLowerCase()
          ? <><OptionStatements {...writing} /><SheetNotice>{copy['gathering.hidden']}</SheetNotice></>
          : <>{progress}<SheetNotice>{copy['gathering.hidden']}</SheetNotice></>}
      {creator}
    </PlaceScreen>
  );
}
