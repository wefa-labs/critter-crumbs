import { useRef, useState } from 'react';
import { copy, formatCopy, type Target } from '@critter-crumbs/shared';
import { cappedStatement, statementParts } from './statements.js';
import { PortraitImage, targetLabel } from './ui.js';
import { portraitVariant, type MemberFeast } from './feast-view.js';
import type { AppApi, Me } from './session.js';
import type { RunAction } from './burrows.js';
/** A statement as text, links as elements (never HTML). `paragraphs` sets each blank-line-separated part as its own
 *  paragraph, as the review pages do in the game's statement panels. */
export function StatementText({ body, paragraphs = false }: { body: string; paragraphs?: boolean }) {
  const inline = (text: string) => statementParts(text).map((part, index) => part.href ? <a key={index} href={part.href} title={part.href} rel="noopener nofollow ugc">{part.label}</a> : part.text);
  return <div className="statement-text">{paragraphs ? body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{inline(paragraph)}</p>) : inline(body)}</div>;
}
function StatementEditor({ target, feast, api, run, busy, refresh, announce }: { target: Target; feast: MemberFeast; api: AppApi; run: RunAction; busy: boolean; refresh: () => void; announce: (text: string) => void }) {
  const initial = feast.statements.find(statement => statement.targetId === target.id)?.body ?? '';
  const [body, setBody] = useState(initial), [saved, setSaved] = useState(initial), [savedOnce, setSavedOnce] = useState(false), [limited, setLimited] = useState(false);
  const current = useRef(body), limitAnnounced = useRef(false);
  const count = Array.from(body).length;
  return <form className="statement-editor" onSubmit={event => { event.preventDefault(); const submitted = current.current; void run(async () => {
    await api.write(`/api/feasts/${feast.id}/statements/${target.id}`, 'PUT', { body: submitted }); setSaved(submitted); setSavedOnce(true); announce(copy['gathering.saved']); refresh();
  }); }}><div className="statement-heading"><PortraitImage address={target.ownerAddress ?? target.id} variant={portraitVariant(feast, target)} name={targetLabel(target)} size={64} /><h2>{targetLabel(target)}</h2></div>
    <label className="field"><span>{feast.kind === 'people' ? copy['gathering.yours.title'] : copy['setup.option.statement']}</span><textarea value={body} onChange={event => { const next = cappedStatement(event.target.value); current.current = next.body; setBody(next.body); setLimited(next.truncated); if (next.truncated && !limitAnnounced.current) announce(copy['gathering.limit']); limitAnnounced.current = next.truncated; }} /></label>
    <p>{feast.kind === 'people' ? copy['gathering.prompt'] : copy['setup.type.options.help']}</p><p aria-live="off">{formatCopy('gathering.counter', { n: count })}</p>{limited ? <p>{copy['gathering.limit']}</p> : null}<p>{copy['gathering.hidden']}</p><button disabled={busy}>{copy['gathering.save']}</button>{savedOnce && body === saved ? <span className="chip">{copy['gathering.saved']}</span> : null}
  </form>;
}
export function Gathering({ feast, me, api, run, busy, refresh, announce }: { feast: MemberFeast; me: Me; api: AppApi; run: RunAction; busy: boolean; refresh: () => void; announce: (text: string) => void }) {
  const editors = feast.targets.filter(target => feast.kind === 'options' ? feast.createdBy.toLowerCase() === me.address.toLowerCase() : target.ownerAddress?.toLowerCase() === me.address.toLowerCase());
  const missing = feast.targets.filter(target => !feast.participation.written.includes(target.id)).map(target => targetLabel(target));
  return <section><StatementPrompt feast={feast} announce={announce}/><p>{formatCopy('gathering.participation', { written: feast.participation.written.length, total: feast.targets.length })}</p>{missing.length ? <p>{formatCopy('gathering.notYet', { names: missing.join(', ') })}</p> : null}<p>{copy['gathering.hidden']}</p>
    {feast.kind === 'options' && editors.length ? <h2>{copy['gathering.options.title']}</h2> : null}{editors.map(target => <StatementEditor key={target.id} target={target} feast={feast} api={api} run={run} busy={busy} refresh={refresh} announce={announce} />)}
  </section>;
}

function StatementPrompt({feast,announce}:{feast:MemberFeast;announce:(text:string)=>void}) {
  const prompt=formatCopy('gathering.assistant.prompt',{title:feast.title,context:feast.context,kind:copy[feast.kind==='people'?'setup.type.people':'setup.type.options'],gathering:new Date(feast.gatheringEndsAt).toISOString(),scattering:new Date(feast.scatteringEndsAt).toISOString()});
  const field=useRef<HTMLTextAreaElement>(null);
  async function copyPrompt() { try { await navigator.clipboard.writeText(prompt); announce(copy['gathering.assistant.copied']); } catch { field.current?.focus(); field.current?.select(); announce(copy['gathering.assistant.select']); } }
  return <details><summary>{copy['gathering.assistant.title']}</summary><p>{copy['gathering.assistant.help']}</p><label className="field">{copy['gathering.assistant.label']}<textarea ref={field} readOnly value={prompt} rows={12}/></label><button type="button" onClick={()=>{void copyPrompt();}}>{copy['gathering.assistant.copy']}</button></details>;
}
