import { FEAST } from '@critter-crumbs/shared';
import type { SoundToken } from '../world/index.js';
import { SAMPLES, type SampleName } from './assets.js';
import { createSoundEngine } from './engine.js';
import { planSamples, soundTokens } from './plan.js';
import { GRAPH_OPENS_S } from './voices.js';
export interface AudioCheck { token: string; durationMs: number; peakDb: number; limitDb: number; pass: boolean }
const RATE = 48000;
/** Every render cues its first sound here, once the mix has opened. */
const T0 = GRAPH_OPENS_S + .05;
function measure(buffer: AudioBuffer) {
  let peak=0, first=-1, last=-1;
  for(let channel=0;channel<buffer.numberOfChannels;channel++) {
    const samples=buffer.getChannelData(channel);
    for(let i=0;i<samples.length;i++) { const sample=Math.abs(samples[i]!); peak=Math.max(peak,sample); if(sample > 1e-5) { if(first < 0 || i < first) first=i; last=Math.max(last,i); } }
  }
  return { durationMs:(last-first)/(RATE/1000), peakDb:20*Math.log10(peak), first };
}
type Engine = ReturnType<typeof createSoundEngine>;
/** Renders what `play` schedules, through the same engine and mix as the live host. */
async function render(seconds: number, channels: number, random: () => number, recorded: (name: SampleName) => AudioBuffer | undefined, play: (engine: Engine) => void) {
  const context=new OfflineAudioContext(channels,Math.ceil((T0+seconds)*RATE),RATE), engine=createSoundEngine(context,context.destination,random,recorded);
  play(engine); const measured=measure(await context.startRendering()); engine.dispose(context.currentTime); return measured;
}
const trigger = (token: SoundToken, pitchStep = 5, level = soundTokens[token].db) => ({ token, pitchStep, level, action:'trigger' as const, durationMs:0 });
/** A three-and-a-half second pour, as the world plays it: three crumbs, then grains that speed up and climb. */
function pour(engine: Engine, reverse: boolean, level: number) {
  const token=reverse ? 'pour.reverse' : 'pour.hold'; let maxVoices=0;
  for(let frame=0;frame<140;frame++) {
    const now=T0+frame*.025;
    if(frame===0 || frame===5 || frame===10) engine.cue({ token:reverse ? 'crumb.remove' : 'crumb.add', pitchStep:2, level, action:'trigger', durationMs:0 },now);
    if(frame>=10) engine.cue({ token, pitchStep:Math.min(10,Math.floor(frame/10)), level, action:frame===10 ? 'start' : 'update', durationMs:0, rate:8+32*Math.min(1,(frame-10)/60) },now);
    engine.pump(now); maxVoices=Math.max(maxVoices,engine.inspect().activeVoices);
  }
  engine.cue({ token, pitchStep:10, level, action:'stop', durationMs:60 },T0+3.5);
  engine.cue({ token:reverse ? 'crumb.remove' : 'crumb.add', pitchStep:10, level, action:'trigger', durationMs:0 },T0+3.5);
  return maxVoices;
}
/**
 * Actual browser DSP measurements using the same engine as the live host: every cue's synth version, every cue with
 * its recordings loaded, the pour over both beds, and a whole eight-critter feast. A cue never peaks above its level.
 */
export async function checkOfflineAudio(): Promise<AudioCheck[]> {
  const checks: AudioCheck[]=[], none = () => undefined, tokens = Object.keys(soundTokens) as SoundToken[];
  for(const token of tokens) {
    const definition=soundTokens[token]; if(!definition.ms) continue;
    const measured=await render(definition.ms/1000+.12,1,() => 1,none,engine => engine.cue(trigger(token),T0));
    checks.push({ token, ...measured, limitDb:definition.db, pass:measured.first >= 0 && measured.durationMs <= definition.ms+20 && measured.peakDb <= definition.db+.1 });
  }
  // An AudioBuffer belongs to no context, so each recording is decoded once here and played in every render below.
  const decoder=new OfflineAudioContext(2,1,RATE), recordings=new Map<SampleName, AudioBuffer>();
  await Promise.all((Object.keys(SAMPLES) as SampleName[]).map(async name => { try { recordings.set(name,await decoder.decodeAudioData(await (await fetch(SAMPLES[name].url)).arrayBuffer())); } catch { /* A recording that cannot load fails its cue's row below. */ } }));
  const recorded = (name: SampleName) => recordings.get(name);
  for(const token of tokens) {
    const names=planSamples(token).map(sample => sample.sample), definition=soundTokens[token]; if(!names.length) continue;
    const longest=Math.max(0,...planSamples(token).map(sample => sample.at+(recordings.get(sample.sample)?.duration ?? 0)));
    // The bell beside the feast's nibble moves with the critter's share, so that cue is measured on every step.
    let worst={ durationMs:0, peakDb:-Infinity, first:0 };
    for(const pitchStep of token === 'feast.feed' ? [1,2,3,4,5,6,7,8,9,10] : [5]) { const measured=await render(longest+.3,2,() => 1,recorded,engine => engine.cue(trigger(token,pitchStep),T0)); if(measured.peakDb > worst.peakDb || measured.first < 0) worst=measured; }
    checks.push({ token:`${token} · recorded`, ...worst, limitDb:definition.db, pass:names.every(name => recordings.has(name)) && worst.first >= 0 && worst.durationMs <= longest*1000+60 && worst.peakDb <= definition.db+.1 && worst.peakDb >= definition.db-3 });
  }
  for(const bed of [none,recorded]) for(const reverse of [false,true]) {
    const token=reverse ? 'pour.reverse' : 'pour.hold', level=soundTokens[token].db; let maxVoices=0, pouring=true;
    const measured=await render(4,1,() => .5,bed,engine => { maxVoices=pour(engine,reverse,level); pouring=engine.inspect().pouring; });
    checks.push({ token:bed === none ? token : `${token} · sparkle`, ...measured, limitDb:level, pass:measured.first>=0 && measured.durationMs>3300 && measured.durationMs<3650 && measured.peakDb<=level+.1 && maxVoices<=16 && !pouring && (bed === none || recordings.has('sparkle')) });
  }
  const quiet=await render(1,1,() => .5,none,engine => engine.cue(trigger('crumb.add',2,-20),T0));
  checks.push({ token:'crumb.add · quiet', ...quiet, limitDb:-20, pass:quiet.first>=0 && quiet.durationMs<180 && quiet.peakDb<=-19.9 });
  // The whole feast for eight critters with equal shares (Game Design §4.2): the cue, eight overlapping feeds and the settle, held under full scale by the limiter.
  const settle=(FEAST.waveStartMs+7*FEAST.waveStaggerMs+FEAST.feedMs+FEAST.settleDelayMs)/1000;
  const feast=await render(settle+3.4,2,() => .5,recorded,engine => { engine.cue(trigger('feast.open'),T0); for(let i=0;i<8;i++) engine.cue(trigger('feast.feed',2),T0+(FEAST.waveStartMs+i*FEAST.waveStaggerMs)/1000); engine.cue(trigger('feast.settle'),T0+settle); });
  checks.push({ token:'feast · eight critters', ...feast, limitDb:-1, pass:feast.first>=0 && feast.peakDb<=-1 });
  return checks;
}
