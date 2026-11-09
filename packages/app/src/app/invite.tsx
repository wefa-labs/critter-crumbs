import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { circleBackRow, DESKTOP_MIN_WIDTH, HEADER_HEIGHT } from '../game/layout.js';
import { GameFrame } from '../game/parts.js';
import { SceneBackdrop } from '../game/scenes.js';
import { Grow } from '../game/sheet-parts.js';
import { deadlineLine } from './deadlines.js';
import { portraitVariant, type PublicFeast } from './feast-view.js';
import { ScreenNotices } from './notices.js';
import { PaintedFloor } from './painted-floor.js';
import { INVITE_SCENE, sheetScreenStyle } from './painted-scene.js';
import { FloorRing } from './place-screen.js';
import { absoluteDeadline } from './time.js';
import { Link } from './ui.js';

function InviteDeadline({ phase, at, now }: { phase: 'gathering' | 'scattering'; at: number; now: number }) {
  return <div><b>{deadlineLine(phase, at, now)}</b><time dateTime={new Date(at).toISOString()}>{absoluteDeadline(at)}</time></div>;
}

interface Room { scene: { width: number; height: number }; viewport: { width: number; height: number }; desktop: boolean }
/**
 * The room the game will stand this feast's circle in on this screen: its scene, the floor's width by the height under
 * the header, and the window around it.
 */
function useRoom(screen: RefObject<HTMLDivElement | null>, floor: RefObject<HTMLDivElement | null>) {
  const [room, setRoom] = useState<Room | null>(null);
  /* measured before the first paint, so the plate is drawn where it belongs from the start */
  useLayoutEffect(() => {
    const box = screen.current!, ground = floor.current!;
    const measure = () => {
      const scene = { width: ground.clientWidth, height: box.clientHeight }, viewport = { width: box.clientWidth, height: box.clientHeight + HEADER_HEIGHT };
      setRoom(current => current?.scene.width === scene.width && current.scene.height === scene.height && current.viewport.width === viewport.width ? current : { scene, viewport, desktop: viewport.width >= DESKTOP_MIN_WIDTH });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box); observer.observe(ground);
    return () => observer.disconnect();
  }, []);
  return room;
}

/**
 * A feast opened from a link by someone who has not connected (flow page, SCREENS.invite; PRD F1): the burrow, the
 * feast, both deadlines and the critters asleep before anything else, then one way in, and under it the way to the
 * first steps, which return here (learn-return.ts). `sound` is the Music toggle.
 *
 * The ring stands on the plate the game stands its circle on, raised as the game raises it (game/plate.ts), so the
 * sleepers stand on the floor rather than on the table and the steps (the November UI audit, screen 2), and the room
 * is the one the feast opens in. The plate is the game's scene in size and the sheet covers its foot.
 */
export function Invite({ feast, now, connect, sound }: { feast: PublicFeast; now: number; connect: () => void; sound: ReactNode }) {
  const screen = useRef<HTMLDivElement>(null), floor = useRef<HTMLDivElement>(null), room = useRoom(screen, floor);
  const plate = (
    <div className="invite-plate" style={room ? { height: room.scene.height } : undefined}>
      {room ? <SceneBackdrop id={INVITE_SCENE.painting} desktop={room.desktop} size={room.scene} backRow={circleBackRow(room.viewport, feast.targets.length)} /> : null}
    </div>
  );
  return (
    <GameFrame feast={feast} burrowLine={formatCopy('arrive.burrow', { burrowName: feast.burrowName, n: feast.targets.length })} aside={sound}>
      <div ref={screen} className="sheet-screen" style={sheetScreenStyle(INVITE_SCENE.sheetHeight)}>
        <PaintedFloor painting={INVITE_SCENE.painting} backdrop={plate} className="screen-floor" ref={floor}>
          <FloorRing critters={feast.targets.map(target => ({ key: target.id, address: target.ownerAddress ?? target.id, variant: portraitVariant(feast, target), asleep: true }))} />
          <p className="floor-caption">{copy['arrive.asleep']}</p>
        </PaintedFloor>
        <section className="screen-sheet">
          <ScreenNotices />
          {feast.context ? <p className="invite-context">{feast.context}</p> : null}
          <div className="invite-deadlines"><InviteDeadline phase="gathering" at={feast.gatheringEndsAt} now={now} /><InviteDeadline phase="scattering" at={feast.scatteringEndsAt} now={now} /></div>
          <p>{copy['arrive.explainer']}</p>
          <Grow />
          <button type="button" className="pill wide" onClick={connect}>{copy['arrive.cta']}</button>
          <Link className="quiet" href="/how-it-works">{copy['launch.learn']}</Link>
        </section>
      </div>
    </GameFrame>
  );
}
