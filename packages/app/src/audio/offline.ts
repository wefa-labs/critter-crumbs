import type { SoundToken } from '../world/index.js';
import { createSoundEngine } from './engine.js';
import { soundTokens } from './plan.js';
export interface AudioCheck { token: string; durationMs: number; peakDb: number; limitDb: number; pass: boolean }
function measure(samples: Float32Array) {
  let peak=0, first=-1, last=-1;
  for(let i=0;i<samples.length;i++) { const sample=Math.abs(samples[i]!); peak=Math.max(peak,sample); if(sample > 1e-5) { if(first < 0) first=i; last=i; } }
  return { durationMs:(last-first)/48, peakDb:20*Math.log10(peak), first };
}
/** Actual browser DSP measurements using the same engine as the live host. */
export async function checkOfflineAudio(): Promise<AudioCheck[]> {
  const checks: AudioCheck[]=[];
  for(const token of Object.keys(soundTokens) as SoundToken[]) {
    const definition=soundTokens[token]; if(!definition.ms) continue;
    const context=new OfflineAudioContext(1,Math.ceil((definition.ms/1000+.12)*48000),48000), engine=createSoundEngine(context,context.destination,() => 1);
    engine.cue({ token, pitchStep:5, level:definition.db, action:'trigger', durationMs:0 },0);
    const buffer=await context.startRendering(), measured=measure(buffer.getChannelData(0));
    checks.push({ token, ...measured, limitDb:definition.db, pass:measured.first >= 0 && measured.durationMs <= definition.ms+20 && measured.peakDb <= definition.db+.1 }); engine.dispose(context.currentTime);
  }
  for(const reverse of [false,true]) {
    const token=reverse ? 'pour.reverse' : 'pour.hold', level=reverse ? -16 : -14;
    const context=new OfflineAudioContext(1,4*48000,48000), engine=createSoundEngine(context,context.destination,() => .5); let maxVoices=0;
    for(let frame=0;frame<140;frame++) {
      const now=frame*.025;
      if(frame===0 || frame===5 || frame===10) engine.cue({ token:reverse ? 'crumb.remove' : 'crumb.add', pitchStep:2, level, action:'trigger', durationMs:0 },now);
      if(frame>=10) engine.cue({ token, pitchStep:Math.min(10,Math.floor(frame/10)), level, action:frame===10 ? 'start' : 'update', durationMs:0, rate:8+32*Math.min(1,(frame-10)/60) },now);
      engine.pump(now); maxVoices=Math.max(maxVoices,engine.inspect().activeVoices);
    }
    engine.cue({ token, pitchStep:10, level, action:'stop', durationMs:60 },3.5);
    engine.cue({ token:reverse ? 'crumb.remove' : 'crumb.add', pitchStep:10, level, action:'trigger', durationMs:0 },3.5);
    const buffer=await context.startRendering(), measured=measure(buffer.getChannelData(0));
    checks.push({ token, ...measured, limitDb:level, pass:measured.first>=0 && measured.durationMs>3300 && measured.durationMs<3650 && measured.peakDb<=level+.1 && maxVoices<=16 && !engine.inspect().pouring }); engine.dispose(context.currentTime);
  }
  const context=new OfflineAudioContext(1,48000,48000), engine=createSoundEngine(context,context.destination,() => .5);
  engine.cue({ token:'crumb.add', pitchStep:2, level:-20, action:'trigger', durationMs:0 },0);
  const buffer=await context.startRendering(), measured=measure(buffer.getChannelData(0));
  checks.push({ token:'crumb.add · quiet', ...measured, limitDb:-20, pass:measured.first>=0 && measured.durationMs<110 && measured.peakDb<=-19.9 }); engine.dispose(context.currentTime);
  return checks;
}
