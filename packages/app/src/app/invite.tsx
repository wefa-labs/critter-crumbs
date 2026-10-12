import type { ReactNode } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { GameFrame } from '../game/parts.js';
import { Grow } from '../game/sheet-parts.js';
import { deadlineLine } from './deadlines.js';
import { portraitVariant, type PublicFeast } from './feast-view.js';
import { sceneCircle } from './invite-circle.js';
import { FloorCritter, PaintedFloor } from './painted-floor.js';
import { INVITE_SCENE, sheetScreenStyle } from './painted-scene.js';
import { absoluteDeadline } from './time.js';

function InviteDeadline({ phase, at, now }: { phase: 'gathering' | 'scattering'; at: number; now: number }) {
  return <div><b>{deadlineLine(phase, at, now)}</b><time dateTime={new Date(at).toISOString()}>{absoluteDeadline(at)}</time></div>;
}

/**
 * A feast opened from a link by someone who has not connected (flow page, SCREENS.invite; PRD F1): the burrow, the
 * feast, both deadlines and the critters asleep before anything else, then one way in. `sound` is the Music toggle.
 */
export function Invite({ feast, now, connect, sound }: { feast: PublicFeast; now: number; connect: () => void; sound: ReactNode }) {
  return (
    <GameFrame feast={feast} burrowLine={formatCopy('arrive.burrow', { burrowName: feast.burrowName, n: feast.targets.length })} aside={sound}>
      <div className="sheet-screen" style={sheetScreenStyle(INVITE_SCENE.sheetHeight)}>
        <PaintedFloor painting={INVITE_SCENE.painting} className="screen-floor">
          {sceneCircle(feast.targets.length).map(spot => {
            const target = feast.targets[spot.index]!;
            return <FloorCritter key={target.id} critter={{ ...spot, address: target.ownerAddress ?? target.id, variant: portraitVariant(feast, target), asleep: true }} />;
          })}
          <p className="floor-caption">{copy['arrive.asleep']}</p>
        </PaintedFloor>
        <section className="screen-sheet">
          {feast.context ? <p className="invite-context">{feast.context}</p> : null}
          <div className="invite-deadlines"><InviteDeadline phase="gathering" at={feast.gatheringEndsAt} now={now} /><InviteDeadline phase="scattering" at={feast.scatteringEndsAt} now={now} /></div>
          <p>{copy['arrive.explainer']}</p>
          <Grow />
          <button type="button" className="pill wide" onClick={connect}>{copy['arrive.cta']}</button>
        </section>
      </div>
    </GameFrame>
  );
}
