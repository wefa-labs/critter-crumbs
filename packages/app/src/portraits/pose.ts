import type { World } from 'koota';
import { REDUCED_MOTION, RIG } from '@critter-crumbs/shared';
import { Asleep, Clock, Portrait, Rig, Settings } from '../world/traits.js';
import { portraitState, UNIT } from './index.js';

/**
 * DOM layout stays in CSS; the simulation writes only its current pose. This is kept apart from the drawing itself
 * (portraits/index.ts) because the app's shell draws critters and never poses them: in one module, the world's traits
 * and all of Koota loaded with the first screen (docs/decisions.md, 2026-10-12).
 */
export function renderPortraits(world: World) {
  for (const entity of world.query(Portrait, Rig)) {
    const svg = entity.get(Portrait); if (!svg) continue;
    if (svg.parentElement?.dataset.offscreen === 'true') continue;
    const rig = entity.get(Rig)!, current = portraitState(svg);
    const asleep = entity.has(Asleep), settings = world.get(Settings)!;
    const quiet = settings.still || settings.reducedMotion, meshed = svg.parentElement?.dataset.mesh === 'ready';
    if (meshed && !quiet) continue;
    const changed = current?.asleep !== undefined && (current.asleep !== asleep || current.scale !== rig.scaleX);
    let outgoing: SVGSVGElement | undefined;
    if (quiet && changed && current && svg.parentElement?.classList.contains('stage')) {
      current.cleanup?.(); outgoing = svg.cloneNode(true) as SVGSVGElement;
      outgoing.setAttribute('aria-hidden', 'true'); outgoing.removeAttribute('role'); outgoing.classList.add('portrait-fade');
      svg.after(outgoing);
    }
    if (current?.applyRig) current.applyRig({ rig, now: world.get(Clock)!.now, asleep, quiet });
    else for (const [key, value] of Object.entries(rig)) {
      const property = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      const unit = ['leanZ', 'headTilt', 'earL', 'earR', 'postureX'].includes(key) ? 'deg' : key === 'liftY' || key === 'pupilX' || key === 'pupilY' ? 'px' : '';
      svg.style.setProperty(`--${property}`, `${unit === 'px' ? value * (key.startsWith('pupil') ? current?.eyeRadius ?? 0 : UNIT) : value}${unit}`);
    }
    if (svg.dataset.asleep !== String(asleep)) svg.dataset.asleep = String(asleep);
    const mouth = svg.querySelector('.portrait__mouth');
    if (mouth && current && !current.applyRig) {
      const radius = current.headRadius;
      mouth.setAttribute('d', `M${-radius * .2} ${radius * .4} Q0 ${radius * (.4 + .25 * rig.mouth)} ${radius * .22} ${radius * .4}`);
      mouth.setAttribute('opacity', rig.mouth > 0 ? String(RIG.mouthOpacity) : '0');
    }
    if (current) {
      if (outgoing) {
        const duration = current.scale !== rig.scaleX ? REDUCED_MOTION.growthCrossfadeMs : REDUCED_MOTION.wakeCrossfadeMs;
        const incoming = meshed ? undefined : svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
        const leaving = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration });
        const old = outgoing;
        current.cleanup = () => { incoming?.cancel(); leaving.cancel(); old.remove(); };
        void leaving.finished.then(() => { old.remove(); delete current.cleanup; }).catch(() => {});
      }
      current.asleep = asleep; current.scale = rig.scaleX;
    }
  }
}
