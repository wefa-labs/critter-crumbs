import { Renderer } from './renderer.js';
import { memberName, targetOwnedBy } from './names.js';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { WorldProvider, useTrait } from 'koota/react';
import type { Entity } from 'koota';
import type { StageRuntime } from '../sim/stage-runtime.js';
import { GameScene, HeaderWhen } from '../game/parts.js';
import { FedLine, FocusRow, ResultsPill } from '../game/dock.js';
import { FeastSheet, WaitingSheet, statementSurfaces } from '../game/sheets.js';
import { Grow, ResultsCard, ResultsPanel } from '../game/surface.js';
import { faceCrop } from '../game/styles.js';
import { Received } from '../world/index.js';
import { ApiClientError, generateCritter, type Account } from '@critter-crumbs/core';
import { copy, formatCopy, CIRCLE_FEEL, FEAST, GROWTH, type CopyId, type TallyResult } from '@critter-crumbs/shared';
import { useAudio } from '../audio/context.js';
import { Feast as FeastTrait, type GameSettings } from '../world/index.js';
import { createStageRuntime } from '../sim/stage-runtime.js';
import { critterVersion, gardenReview } from '../portraits/version.js';
import { portraitMetrics } from '../portraits/metrics.js';
import { aggregateCsv, giverCsv, downloadCsv } from './csv.js';
import { ResultRecord } from './result-record.js';
import type { RunAction } from './burrows.js';
import { joinNames, percentShare } from './time.js';
import { browserReceiptBook } from './receipts.js';
import { createHops } from './heap.js';
import { PortraitImage, targetLabel } from './ui.js';
import { gameView, isMemberFeast, portraitVariant, resultStates, resultsViews, type MemberFeast, type PublicFeast, type ResultsView } from './feast-view.js';
import type { OpenedFeast } from './feast-session.js';
import type { AppApi, Me } from './session.js';



export default function Results({ feast, api, me, settings, announce, report, account, run, busy, clearError }: { feast: MemberFeast; api: AppApi; me: Me; settings: GameSettings; announce: (text: string) => void; report: (error: unknown) => void; account: () => Account | null; run: RunAction; busy: boolean; clearError: () => void }) {
  const [opened, setOpened] = useState<OpenedFeast | null>(null), [error, setError] = useState<CopyId | null>(null), [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true, timer: ReturnType<typeof setTimeout> | undefined; setError(null);
    const delayed = setTimeout(() => { if (active) { setError('err.keyUnreachable'); report(new ApiClientError('err.keyUnreachable', 503)); } }, 20000);
    async function load() {
      try {
        const { openFeast } = await import('../crypto/index.js');
        const value = await openFeast(api, feast, browserReceiptBook().read(feast.id, me.address));
        if (!active) return;
        if (value) { clearTimeout(delayed); setOpened(value); setError(null); clearError(); return; }
        setError('feast.keyNotYet');
      } catch (failure) {
        if (!active) return;
        const id = failure instanceof ApiClientError ? failure.copyId : 'err.generic';
        if (id !== 'err.keyUnreachable') { clearTimeout(delayed); setError(id); report(failure); }
      }
      if (active) timer = setTimeout(() => { void load(); }, 60000);
    }
    void load(); return () => { active = false; clearTimeout(delayed); clearTimeout(timer); };
  }, [api, feast.id, me.address, retry]);
  if (!opened) return <WaitingScene feast={feast} settings={settings} announce={announce} error={error} retry={() => setRetry(value => value + 1)} />;
  return <FeastResults feast={feast} opened={opened} settings={settings} announce={announce} viewer={me.address} {...(feast.aggregatePublic ? { record: <ResultRecord feast={feast} result={opened.result} api={api} me={me} account={account} run={run} busy={busy} /> } : {})} />;
}

/** Flow 42 and 43: the circle asleep at dusk while the key is fetched, the sheet saying so. */
export function WaitingScene({ feast, settings, announce, error, retry }: { feast: MemberFeast; settings: GameSettings; announce: (text: string) => void; error: CopyId | null; retry: () => void }) {
  const [focus, setFocus] = useState(0), [runtime] = useState(() => createStageRuntime({ issued: feast.crumbsPerCritter, asleep: true, settings, critters: feast.targets.map(target => ({ id: target.id, address: target.ownerAddress ?? target.id, ownerAddress: target.ownerAddress, name: targetLabel(target), variant: portraitVariant(feast, target) })) }));
  useEffect(() => { const stop = runtime.start(); announce(copy['feast.waiting.title']); return () => { stop(); queueMicrotask(() => runtime.destroy()); }; }, [runtime]);
  useEffect(() => runtime.setSettings(settings), [runtime, settings]);
  /* the reason the feast cannot be laid out yet is read out once; other errors reach the app's alert */
  useEffect(() => { if (error === 'feast.keyNotYet') announce(copy[error]); }, [error]);
  const view = gameView({ phase: feast.phase, remaining: 0, keyPending: error === 'feast.keyNotYet' });
  return <WorldProvider world={runtime.world}><section className="game-flow"><GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={view.state} editable={false} announce={announce} remaining={0} surfaces={{ sheet: <WaitingSheet error={error} retry={retry} /> }} /></section></WorldProvider>;
}

/** The results' first lines: how many scattered and how many crumbs, as the burrow or a visitor may know it. */
function summaryOf(feast: PublicFeast, result: Pick<TallyResult, 'counted' | 'totalScattered'>) {
  if (isMemberFeast(feast)) return formatCopy('results.summary', { scatterers: result.counted.length, total: feast.participants.length, totalCrumbs: result.totalScattered });
  const scatterers = feast.aggregate?.scatterers ?? 0;
  return feast.kind === 'people' ? formatCopy('results.summary', { scatterers, total: feast.targets.length, totalCrumbs: result.totalScattered }) : formatCopy('results.public.summary', { scatterers, totalCrumbs: result.totalScattered });
}
const fedFor = (share: [number, number], n: number) => Math.min(1, share[0] / share[1] * n / GROWTH.fairShareCap) ** GROWTH.exponent;

/** Replay Feast and Download; on the phone Download is short so both fit one row, keeping "Download CSV" as its name. */
export function ResultActions({ replay, download, short }: { replay: () => void; download: () => void; short: boolean }) {
  return <><button type="button" className="pill soft" onClick={replay}>{copy['feast.replay']}</button><button type="button" className="pill soft" aria-label={short ? copy['results.export'] : undefined} onClick={download}>{copy[short ? 'results.export.short' : 'results.export']}</button></>;
}

/**
 * The ranked list (scatter page resultsList, with the flow page's lines for one scatterer, a tie, the record and a public
 * result): who scattered, the critters that received crumbs largest first, the lines about the list, the privacy line.
 */
function ResultsList({ feast, opened, record, givers, actions }: { feast: PublicFeast; opened: OpenedFeast; record?: ReactNode; givers?: () => void; actions?: ReactNode }) {
  const { result } = opened, member = isMemberFeast(feast);
  const rows = [...result.totals].filter(row => row.crumbs > 0).sort((a, b) => b.crumbs - a.crumbs || feast.targets.findIndex(t => t.id === a.targetId) - feast.targets.findIndex(t => t.id === b.targetId));
  const one = member && result.counted.length === 1, ties = result.ties.filter(group => result.totalScattered > 0 && group.length > 1);
  return (
    <div className="results-list">
      <p className="results-sum"><span>{summaryOf(feast, result)}</span>{member && !one ? <><br />{result.didNotScatter.length ? formatCopy('results.didNotScatter', { names: joinNames(result.didNotScatter.map(address => memberName(feast, address))) }) : copy['results.everyone']}</> : null}</p>
      <ol className="results-rows">
        {rows.map(row => {
          const target = feast.targets.find(t => t.id === row.targetId)!;
          return <li key={row.targetId} className="results-row"><span className="results-face">{gardenReview ? <CritterFace address={target.ownerAddress ?? target.id} variant={portraitVariant(feast, target)} name={targetLabel(target)} size={44} /> : <PortraitImage address={target.ownerAddress ?? target.id} variant={portraitVariant(feast, target)} name={targetLabel(target)} size="stage" fed={fedFor(row.share, feast.targets.length)} />}</span><span className="results-name">{targetLabel(target)}</span><span className="results-amount">{row.crumbs}<small>{percentShare(row.share)}</small></span></li>;
        })}
      </ol>
      {one ? <p className="results-sum">{formatCopy('results.one', { name: memberName(feast, result.counted[0]!.attester) })}</p> : null}
      {ties.map(group => <p className="results-sum" key={group[0]}>{formatCopy('results.tie', { names: joinNames(group.map(id => targetLabel(feast.targets.find(t => t.id === id)!))) })}</p>)}
      {result.rejected.length ? <p className="results-note">{formatCopy('results.unreadable', { names: joinNames(result.rejected.map(entry => memberName(feast, entry.attester))) })}</p> : null}
      {opened.missingUids.map(uid => <p className="results-note receipt-evidence" key={uid}>{formatCopy('err.uidMissing', { uid })}</p>)}
      {record ?? <p className="results-sum">{copy[feast.aggregatePublic ? 'results.public' : 'results.private']}</p>}
      {givers ? <button type="button" className="quiet left" onClick={givers}>{copy['results.givers.title']}</button> : null}
      {member ? <details className="results-fingerprint"><summary>{copy['results.verification']}</summary><code className="receipt-evidence">{result.resultHash}</code></details> : null}
      {actions ? <div className="results-actions">{actions}</div> : null}
    </div>
  );
}

/** A critter's face cropped to the head, as the flow page draws the givers' table (face()). */
function CritterFace({ address, variant, name, size }: { address: string; variant: number; name: string; size: number }) {
  const extent = portraitMetrics(generateCritter(address, variant, critterVersion)).extent;

  return <span className="critter-face" style={faceCrop(size, extent.headY, extent.headX, extent.headX === undefined ? undefined : extent.headRadius)} aria-hidden="true"><PortraitImage address={address} variant={variant} name={name} size="stage" /></span>;
}

/** Flow 47: who gave what, the table scrolling sideways with each giver held at the left (Design System §6.5). */
function GiverTable({ feast, opened, viewer }: { feast: MemberFeast; opened: OpenedFeast; viewer?: string }) {

  return (
    <div className="results-list">
      <p className="results-sum" aria-hidden="true">{copy['results.givers.caption']}</p>
      <div className="giver-scroll">
        <table className="giver-matrix">
          <caption className="sr-only">{copy['results.givers.caption']}</caption>
          <thead><tr><th scope="col">{copy['results.col.giver']}</th>{feast.targets.map(target => <th scope="col" key={target.id} aria-label={targetLabel(target)}><CritterFace address={target.ownerAddress ?? target.id} variant={portraitVariant(feast, target)} name={targetLabel(target)} size={26} /></th>)}</tr></thead>
          <tbody>{opened.givers.map(giver => {
            const owner = targetOwnedBy(feast, giver.attester), name = memberName(feast, giver.attester);
            return <tr key={giver.uid}><th scope="row">{owner ? <CritterFace address={owner.ownerAddress ?? owner.id} variant={portraitVariant(feast, owner)} name={name} size={26} /> : null}{giver.attester.toLowerCase() === viewer?.toLowerCase() ? formatCopy('results.giver.you', { name }) : name}</th>{giver.amounts.map((amount, index) => <td key={feast.targets[index]!.id} className={amount ? undefined : 'zero'}>{amount ? amount : <><span aria-hidden="true">{copy['results.givers.none']}</span><span className="sr-only">{amount}</span></>}</td>)}</tr>;
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

/** After the feast, with the results closed: the focused critter's name over what it received and its share. */
function FeastFocus({ entity, runtime, feast, focus }: { entity: Entity; runtime: StageRuntime; feast: PublicFeast; focus: number }) {
  const received = useTrait(entity, Received)!, output = useRef<HTMLSpanElement>(null);
  useEffect(() => { const draw = () => { if (output.current) output.current.textContent = String(runtime.feastPresentation()?.counts[focus] ?? received.crumbs); }; draw(); return runtime.onFrame(draw); }, [entity, focus, runtime]);
  return <FocusRow name={targetLabel(feast.targets[focus]!)} line={<FedLine received={<span ref={output}>{received.crumbs}</span>} share={percentShare(received.share)} />} />;
}

export type { ResultsView } from './feast-view.js';
/** The feast heap draws at most FEAST.glyphs crumbs however many were scattered (Game Design G6), emptying as they fly. */
export const feastHeapGlyphs = (fraction: number) => Math.max(0, Math.round(fraction * FEAST.glyphs));
/**
 * The feast and what follows it. While it plays, the sheet says what is happening and offers Skip to results; then the
 * results grow out of the dock on the phone and fill the side panel on desktop, the critters huddled on their edge.
 * Closed, the circle shows everyone grown with their totals and Results in the bar opens them again.
 */
export function FeastResults({ feast, opened, settings, announce, record, viewer, initialPlaying = true, initialView = resultsViews.results }: { feast: PublicFeast; opened: OpenedFeast; settings: GameSettings; announce: (text: string) => void; record?: ReactNode; viewer?: string; initialPlaying?: boolean; initialView?: ResultsView }) {
  const { result } = opened, audio = useAudio(), surface = useRef<HTMLElement>(null), source = useRef<HTMLDivElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const [playing, setPlaying] = useState(initialPlaying), [beat, setBeat] = useState(''), [focus, setFocus] = useState(0), [view, setView] = useState<ResultsView>(initialView), [reading, setReading] = useState(false), [presentation, setPresentation] = useState({ counts: result.totals.map(() => 0), remaining: 0 });
  const [hops] = useState(() => createHops(document, () => source.current, id => surface.current?.querySelector<HTMLElement>(`[data-critter-id="${id}"]`) ?? null, () => runtime.world));
  const [runtime] = useState(() => createStageRuntime({ issued: isMemberFeast(feast) ? feast.crumbsPerCritter : feast.aggregate?.crumbsIssued ?? 100, asleep: true, settings, critters: feast.targets.map(target => ({ id: target.id, address: target.ownerAddress ?? target.id, ownerAddress: target.ownerAddress, name: targetLabel(target), variant: portraitVariant(feast, target) })), outputs: { sound: audio.cue, hop: cue => hops.add(cue) } }));
  useEffect(() => {
    runtime.actions.beginFeast(result); if (!initialPlaying) runtime.actions.skipFeast(); const stop = runtime.start(); runtime.animateFor(FEAST.maxMs); let settled = false, previous = '', previousFocus = -1, lastPresentation = -1;
    const frame = runtime.onFrame(now => {
      hops.tick(); const state = runtime.world.query(FeastTrait)[0]?.get(FeastTrait), shown = runtime.feastPresentation(); if (!state || !shown) return;
      if (state.beat !== previous) { previous = state.beat; setBeat(state.beat); }
      if (state.index >= 0 && state.index !== previousFocus) { previousFocus = state.index; setFocus(state.index); }
      const step = Math.floor(now / CIRCLE_FEEL.presentationMs); if (step !== lastPresentation) { lastPresentation = step; setPresentation({ counts: shown.counts, remaining: feastHeapGlyphs(shown.heapFraction) }); }
      if (!shown.settled) settled = false;
      if (shown.settled && !settled) { settled = true; setPlaying(false); const maximum = Math.max(0, ...result.totals.map(row => row.crumbs)); const top = result.totals.filter(row => row.crumbs === maximum).map(row => targetLabel(feast.targets.find(t => t.id === row.targetId)!)); announce(maximum ? formatCopy('feast.announce', { topName: joinNames(top) }) : copy['results.nobody']); }
    });
    return () => { audio.stop(); frame(); stop(); hops.clear(); queueMicrotask(() => runtime.destroy()); };
  }, [runtime]);
  useEffect(() => { runtime.setSettings(settings); if (settings.still || settings.reducedMotion) hops.clear(); }, [runtime, settings]);
  useEffect(() => { if (!playing && view !== 'closed') heading.current?.focus(); }, [playing, view]);
  const member = isMemberFeast(feast) ? feast : null, nobody = !result.totalScattered;
  const state = gameView({ phase: feast.phase, remaining: 0, opened: true, playing, resultsOpen: view !== 'closed', ...(nobody ? { resultState: resultStates.nobody } : view === 'givers' ? { resultState: resultStates.givers } : {}) }).state;
  const replay = () => { audio.stop(); hops.clear(); setPlaying(true); setFocus(0); setView(resultsViews.results); runtime.actions.replayFeast(); runtime.animateFor(FEAST.maxMs); };
  const skip = () => { hops.clear(); runtime.actions.skipFeast(); runtime.animateFor(FEAST.skipMs); };
  const download = () => downloadCsv(document, feast.title, aggregateCsv(feast.targets, result));
  const toggle = () => { setReading(false); setView(value => value === 'closed' ? resultsViews.results : resultsViews.closed); };
  const givers = member?.individualOpen ? () => setView(resultsViews.givers) : undefined;
  const title = copy[view === 'givers' ? 'results.givers.title' : 'results.title'];
  const content = (phone: boolean) => view === 'givers' && member
    ? <><GiverTable feast={member} opened={opened} {...(viewer ? { viewer } : {})} />{phone ? <div className="results-actions single"><button type="button" className="pill soft wide" onClick={() => downloadCsv(document, feast.title, giverCsv(member, opened), true)}>{copy['results.export.givers']}</button></div> : null}</>
    : <ResultsList feast={feast} opened={opened} record={record} {...(givers ? { givers } : {})} {...(phone ? { actions: <ResultActions replay={replay} download={download} short /> } : {})} />;
  const panelActions = view === 'givers' && member
    ? <button type="button" className="pill soft wide" onClick={() => downloadCsv(document, feast.title, giverCsv(member, opened), true)}>{copy['results.export.givers']}</button>
    : <ResultActions replay={replay} download={download} short={false} />;
  /* the phone's close icon folds the results back into the bar; from who gave what it returns to the results */
  const close = view === 'givers' ? () => setView(resultsViews.results) : member ? () => setView(resultsViews.closed) : undefined;
  return (
    <WorldProvider world={runtime.world}>
      <section className="game-flow feast-results" ref={surface} data-result-hash={member ? result.resultHash : undefined} data-record-uid={!member ? feast.resultAttestation?.uid : undefined} data-feast-beat={beat}>
        <Renderer runtime={runtime} settings={settings} surface={surface} announce={announce} />
        {!playing ? <HeaderWhen>{summaryOf(feast, result)}</HeaderWhen> : null}
        <GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={state} editable={false} announce={announce} heapHost={source}
          reading={reading && state === 'feasted'} {...(member ? { onRead: () => { setReading(true); audio.play('statement.open'); } } : {})} onClose={() => setReading(false)} counts={presentation.counts} remaining={presentation.remaining} issued={FEAST.glyphs}
          surfaces={playing ? { sheet: <FeastSheet skip={skip} /> }
            : nobody ? { sheet: <NobodySheet summary={summaryOf(feast, result)} privacy={copy[feast.aggregatePublic ? 'results.public' : 'results.private']} heading={heading} /> }
            : {
              focusRow: <FeastFocus key={focus} entity={runtime.critters[focus]!} runtime={runtime} feast={feast} focus={focus} />,
              middle: <ResultsPill open={view !== 'closed'} toggle={toggle} />,
              ...(member ? { statement: statementSurfaces({ feast: member, runtime, focus, close: () => setReading(false) }) } : {}),
              results: {
                card: <ResultsCard title={title} heading={heading} {...(close ? { close } : {})}>{content(true)}</ResultsCard>,
                panel: <ResultsPanel title={title} heading={heading} actions={panelActions} {...(view === 'givers' ? { close: () => setView(resultsViews.results) } : {})}>{content(false)}</ResultsPanel>,
              },
            }} />
      </section>
    </WorldProvider>
  );
}

/** Flow 45: nobody scattered; the critters stay as they were and there is nothing to replay. */
function NobodySheet({ summary, privacy, heading }: { summary: string; privacy: string; heading: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <>
      <h2 ref={heading} tabIndex={-1}>{copy['results.title']}</h2>
      <p className="sheet-help">{summary}</p>
      <p>{copy['results.nobody']}</p>
      <Grow />
      <p className="sheet-help">{privacy}</p>
    </>
  );
}
