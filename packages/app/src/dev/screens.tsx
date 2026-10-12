import { AudioProvider } from '../audio/context.js';
import { createAudio } from '../audio/index.js';
import { useScenes } from '../game/scenes.js';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { WorldProvider, useTrait } from 'koota/react';
import { copy, devCopy, FEAST, type DevCopyId } from '@critter-crumbs/shared';
import { Feast, Pile, type GameSettings } from '../world/index.js';
import { createStageRuntime, type StageRuntime } from '../sim/stage-runtime.js';
import { GameFrame, GameScene } from '../game/parts.js';
import { ScatterMiddle } from '../game/dock.js';
import { FeastSheet, SignDialog, statementSurfaces } from '../game/sheets.js';
import { Toast } from '../game/surface.js';
import { stateControls, stateToast } from '../game/composition.js';
import { Reveal } from '../app/read.js';
import { ScatterControls } from '../app/scatter.js';
import { FeastResults, WaitingScene, feastHeapGlyphs } from '../app/results.js';
import PublicResults from '../app/public-results.js';
import { RecordReceipt, ResultRecord } from '../app/result-record.js';
import { absoluteDeadline, closingLine, scatteringDeadline } from '../app/time.js';
import type { AppApi, Me } from '../app/session.js';
import { gameStates, resultsViews, type GameScreenState, type MemberFeast } from '../app/feast-view.js';
import type { OpenedFeast } from '../app/feast-session.js';
import members from './game-members.js';
import { fixtureAllocation, fixtureFeast, fixtureOpened, fixturePublic, fixtureRecord, galleryQuery, galleryUrl, scatteringStates, screenStates, stillFrame, VIEWER } from './game-fixtures.js';
import { defaultScene } from '../game/art.js';

/**
 * Every core state from fixtures, through the same components the live screens render: the reveal, the waiting sheet
 * and the results are the live ones; the scattering moments and the feast's still frame are built from the same dock,
 * sheet, statement and dialog pieces over a fixture world. The allocation is the review pages' own (game-fixtures.ts).
 */
const settings: GameSettings = { effects: false, music: false, still: true, simple: true, reducedMotion: true };
const quiet = () => {};
const viewer = members[VIEWER]!;

export function FixtureScreen({ state, count, scene }: { state: GameScreenState; count: number; scene: string }) {
  const [feast] = useState(() => fixtureFeast(count, state)), [opened] = useState(() => fixtureOpened(feast, state));
  const frame = (children: ReactNode, when?: string) => <GameFrame feast={feast} viewer={{ address: viewer.address, variant: 0 }} onProfile={quiet} {...(when ? { when } : {})}>{children}</GameFrame>;
  const closes = scatteringDeadline(feast.scatteringEndsAt, feast.serverNow);
  if (state === 'public') return <GameFrame feast={feast} onConnect={quiet}><PublicResults feast={fixturePublic(feast, opened)} settings={settings} announce={quiet} /></GameFrame>;
  if (state === 'reveal') return frame(<Reveal feast={feast} viewer={viewer.address} settings={settings} announce={quiet} read={quiet} />, closes);
  if (state === 'waiting' || state === 'key') return frame(<WaitingScene feast={feast} settings={settings} announce={quiet} error={state === 'key' ? 'feast.keyNotYet' : null} retry={quiet} />);
  if (state === 'feast') return frame(<FeastStill feast={feast} opened={opened} scene={scene} />);
  if (scatteringStates.includes(state)) return frame(<ScatterFixture state={state} count={count} scene={scene} feast={feast} />, closes);
  const record = state === 'recording' ? <ResultRecord feast={feast} result={opened.result} api={{} as AppApi} me={{ address: viewer.address } as Me} account={() => null} run={async () => {}} busy={false} />
    : state === 'recorded' ? <RecordReceipt record={fixtureRecord(feast, opened)} feast={feast} /> : undefined;
  return frame(<FeastResults feast={feast} opened={opened} settings={settings} announce={quiet} viewer={viewer.address} initialPlaying={false} initialView={state === 'feasted' ? resultsViews.closed : state === 'givers' ? resultsViews.givers : resultsViews.results} {...(record ? { record } : {})} />);
}

/** The scattering moments over a fixture world: the reference allocation, Moss in focus, the dock's middle per state. */
function ScatterFixture({ state, count, scene, feast }: { state: GameScreenState; count: number; scene: string; feast: MemberFeast }) {
  const [runtime] = useState(() => {
    const game = createStageRuntime({ issued: 100, viewer: viewer.address, settings, critters: feast.targets.map(t => ({ id: t.id, address: t.ownerAddress!, ownerAddress: t.ownerAddress, name: t.name, variant: 0 })) });
    fixtureAllocation(state, count).forEach((amount, index) => { if (amount) game.actions.setCount(game.critters[index]!, amount); });
    game.tick(0);
    return game;
  });
  useEffect(() => { const stop = runtime.start(); return () => { stop(); queueMicrotask(() => runtime.destroy()); }; }, [runtime]);
  return <WorldProvider world={runtime.world}><ScatterMoment state={state} scene={scene} feast={feast} runtime={runtime} /></WorldProvider>;
}
function ScatterMoment({ state, scene, feast, runtime }: { state: GameScreenState; scene: string; feast: MemberFeast; runtime: StageRuntime }) {
  const [mode, setMode] = useState(state), [focus, setFocus] = useState(0), [reading, setReading] = useState(state === 'reading'), heap = useRef<HTMLDivElement>(null);
  const pile = useTrait(runtime.heap, Pile)!;
  /* giving and taking back in the gallery moves between scattering and all given, as it does live */
  const moment: GameScreenState = mode === 'scatter' || mode === 'done' || mode === 'reading' ? pile.remaining ? gameStates.scatter : gameStates.done : mode;
  const view = reading ? gameStates.reading : moment, message = stateToast(view), target = feast.targets[focus]!;
  const middle = <ScatterMiddle state={view} remaining={pile.remaining} closes={closingLine(feast.scatteringEndsAt, feast.serverNow)} until={absoluteDeadline(feast.scatteringEndsAt)} onGo={() => setMode(gameStates.signing)} />;
  return (
    <>
      <section className="game-flow">
        <GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={view} sceneId={scene} reading={reading} editable={view !== 'closed' && view !== 'saving' && view !== 'signing'} onRead={() => setReading(true)} onClose={() => setReading(false)} announce={quiet} heapHost={heap}
          surfaces={{
            focusRow: <ScatterControls key={target.id} entity={runtime.critters[focus]!} runtime={runtime} target={target} announce={quiet} busy={view === 'saving' || view === 'signing' || view === 'closed'} closed={stateControls(view) === 'disabled'} />,
            middle,
            statement: statementSurfaces({ feast, runtime, focus, close: () => setReading(false) }),
            toast: message ? <Toast>{copy[message]}</Toast> : null,
            dialog: view === 'signing' ? <SignDialog busy={false} cancel={() => setMode(gameStates.done)} confirm={() => setMode(gameStates.scattered)} /> : null,
          }} />
      </section>
    </>
  );
}

/** Flow 44 as a still: the feast part-way through its wave, six critters woken beside what they received. */
function FeastStill({ feast, opened, scene }: { feast: MemberFeast; opened: OpenedFeast; scene: string }) {
  const [runtime] = useState(() => {
    const game = createStageRuntime({ issued: 100, viewer: viewer.address, asleep: true, settings: { ...settings, still: false, reducedMotion: false }, critters: feast.targets.map(t => ({ id: t.id, address: t.ownerAddress!, ownerAddress: t.ownerAddress, name: t.name, variant: 0 })) });
    game.actions.beginFeast(opened.result); game.tick(0);
    game.world.query(Feast)[0]!.set(Feast, { startedAt: -(FEAST.waveStartMs + FEAST.waveStaggerMs * 5 + 300) }); game.tick(0); game.ticker.setMode(stillFrame);
    return game;
  });
  useEffect(() => () => queueMicrotask(() => runtime.destroy()), [runtime]);
  const shown = runtime.feastPresentation();
  return (
    <WorldProvider world={runtime.world}>
      <section className="game-flow feast-results">
        <GameScene runtime={runtime} feast={feast} focus={0} turnTo={quiet} state={gameStates.feast} sceneId={scene} editable={false} announce={quiet}
          counts={shown?.counts ?? []} remaining={feastHeapGlyphs(shown?.heapFraction ?? 0)} issued={FEAST.glyphs}
          surfaces={{ sheet: <FeastSheet skip={quiet} /> }} />
      </section>
    </WorldProvider>
  );
}

export function ScreenGallery() {
  const [audio] = useState(() => createAudio(settings)); useEffect(() => () => audio.destroy(), [audio]);
  return <AudioProvider value={audio}><GalleryBody /></AudioProvider>;
}
function GalleryBody() {
  const scenes = useScenes();
  const query = new URLSearchParams(location.search), raw = query.get(galleryQuery.state);
  const [state, setState] = useState<GameScreenState>(screenStates.includes(raw as GameScreenState) ? raw as GameScreenState : gameStates.scatter), [count, setCount] = useState(Number(query.get(galleryQuery.count) ?? 8)), [scene, setScene] = useState(query.get(galleryQuery.scene) ?? defaultScene), capture = query.has(galleryQuery.capture);
  if (capture) return <div className="gallery-frame"><FixtureScreen key={state + count + scene} state={state} count={count} scene={scene} /></div>;
  const source = galleryUrl(state, count, scene);
  return (
    <>
      <div className="gallery-toolbar">
        <h1>{devCopy['preview.game.title']}</h1>
        <label>{devCopy['preview.game.state']}<select value={state} onChange={event => setState(event.target.value as GameScreenState)}>{screenStates.map(value => <option key={value} value={value}>{devCopy[`preview.game.${value}`]}</option>)}</select></label>
        <label>{devCopy['preview.game.size']}<select value={count} onChange={event => setCount(Number(event.target.value))}>{[4, 6, 8, 10].map(n => <option key={n}>{n}</option>)}</select></label>
        <label>{devCopy['preview.game.scene']}<select value={scene} onChange={event => setScene(event.target.value)}>{scenes.map(entry => <option key={entry.id} value={entry.id}>{devCopy[`preview.game.${entry.id}` as DevCopyId] ?? entry.id}</option>)}</select></label>
      </div>
      <div className="gallery-frame"><div className="gallery-previews"><iframe className="gallery-phone" title={devCopy['preview.game.phone']} src={source} /><div className="gallery-desktop"><iframe title={devCopy['preview.game.desktop']} src={source} /></div></div></div>
    </>
  );
}
