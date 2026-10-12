import { useEffect, type ReactNode } from 'react';
import { copy } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import { FloorCritter, FloorHeap, PaintedFloor } from './painted-floor.js';
import { LAUNCHER_SCENE } from './painted-scene.js';
import { Link } from './ui.js';

/**
 * The app as a title screen, before connecting (flow page, SCREENS.launch): the painted burrow under the wordmark, a
 * few critters dozing around a heap of crumbs, and two actions. Trouble is said in the sheet, above Connect
 * (SCREENS['connect-rejected']); `sound` is the Music toggle, which has no Settings to live in here.
 */
export function Launcher({ connect, busy, notice, sound }: { connect: () => void; busy: boolean; notice: string; sound: ReactNode }) {
  useEffect(() => { document.title = copy['app.name']; document.getElementById('content')?.focus(); }, []);
  return (
    <div className="core-game launcher">
      <PaintedFloor painting={LAUNCHER_SCENE.painting} className="launch-scene">
        {LAUNCHER_SCENE.critters.map(critter => <FloorCritter key={critter.address} critter={critter} beside={critter} />)}
        <FloorHeap heap={LAUNCHER_SCENE.heap} beside={LAUNCHER_SCENE.heap} />
        <div className="launch-plate"><h1 className="wordmark">{copy['app.name']}</h1><p>{copy['app.tagline']}</p></div>
      </PaintedFloor>
      <div className="launch-sound">{sound}</div>
      <section className="launch-sheet">
        {notice ? <SheetNotice trouble>{notice}</SheetNotice> : null}
        <button type="button" className="pill wide" disabled={busy} onClick={connect}>{copy['action.connect']}</button>
        <Link className="quiet" href="/how-it-works">{copy['launch.learn']}</Link>
      </section>
    </div>
  );
}
