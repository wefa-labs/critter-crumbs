import type { SoundToken } from '../world/index.js';
import { SAMPLES, type SampleName } from './assets.js';
export type Voice = 'tick' | 'thump' | 'breath' | 'drone' | 'bell';
export interface Note { voice: Voice; at: number; duration: number; gain: number; frequency: number; cents: number }
/**
 * Game Design §5.2: each cue's peak level, and how long its synth version lasts. A cue with a chosen recording
 * (docs/explorations/sound-direction-2026-10.md) plays the file once it has loaded and the synth version until then.
 * The page flip and the nibble are mostly short clicks, so they need a high peak to be heard at all
 * (docs/research/audio-assets.md gives each recording's loudness at its level).
 */
export const soundTokens: Record<SoundToken, { ms: number; db: number }> = {
  connect: { ms:240, db:-14 }, reroll: { ms:200, db:-14 }, 'ui.tap': { ms:60, db:-20 },
  'crumb.add': { ms:160, db:-14 }, 'crumb.remove': { ms:150, db:-16 }, 'pour.hold': { ms:0, db:-14 }, 'pour.reverse': { ms:0, db:-16 },
  'pile.wall': { ms:160, db:-16 }, 'pile.empty': { ms:360, db:-12 }, 'statement.open': { ms:160, db:-10 }, 'scatter.confirm': { ms:360, db:-10 },
  'statements.reveal': { ms:400, db:-10 }, 'scatter.closed': { ms:600, db:-14 }, 'feast.open': { ms:1200, db:-8 }, 'feast.feed': { ms:500, db:-8 }, 'feast.settle': { ms:1600, db:-8 }, error: { ms:200, db:-16 },
};
export const pentatonicFrequency = (step: number) => 261.625565 * 2 ** ([0,2,4,7,9,12,14,16,19,21,24][Math.max(0, Math.min(10, Math.floor(step)))]! / 12);
const C5 = 523.251131, E5 = 659.255114, F5 = 698.456463, G5 = 783.990872, C6 = 1046.502261;
export function variation(voice: Voice, random: () => number) { const range = voice === 'bell' ? 10 : voice === 'tick' || voice === 'thump' ? 25 : 0; return { cents: (random() * 2 - 1) * range, gain: .92 + random() * .16, delay: (random() * 2 - 1) * .01 }; }
/** The synth version of a cue: bright bells for the crumbs and the chimes, the old soft voices where a recording usually plays. */
export function planToken(token: SoundToken, { pitchStep = 0, level, durationMs, random = Math.random }: { pitchStep?: number; level?: number; durationMs?: number; random?: () => number } = {}): Note[] {
  const definition = soundTokens[token], duration = (durationMs || definition.ms || 200) / 1000, frequency = pentatonicFrequency(pitchStep);
  const notes: Note[] = [];
  const add = (voice: Voice, at: number, weight: number, pitch = frequency, length = duration - at) => { const v = variation(voice, random); notes.push({ voice, at: Math.max(0, at + v.delay), duration: Math.max(.005, length), gain: weight * v.gain / 1.08, frequency: pitch, cents: v.cents }); };
  switch (token) {
    case 'connect': add('bell',0,.45,G5,.14); add('bell',.08,.55,C6,.15); break;
    case 'reroll': add('bell',0,.45,C5,.1); add('bell',.05,.55,F5,.14); break;
    case 'ui.tap': add('tick',0,1,C5,.05); break;
    /* a bright bip on the critter's pentatonic step, with a tiny pop on top; minus is the softer bell */
    case 'crumb.add': add('bell',0,.85,frequency,.15); add('tick',0,.15,frequency*2,.03); break;
    case 'crumb.remove': add('bell',0,.6,frequency,.13); break;
    /* a lone thump stays under full weight: the voices' compressor lifts a steady tone by about a decibel */
    case 'pile.wall': case 'error': add('thump',0,.85,token === 'error' ? 200 : 150,token === 'error' ? .18 : .14); break;
    case 'pile.empty': add('bell',0,.3,C5,.2); add('bell',.07,.3,E5,.2); add('bell',.14,.4,G5,.2); break;
    case 'statement.open': add('breath',0,.25,frequency,.12); add('bell',.04,.15,C6,.1); break;
    case 'scatter.confirm': add('bell',0,.3,C5,.22); add('bell',.06,.3,G5,.22); add('bell',.12,.4,C6,.22); break;
    case 'statements.reveal': add('bell',0,.2,C5,.24); add('bell',.05,.2,E5,.24); add('bell',.1,.25,G5,.24); add('bell',.15,.35,C6,.24); break;
    case 'scatter.closed': add('bell',0,.4,G5,.28); add('bell',.15,.3,E5,.28); add('bell',.3,.3,C5,.28); break;
    case 'feast.open': add('breath',0,.6); add('drone',0,.4,65); break;
    /* the bell that rings a critter's share, a moment after its nibble begins and under it */
    case 'feast.feed': add('bell',.25,.6,frequency,.2); break;
    case 'feast.settle': for (const [index,pitch] of [C5,E5,G5].entries()) add('bell',index*.04,.25,pitch,.5); add('thump',0,.25,65,.15); break;
    /* a typed amount (Game Design §2.6): a short run of bells stepping to where the count lands, up for giving and down for taking back */
    case 'pour.hold': case 'pour.reverse': {
      const bells = Math.max(1, Math.min(4, Math.round(duration / .08))), direction = token === 'pour.hold' ? 1 : -1;
      for (let i = 0; i < bells; i++) add('bell',i*.08,.85,pentatonicFrequency(pitchStep - direction * (bells - 1 - i)),.12);
      break;
    }
  }
  const gain = 10 ** ((level ?? definition.db) / 20); return notes.map(note => ({ ...note, gain: note.gain * gain }));
}
export interface SampleTrigger { sample: SampleName; at: number; gain: number }
/**
 * The chosen recordings: which files each cue plays and when, whether the first of them replaces the synth version or
 * plays beside it, and which recording still sounding it fades out.
 */
const RECORDED: Partial<Record<SoundToken, { replaces: boolean; cuts?: SampleName[]; samples: { sample: SampleName; at?: number; dbOffset?: number }[] }>> = {
  reroll: { replaces: true, samples: [{ sample: 'spin' }] },
  'ui.tap': { replaces: true, samples: [{ sample: 'pop' }] },
  'pile.wall': { replaces: true, samples: [{ sample: 'boing' }] },
  'statement.open': { replaces: true, samples: [{ sample: 'page' }] },
  'scatter.confirm': { replaces: true, samples: [{ sample: 'scattered' }] },
  'statements.reveal': { replaces: true, samples: [{ sample: 'reveal' }] },
  'scatter.closed': { replaces: true, samples: [{ sample: 'dusk' }] },
  'feast.open': { replaces: true, samples: [{ sample: 'feast' }] },
  /* the critter nibbles, then the bell rings its share */
  'feast.feed': { replaces: false, samples: [{ sample: 'munch' }] },
  /* the settle comes when the last critter is fed, so the fanfare lands there and the feast cue fades under it; the critters cheer a moment later, a little under the fanfare */
  'feast.settle': { replaces: true, cuts: ['feast'], samples: [{ sample: 'feast-resolve' }, { sample: 'cheer', at: .35, dbOffset: -6 }] },
};
export const replacesSynth = (token: SoundToken) => RECORDED[token]?.replaces ?? false;
export const cutsOf = (token: SoundToken): readonly SampleName[] => RECORDED[token]?.cuts ?? [];
export function planSamples(token: SoundToken, { level }: { level?: number } = {}): SampleTrigger[] {
  const cueLevel = level ?? soundTokens[token].db;
  return (RECORDED[token]?.samples ?? []).map(({ sample, at = 0, dbOffset = 0 }) => ({ sample, at, gain: 10 ** ((cueLevel + dbOffset - SAMPLES[sample].peakDb) / 20) }));
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
