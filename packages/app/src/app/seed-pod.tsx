import { ROUND } from '../game/styles.js';

/**
 * A closed seed pod: where a scatter rests until the feast (design pass, Appendix A: "gentle hiding, not locks"). It
 * stands at each critter's feet on the private step's floor (learn.tsx), and heads the page behind "Why nobody can
 * peek" (why.tsx) as its one picture. `width` is its width in pixels; without one it fills the box it stands in.
 */
export function SeedPodDrawing({ width }: { width?: number }) {
  return (
    <svg viewBox="-14 -22 28 30" width={width} aria-hidden="true">
      <ellipse cx="0" cy="4" rx="11" ry="2.6" fill="var(--cc-ink)" opacity=".16" />
      <path d="M0-14 C9-12 11-2 8 3 C5 6 -5 6 -8 3 C-11-2 -9-12 0-14Z" fill="var(--cc-pod)" stroke="var(--cc-ink)" strokeWidth="1.4" />
      <path d="M0-13 C1-6 1 0 0 5" fill="none" stroke="var(--cc-ink)" strokeWidth="1.1" opacity=".7" />
      <path d="M0-14 C-1-17 1-19 4-20" fill="none" stroke="var(--cc-pod-stem)" strokeWidth="1.8" strokeLinecap={ROUND} />
      <ellipse cx="6" cy="-19" rx="3.6" ry="1.8" transform="rotate(-25 6 -19)" fill="var(--cc-pod-leaf)" stroke="var(--cc-ink)" strokeWidth=".9" />
    </svg>
  );
}
