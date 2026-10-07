import { useEffect, useState } from 'react';
import { WorldProvider } from 'koota/react';
import { formatCopy, STATEMENTS_FOCUS_MS, WAKE } from '@critter-crumbs/shared';
import { StatementReveal, type GameSettings } from '../world/index.js';
import { useAudio } from '../audio/context.js';
import { createStageRuntime } from '../sim/stage-runtime.js';
import { GameScene } from '../game/parts.js';
import { RevealSheet } from '../game/sheets.js';
import { navigate, targetLabel } from './ui.js';
import { gameStates, portraitVariant, readPath, type MemberFeast } from './feast-view.js';

/**
 * Statements are open (flow page, screen 34): the circle wakes delighted, every critter but yours with a thought bubble,
 * over a sheet that starts the reading. A bubble opens that critter's statement; Start reading opens the first.
 */
export function Reveal({ feast, settings, announce, viewer, read = at => navigate(readPath(feast.id, at)) }: { feast: MemberFeast; settings: GameSettings; announce: (text: string) => void; viewer: string; read?: (at?: number) => void }) {
  const audio = useAudio(), [focus, setFocus] = useState(0), [ready, setReady] = useState(false);
  const [runtime] = useState(() => createStageRuntime({ viewer, asleep: true, issued: feast.crumbsPerCritter, settings, outputs: { sound: audio.cue }, critters: feast.targets.map(target => ({ id: target.id, address: target.ownerAddress ?? target.id, ownerAddress: target.ownerAddress, name: targetLabel(target), variant: portraitVariant(feast, target) })) }));
  useEffect(() => {
    runtime.actions.beginReveal(); const stop = runtime.start(); let settled = false;
    const unwatch = runtime.onFrame(() => { if (runtime.world.get(StatementReveal)?.ready && !settled) { settled = true; setReady(true); announce(formatCopy('reveal.announce', { n: feast.targets.length })); } });
    runtime.animateFor(STATEMENTS_FOCUS_MS + WAKE.ms);
    return () => { unwatch(); stop(); audio.stop(); queueMicrotask(() => runtime.destroy()); };
  }, [runtime]);
  useEffect(() => runtime.setSettings(settings), [runtime, settings]);
  return (
    <WorldProvider world={runtime.world}>
      <section className="game-flow">
        <GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={gameStates.reveal} editable={false} onRead={read} announce={announce}
          surfaces={{ sheet: <RevealSheet crumbs={feast.crumbsPerCritter} ready={ready} start={() => read()} /> }} />
      </section>
    </WorldProvider>
  );
}
