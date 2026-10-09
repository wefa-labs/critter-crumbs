/** Pure timing for looping music (Game Design G8): when the next pass starts, how long passes overlap, and the fade curves. */
export const MUSIC_CROSSFADE_S = 2;
/**
 * The music's place in the mix and how it comes and goes (Game Design §5.4, §5.5). The loops are files at -16 LUFS, so
 * `db` puts them near -31 LUFS: about 8 dB under the stings and the feast cue.
 */
export const MUSIC_MIX = { db: -15, duckDb: -6, duckS: .15, fadeInS: 1.5, fadeOutS: 1, resumeS: 1, stingTailS: 1 } as const;
/** A long loop overlaps its passes by two seconds; a short one by a quarter of its length. */
export const crossfadeFor = (duration: number, preferred = MUSIC_CROSSFADE_S) => Math.min(preferred, duration / 4);
/** The next pass starts one crossfade before the current pass ends. */
export const nextStart = (start: number, duration: number, crossfade: number) => start + duration - crossfade;
/** Sine and cosine quarter-waves: a rising and a falling curve whose powers always sum to one. */
export function equalPower(points: number, rising: boolean): Float32Array {
  const curve = new Float32Array(points);
  for (let i = 0; i < points; i++) { const angle = (i / (points - 1)) * Math.PI / 2; curve[i] = rising ? Math.sin(angle) : Math.cos(angle); }
  curve[0] = rising ? 0 : 1; curve[points - 1] = rising ? 1 : 0;
  return curve;
}
