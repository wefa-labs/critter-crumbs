import type { SoundToken } from '../world/index.js';
export type Voice = 'tick' | 'pluck' | 'thump' | 'breath' | 'drone';
export interface Note { voice: Voice; at: number; duration: number; gain: number; frequency: number; cents: number }
export const soundTokens: Record<SoundToken, { ms: number; db: number }> = {
  connect: { ms:180, db:-16 }, reroll: { ms:160, db:-16 }, 'ui.tap': { ms:40, db:-22 },
  'crumb.add': { ms:90, db:-14 }, 'crumb.remove': { ms:90, db:-16 }, 'pour.hold': { ms:0, db:-14 }, 'pour.reverse': { ms:0, db:-16 },
  'pile.wall': { ms:120, db:-16 }, 'pile.empty': { ms:200, db:-14 }, 'statement.open': { ms:120, db:-20 }, 'scatter.confirm': { ms:200, db:-12 },
  'statements.reveal': { ms:200, db:-12 }, 'feast.open': { ms:1200, db:-10 }, 'feast.feed': { ms:500, db:-10 }, 'feast.settle': { ms:1600, db:-8 }, error: { ms:150, db:-16 },
};
export const pentatonicFrequency = (step: number) => 261.625565 * 2 ** ([0,2,4,7,9,12,14,16,19,21,24][Math.max(0, Math.min(10, Math.floor(step)))]! / 12);
export function variation(voice: Voice, random: () => number) { const range = voice === 'pluck' ? 10 : voice === 'tick' || voice === 'thump' ? 25 : 0; return { cents: (random() * 2 - 1) * range, gain: .92 + random() * .16, delay: (random() * 2 - 1) * .01 }; }
export function planToken(token: SoundToken, { pitchStep = 0, level, durationMs, random = Math.random }: { pitchStep?: number; level?: number; durationMs?: number; random?: () => number } = {}): Note[] {
  const definition = soundTokens[token], duration = (durationMs || definition.ms || 200) / 1000, frequency = pentatonicFrequency(pitchStep);
  const notes: Note[] = [];
  const add = (voice: Voice, at: number, weight: number, pitch = frequency, length = duration - at) => { const v = variation(voice, random); notes.push({ voice, at: Math.max(0, at + v.delay), duration: Math.max(.005, length), gain: weight * v.gain / 1.08, frequency: pitch, cents: v.cents }); };
  switch (token) {
    case 'connect': add('thump',0,.55,293.66,.09); add('breath',.06,.45); break;
    case 'reroll': add('pluck',0,.5,261.625565,.12); add('pluck',.04,.5,349.228231); break;
    case 'ui.tap': case 'pile.wall': case 'error': add('thump',0,1,90); break;
    case 'crumb.add': case 'crumb.remove': add('tick',0,.8); add('pluck',.015,.2,frequency * (token === 'crumb.remove' ? 2 ** (-1/12) : 1)); break;
    case 'pile.empty': add('pluck',0,.35,329.627557,.16); add('pluck',.04,.4,261.625565); add('breath',.05,.25); break;
    case 'scatter.confirm': add('pluck',0,.4,261.625565); add('pluck',.04,.4,391.995436); add('thump',.02,.2,90); break;
    case 'statement.open': add('breath',0,1); break;
    case 'statements.reveal': add('breath',0,.4); for (const pitch of [261.625565,329.627557,391.995436]) add('pluck',.04,.2,pitch); break;
    case 'feast.open': add('breath',0,.6); add('drone',0,.4,65); break;
    case 'feast.feed': add('breath',0,.45,frequency,.4); for(let i=0;i<4;i++) add('tick',i*.07,.08,frequency,.09); add('pluck',.3,.23,frequency/2); break;
    case 'feast.settle': for (const [index,pitch] of [261.625565,329.627557,391.995436].entries()) add('pluck',index*.04,.25,pitch); add('thump',0,.25,65,.15); break;
    case 'pour.hold': case 'pour.reverse': add('breath',0,.65); add('tick',0,.35,frequency,.09); break;
  }
  const gain = 10 ** ((level ?? definition.db) / 20); return notes.map(note => ({ ...note, gain: note.gain * gain }));
}
/** Audio-clock scheduler; one timer can run independently of rendering. */
export function createPourSchedule() {
  let next: number | null = null, rate = 8;
  return {
    start(at: number, grainsPerSecond: number) { next = at; rate = Math.max(1, Math.min(200, grainsPerSecond)); },
    rate(value: number) { rate = Math.max(1, Math.min(200, value)); },
    grains(until: number) { const result: number[] = []; if (next === null) return result; while (next <= until && result.length < 16) { result.push(next); next += 1/rate; } return result; },
    stop() { next = null; },
  };
}
