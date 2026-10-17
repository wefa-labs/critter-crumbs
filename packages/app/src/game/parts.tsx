import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { copy, formatCopy, CIRCLE_FEEL } from '@critter-crumbs/shared';
import { useTrait } from 'koota/react';
import type { Entity } from 'koota';
import { Asleep, Count, Identity, IsOwn, Name, Pile, Received } from '../world/index.js';
import type { StageRuntime } from '../sim/stage-runtime.js';
import { GameStage } from '../app/game-stage.js';
import { Link, ProfileButton, targetLabel } from '../app/ui.js';
import { portraitMetrics } from '../portraits/metrics.js';
import type { PublicFeast, GameScreenState } from '../app/feast-view.js';
import { circleBackRow, HEADER_HEIGHT, hitRect, layoutGame, shortName } from './layout.js';
import { rectStyle } from './styles.js';
import { composeGame, deviceFor } from './composition.js';
import { defaultScene } from './art.js';
import { presentSleep } from './motion.js';
import { SceneBackdrop } from './scenes.js';
import { CrumbMound, ThoughtBubble } from './mound.js';
import { Dock } from './dock.js';
import type { CritterElement } from './icons.js';
import { measureText } from './measure.js';
import { useScatterInput } from '../app/scatter-input.js';
import { useAudio, useMusic } from '../audio/context.js';


/**
 * The header over every core state: the burrow and the feast, a line at the right on desktop (the closing day while
 * scattering, the summary at the feast) and your critter's face, or Connect for a visitor (flow page, screen 50). A
 * screen for someone arriving by link gives its own line above the title and its own control at the right.
 */
export function GameFrame({ feast, viewer, onProfile, onConnect, when, burrowLine, aside, children }: { feast: PublicFeast; viewer?: { address: string; variant: number }; onProfile?: () => void; onConnect?: () => void; when?: ReactNode; burrowLine?: string; aside?: ReactNode; children: ReactNode }) {
  useLayoutEffect(() => { document.getElementById('content')?.focus(); }, []);
  useEffect(() => { document.title = formatCopy('app.contextTitle', { screen: feast.title, burrow: feast.burrowName }); }, [feast.title, feast.burrowName]);
  return (
    <div className="core-game">
      <header className="game-header">
        <div className="game-context">
          <Link className="game-burrow" href={'burrowId' in feast ? `/burrows/${feast.burrowId}` : '/'}>{burrowLine ?? feast.burrowName}</Link>
          <h1>{feast.title}</h1>
        </div>
        <span className="closing-day" id="game-when">{when}</span>
        {viewer
          ? <ProfileButton address={viewer.address} variant={viewer.variant} onClick={onProfile} />
          : onConnect ? <button type="button" className="pill soft small game-connect" onClick={onConnect}>{copy['action.connect']}</button> : aside ?? null}
      </header>
      <div className="game-content">{children}</div>
    </div>
  );
}

/** Puts a screen's own line (the feast summary) into the header's slot once the header has rendered. */
export function HeaderWhen({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.getElementById('game-when')), []);
  return host ? createPortal(children, host) : null;
}

function CritterSpot({ entity, runtime, onFocus, editable, announce, onOutside, gathered }: { entity: Entity; runtime: StageRuntime; onFocus: () => void; editable: boolean; onOutside?: () => void; gathered: boolean; announce: (text: string) => void }) {
  const own = entity.has(IsOwn) && entity.has(Asleep), name = entity.get(Name)!.display, input = useScatterInput(entity, runtime, name, announce);
  const act = (start: () => void) => {
    if (onOutside) { onOutside(); return; }
    if (gathered) { runtime.circle.play(entity); runtime.animateFor(CIRCLE_FEEL.playMs); }
    else if (own) { runtime.circle.stir(entity); runtime.animateFor(CIRCLE_FEEL.sleepGlyphMs); }
    else if (editable && runtime.heap.get(Pile)!.remaining) start();
    else onFocus();
  };
  return (
    <button className="circle-hit" type="button" aria-label={own ? copy['scatter.own.short'] : editable ? formatCopy('scatter.add', { name }) : name}
      onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); act(() => input.start(1)); }}
      onPointerMove={input.move} onPointerUp={input.stop} onPointerLeave={input.stop} onPointerCancel={input.stop} onLostPointerCapture={input.stop} onBlur={input.stop}
      onClick={event => { if (event.detail !== 0) return; act(() => input.tap(1)); }}>
      <GameStage entity={entity} />
      <span className="sleep-glyph" aria-hidden="true">{[0, 1, 2].map(index => <span key={index}>{copy['game.sleep.symbol']}</span>)}</span>
    </button>
  );
}
function CritterPile({ entity, amount, glyphs }: { entity: Entity; amount?: number; glyphs?: number }) { const count = useTrait(entity, Count)!; return <CrumbMound count={amount ?? count.given} {...(glyphs === undefined ? {} : { glyphs })} />; }
function TagCount({ entity, amount }: { entity: Entity; amount?: number }) { const count = useTrait(entity, Count)!, value = amount ?? count.given; return <b className="tag-count" data-zero={value <= 0}>{value}</b>; }

/** A version 2 critter's element, for its statement's chip; version 1 critters have none. */
export function critterElement(runtime: StageRuntime, index: number): CritterElement | null {
  const parameters = runtime.critters[index]?.get(Identity)?.parameters;
  return parameters?.version === '2' ? parameters.element as CritterElement : null;
}

/** What a state's surface holds; which of these shows is the composition's choice, not the screen's. */
export interface GameSurfaces {
  /** dock states: the focus row and the bar's middle; the results states keep the bar */
  focusRow?: ReactNode;
  middle?: ReactNode;
  /** sheet states: the phone's bottom sheet, the side panel on desktop */
  sheet?: ReactNode;
  /** dock states: the phone shows the statement while reading; the desktop panel always does */
  statement?: { phone?: ReactNode; panel: ReactNode };
  /** results states: the phone's card grown out of the dock, the desktop panel with its bar */
  results?: { card: ReactNode; panel: ReactNode };
  toast?: ReactNode;
  dialog?: ReactNode;
}

/**
 * One core game state: the floor and the circle, treated as the state's composition says (game/composition.ts), and
 * the surface the composition chooses. Geometry is the pure layout's; the Koota Clock drives every motion.
 */
export function GameScene({ runtime, feast, focus, turnTo, state, surfaces, reading = false, onRead, onClose, announce, editable = true, sceneId = defaultScene, counts, remaining, issued, heapHost }: {
  runtime: StageRuntime; feast: PublicFeast; focus: number; turnTo: (index: number) => void; state: GameScreenState; surfaces: GameSurfaces;
  reading?: boolean; onRead?: (index: number) => void; onClose?: () => void; announce: (text: string) => void; editable?: boolean; sceneId?: string;
  counts?: readonly number[]; remaining?: number; issued?: number; heapHost?: React.RefObject<HTMLDivElement | null>;
}) {
  const body = useRef<HTMLDivElement>(null), scene = useRef<HTMLDivElement>(null), dockHost = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const pile = useTrait(runtime.heap, Pile)!;
  const previous = useRef<ReturnType<typeof layoutGame> | null>(null), from = useRef<ReturnType<typeof layoutGame> | null>(null);
  useLayoutEffect(() => {
    const host = body.current!;
    const fit = (width: number, height: number) => setViewport(current => current.width === width && current.height === height + HEADER_HEIGHT ? current : { width, height: height + HEADER_HEIGHT });
    /* measured before the first paint: an update made here is drawn in the same frame, so a game screen never shows
       the phone layout it was first rendered with (QA lifecycle-12); the observer follows later changes */
    const box = host.getBoundingClientRect();
    fit(box.width, box.height);
    const observer = new ResizeObserver(entries => { const box = entries[0]!.contentRect; fit(box.width, box.height); });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  const composition = composeGame(state, deviceFor(viewport.width));
  const { surface, scene: treatment } = composition, gathered = treatment.huddle;
  /* the moment's mood: delighted when statements open, asleep when scattering closes; the feast sets its own */
  useEffect(() => runtime.setMood(treatment.mood), [runtime, treatment.mood]);
  /* the moment's music, which steps back while a statement is open */
  const audio = useAudio();
  useMusic(composition.music);
  useEffect(() => { audio.duck(reading); return () => audio.duck(false); }, [audio, reading]);
  /* the huddle gathers the critters that were fed; with nothing fed at all, nobody is left out */
  const fedAny = gathered && runtime.critters.some(entity => entity.get(Received)!.crumbs > 0);
  const critters = runtime.critters.map((entity, index) => ({
    name: targetLabel(feast.targets[index]!), own: entity.has(IsOwn) && treatment.ownAsleep,
    count: counts?.[index] ?? entity.get(Count)!.given,
    extent: portraitMetrics(entity.get(Identity)!.parameters, gathered ? entity.get(Received)!.fed : 0).extent,
    away: fedAny && entity.get(Received)!.crumbs <= 0,
  }));
  const layout = layoutGame({ viewport, critters, focus, reading, issued: issued ?? pile.issued, remaining: remaining ?? pile.remaining, surface, scene: treatment, measure: measureText });
  const turn = (direction: number) => turnTo((focus + direction + critters.length) % critters.length);
  const away = critters.filter(critter => critter.away).length;
  useLayoutEffect(() => {
    const old = previous.current;
    if (old && (old.slots[focus]!.slot !== 0 || old.dock.height !== layout.dock.height)) { from.current = old; runtime.circle.turn(old.slots.find(slot => slot.slot === 0)!.index, focus); runtime.animateFor(CIRCLE_FEEL.turnMs); }
    previous.current = layout; runtime.circle.huddle(gathered);
    const earlier = from.current ?? layout;
    const render = () => {
      const lighting = runtime.feastPresentation()?.lighting;
      scene.current?.style.setProperty('--scene-dusk', String(lighting?.dusk ?? 0));
      scene.current?.style.setProperty('--scene-feast', String(lighting?.feast ?? (treatment.light === 'feast' ? 1 : 0)));
      const t = runtime.circle.progress(), mix = (a: number, b: number) => a + (b - a) * t;
      for (const slot of layout.slots) {
        const old = earlier.slots[slot.index]!, host = scene.current?.querySelector<HTMLElement>(`[data-spot="${slot.index}"]`);
        if (!host) continue;
        Object.assign(host.style, rectStyle({ x: mix(old.stage.x, slot.stage.x), y: mix(old.stage.y, slot.stage.y), width: mix(old.stage.width, slot.stage.width), height: mix(old.stage.height, slot.stage.height) }));
        presentSleep(host, runtime.critters[slot.index]!, runtime.circle, gathered);
      }
      if (dockHost.current) Object.assign(dockHost.current.style, rectStyle({ ...layout.dock, y: mix(earlier.dock.y, layout.dock.y), height: mix(earlier.dock.height, layout.dock.height) }));
    };
    render();
    return runtime.onFrame(render);
  }, [focus, viewport.width, viewport.height, gathered, reading, surface.kind, surface.kind === 'sheet' ? surface.height : 0, away]);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const desktop = layout.desktop, showsDock = layout.dock.height > 0;
  const readerOf = (index: number) => () => { if (index !== focus) turnTo(index); onRead?.(index); };
  return (
    <div ref={body} className="game-body" data-desktop={desktop} data-crowd={layout.crowded} data-game-state={state} data-surface={surface.kind} data-light={treatment.light} data-reading={reading}
      onKeyDown={event => { if (event.target instanceof HTMLInputElement) return; if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); turn(event.key === 'ArrowLeft' ? -1 : 1); } else if (event.key === 'Escape') onClose?.(); }}>
      <div ref={scene} className="game-scene" style={{ width: layout.scene.width }}
        onPointerDown={event => { if (event.target === event.currentTarget || event.target instanceof Element && event.target.closest('.scene-backdrop')) swipe.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={event => { if (!swipe.current) return; const dx = event.clientX - swipe.current.x, dy = event.clientY - swipe.current.y; swipe.current = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1); else onClose?.(); }}
        onPointerCancel={() => { swipe.current = null; }}>
        <SceneBackdrop id={treatment.scene === 'dusk' ? 'dusk' : sceneId} desktop={desktop} size={layout.scene} backRow={circleBackRow(viewport, critters.length)} />
        <div className="scene-dusk-light" aria-hidden="true" />
        <div className="scene-feast-light" aria-hidden="true" />
        {layout.slots.map(slot => (
          <div key={slot.index} className="circle-spot" data-spot={slot.index} data-slot={slot.slot} data-face={slot.face} data-away={slot.away} style={{ ...rectStyle(slot.stage), zIndex: slot.depth }}>
            <CritterSpot entity={runtime.critters[slot.index]!} runtime={runtime} onFocus={() => turnTo(slot.index)} gathered={gathered} editable={editable && !reading && !gathered} announce={announce} {...(reading && onClose ? { onOutside: onClose } : {})} />
          </div>
        ))}
        {treatment.piles ? layout.slots.map(slot => (
          <div className="circle-pile" data-critter-id={feast.targets[slot.index]!.id} data-count-id={feast.targets[slot.index]!.id} key={slot.index} style={{ ...rectStyle(slot.pile), zIndex: slot.depth + 1 }}>
            <CritterPile entity={runtime.critters[slot.index]!} {...(slot.pile.glyphs === undefined ? {} : { glyphs: slot.pile.glyphs })} {...(counts ? { amount: counts[slot.index]! } : {})} />
          </div>
        )) : null}
        {layout.slots.filter(slot => !slot.tag.hidden).map(slot => (
          <button key={slot.index} type="button" className="critter-tag-target" aria-label={targetLabel(feast.targets[slot.index]!)} onClick={() => turnTo(slot.index)} style={{ ...rectStyle(hitRect(slot.tag)), zIndex: 2000 + slot.depth }}>
            <span className="critter-tag" data-tag={slot.index} data-focus={slot.slot === 0} data-own={critters[slot.index]!.own} style={{ minWidth: slot.tag.width, height: slot.tag.height }}>
              {slot.tag.short ? shortName(slot.name) : slot.name}
              {!(desktop && slot.slot === 0) && !critters[slot.index]!.own ? <TagCount entity={runtime.critters[slot.index]!} {...(counts ? { amount: counts[slot.index]! } : {})} /> : null}
            </span>
          </button>
        ))}
        {layout.heap && !reading ? <div className="circle-heap" data-heap="true" ref={heapHost} style={rectStyle(layout.heap)}><CrumbMound count={remaining ?? pile.remaining} empty ppu={layout.ppu} /></div> : null}
        {!reading ? layout.bubbles.map(bubble => (
          <button key={bubble.index} type="button" className="thought-target" data-focus={bubble.index === focus} aria-label={formatCopy('read.statement', { name: targetLabel(feast.targets[bubble.index]!) })} onClick={readerOf(bubble.index)} style={{ ...rectStyle(hitRect(bubble.rect)), zIndex: 2950, '--bubble-width': `${bubble.rect.width}px`, '--bubble-height': `${bubble.rect.height}px` } as CSSProperties}><ThoughtBubble /></button>
        )) : null}
        {layout.trail.map((puff, index) => <i key={index} className="thought-puff" aria-hidden="true" style={rectStyle(puff)} />)}
        {reading && !desktop && surfaces.statement?.phone ? <div className="statement-host" style={rectStyle(layout.statement)}>{surfaces.statement.phone}</div> : null}
        {surfaces.toast ?? null}
        {showsDock ? (
          <div ref={dockHost} className="dock-position" data-surface={surface.kind} style={rectStyle(layout.dock)}>
            {surface.kind === 'sheet'
              ? <section className="game-sheet">{surfaces.sheet}</section>
              : <Dock crumbs={surface.kind === 'dock' && treatment.heap === 'remaining'} focusRow={surface.kind === 'dock' ? surfaces.focusRow : undefined} middle={surfaces.middle} turn={turn} results={surface.kind === 'results' && !desktop ? surfaces.results?.card : undefined} />}
          </div>
        ) : null}
      </div>
      {desktop ? (
        <aside className="game-side" data-surface={surface.kind}>
          {surface.kind === 'sheet' ? <section className="side-sheet">{surfaces.sheet}</section> : surface.kind === 'results' ? surfaces.results?.panel : surfaces.statement?.panel}
        </aside>
      ) : null}
      {surfaces.dialog ?? null}
    </div>
  );
}
