import { useEffect, useRef, useState } from 'react';
import { copy, formatCopy, STATEMENTS_FOCUS_MS, WAKE } from '@critter-crumbs/shared';
import { Asleep, StatementReveal, type GameSettings } from '../world/index.js';
import { useAudio } from '../audio/context.js';
import { createStageRuntime } from '../sim/stage-runtime.js';
import { GameStage } from './game-stage.js';
import { StatementText } from './gathering.js';
import { Link, PortraitImage, navigate, targetLabel } from './ui.js';
import { portraitVariant, type MemberFeast } from './feast-view.js';
export function Reveal({ feast, settings, announce }: { feast: MemberFeast; settings: GameSettings; announce: (text: string) => void }) {
  const audio = useAudio();
  const [runtime] = useState(() => { const game = createStageRuntime({ outputs: { sound: audio.cue }, asleep: true, issued: feast.crumbsPerCritter, settings, critters: feast.targets.map(target => ({ id: target.id, address: target.ownerAddress ?? target.id, ownerAddress: null, variant: portraitVariant(feast, target), name: targetLabel(target) })) }); return game; });
  const surface = useRef<HTMLElement>(null);
  const reading = useRef<HTMLAnchorElement>(null), focused = useRef(false);
  useEffect(() => {
    runtime.actions.beginReveal();
    const stop = runtime.start();
    const unwatch = runtime.onFrame(() => {
      const reveal = runtime.world.get(StatementReveal)!;
      surface.current?.style.setProperty('--daylight', String(reveal.daylight));
      for (const [index, cell] of Array.from(surface.current?.querySelectorAll<HTMLElement>('.critter-cell') ?? []).entries()) cell.dataset.awake = String(!runtime.critters[index]!.has(Asleep));
      if (reveal.ready && !focused.current) { focused.current = true; reading.current?.focus(); announce(formatCopy('reveal.announce', { n: feast.targets.length })); }
    });
    runtime.animateFor(STATEMENTS_FOCUS_MS + WAKE.ms);
    return () => { unwatch(); stop(); runtime.destroy(); };
  }, [runtime]);
  useEffect(() => runtime.setSettings(settings), [runtime, settings]);
  return <section className="reveal" ref={surface}><h2>{copy['reveal.title']}</h2><p>{formatCopy('reveal.body', { crumbs: feast.crumbsPerCritter })}</p><a className="button" ref={reading} href={`/feasts/${feast.id}/read`} onClick={event => { event.preventDefault(); navigate(`/feasts/${feast.id}/read`); }}>{copy['reveal.cta']}</a><Link href={`/feasts/${feast.id}/scatter`}>{copy['read.skip']}</Link><ul role="list" className="critter-grid">{feast.targets.map((target, index) => <li className="critter-cell" key={target.id}><GameStage entity={runtime.critters[index]!} /><h3>{targetLabel(target)}</h3><details onToggle={event => { if (event.currentTarget.open) audio.play('statement.open'); }}><summary>{feast.statements.find(statement => statement.targetId === target.id)?.body.split('\n')[0] || (target.kind === 'option' ? copy['read.option.noStatement'] : formatCopy('read.noStatement', { name: targetLabel(target) }))}</summary><StatementText body={feast.statements.find(statement => statement.targetId === target.id)?.body ?? ''} /></details></li>)}</ul></section>;
}
export function ReadPass({ feast, settings }: { feast: MemberFeast; settings: GameSettings }) {
  const [index, setIndex] = useState(0), list = useRef<HTMLUListElement>(null), quiet = settings.still || settings.reducedMotion;
  const move = (next: number) => { const item = list.current?.children[Math.max(0, Math.min(feast.targets.length - 1, next))]; item?.scrollIntoView({ behavior: quiet ? 'instant' : 'smooth', block: 'nearest', inline: 'center' }); };
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { const visible = entries.filter(entry => entry.intersectionRatio >= .6).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) setIndex(Number((visible.target as HTMLElement).dataset.index)); }, { root: list.current, threshold: [.6, .8, 1] });
    for (const item of list.current!.children) observer.observe(item);
    return () => observer.disconnect();
  }, []);
  return <section><div className="actions"><p aria-live="off">{formatCopy('read.position', { i: index + 1, n: feast.targets.length })}</p><button className="secondary" disabled={index === 0} onClick={() => move(index - 1)}>{copy['read.prev']}</button><button className="secondary" disabled={index === feast.targets.length - 1} onClick={() => move(index + 1)}>{copy['read.next']}</button><Link href={`/feasts/${feast.id}/scatter`}>{copy['read.skip']}</Link></div>
    <ul ref={list} role="list" className="read-carousel" tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; const positions: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: feast.targets.length - 1 }; const next = positions[event.key]; if (next !== undefined) { event.preventDefault(); move(next); } }}>{feast.targets.map((target, i) => {
      const body = feast.statements.find(statement => statement.targetId === target.id)?.body;
      return <li key={target.id} data-index={i}><article aria-labelledby={target.id}><PortraitImage address={target.ownerAddress ?? target.id} variant={portraitVariant(feast, target)} name={targetLabel(target)} size={64} /><h2 id={target.id}>{targetLabel(target)}</h2>{body ? <StatementText body={body} /> : <p>{target.kind === 'option' ? copy['read.option.noStatement'] : formatCopy('read.noStatement', { name: targetLabel(target) })}</p>}{i === feast.targets.length - 1 ? <Link className="button" href={`/feasts/${feast.id}/scatter`}>{copy['read.done']}</Link> : null}</article></li>;
    })}</ul>
  </section>;
}
