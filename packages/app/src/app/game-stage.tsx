import { useLayoutEffect, useRef } from 'react';
import type { Entity } from 'koota';
import { Asleep, Identity, Name, Portrait } from '../world/index.js';
import { disposePortrait } from '../portraits/index.js';
import { paintCritter } from '../portraits/painter.js';
export function GameStage({ entity }: { entity: Entity }) {
  const host = useRef<HTMLDivElement>(null), identity = entity.get(Identity)!;
  useLayoutEffect(() => {
    const svg = paintCritter(document, identity.parameters, { name: entity.get(Name)!.display, size: 'stage', decorative: true, asleep: entity.has(Asleep) });
    host.current!.append(svg); entity.add(Portrait(svg));
    const observer = new IntersectionObserver(entries => { for (const entry of entries) (entry.target as HTMLElement).dataset.offscreen = String(!entry.isIntersecting); });
    observer.observe(host.current!);
    return () => { observer.disconnect(); if (entity.isAlive()) entity.remove(Portrait); disposePortrait(svg); svg.remove(); };
  }, [entity, identity.parameters]);
  return <div ref={host} className="stage" data-critter-id={identity.id} />;
}
