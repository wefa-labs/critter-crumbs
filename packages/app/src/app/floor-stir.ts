import { CIRCLE_FEEL, copy, stirPose } from '@critter-crumbs/shared';

/**
 * A critter standing on a painted floor stirs when it is touched, as your own critter stirs in the game
 * (world/circle.ts): its head tilts up and back and its body sways once either way (stirPose), and a sleeper lets out
 * three z's that rise and fade one after another. The floor's critters are drawings with no world behind them, so the
 * browser runs the same curves, sampled here, on its own animation clock; nothing is kept.
 */
const SAMPLES = 12, STIR = 'floor-stir';

/** The stir's two curves, added to whatever pose the drawing stands in. */
export function stirKeyframes() {
  const at = Array.from({ length: SAMPLES + 1 }, (_, index) => ({ offset: index / SAMPLES, pose: stirPose(index / SAMPLES * CIRCLE_FEEL.stirMs) }));
  return {
    head: at.map(({ offset, pose }) => ({ transform: `rotate(${pose.headTilt.toFixed(2)}deg)`, offset })),
    body: at.map(({ offset, pose }) => ({ transform: `rotate(${pose.lean.toFixed(2)}deg)`, offset })),
  };
}

/** One z, from where it is let out: drifting right and up as it fades (circle.sleepGlyphs). */
export const sleepGlyphKeyframes = [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: `${CIRCLE_FEEL.sleepDriftX}px ${-CIRCLE_FEEL.sleepDriftY}px` }];

/** Stirs one critter on the floor (a .floor-critter): a stir already under way gives way to the new one. */
export function stirCritter(critter: HTMLElement) {
  for (const animation of critter.getAnimations({ subtree: true })) if (animation.id === STIR) animation.cancel();
  critter.querySelector(':scope > .sleep-glyph')?.remove();
  const frames = stirKeyframes(), stir = { id: STIR, duration: CIRCLE_FEEL.stirMs, composite: 'add' } as const;
  for (const head of critter.querySelectorAll('.portrait__head')) head.animate(frames.head, stir);
  critter.querySelector('.portrait__figure')?.animate(frames.body, stir);
  if (critter.querySelector('.portrait')?.getAttribute('data-asleep') !== 'true') return;
  const document = critter.ownerDocument, glyphs = document.createElement('span');
  glyphs.className = 'sleep-glyph';
  glyphs.setAttribute('aria-hidden', 'true');
  const rises = [0, 1, 2].map(index => {
    const glyph = glyphs.appendChild(document.createElement('span'));
    glyph.textContent = copy['game.sleep.symbol'];
    return glyph.animate(sleepGlyphKeyframes, { id: STIR, duration: CIRCLE_FEEL.sleepLifeMs, delay: index * CIRCLE_FEEL.sleepReleaseMs });
  });
  critter.append(glyphs);
  void Promise.all(rises.map(rise => rise.finished)).then(() => glyphs.remove(), () => {});
}
