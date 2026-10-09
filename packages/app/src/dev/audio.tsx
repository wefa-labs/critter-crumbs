import { useEffect, useState } from 'react';
import { copy } from '@critter-crumbs/shared';
import { createAudio, soundTokens, type MusicTrack } from '../audio/index.js';
import { MUSIC } from '../audio/assets.js';
import { checkOfflineAudio, type AudioCheck } from '../audio/offline.js';
import { browserSettings } from '../sim/settings.js';
import type { SoundToken } from '../world/index.js';
/** Measures every cue in the browser's own DSP, and plays any cue or track through the live mix, both toggles on. */
export function AudioWorkshop() {
  const [audio] = useState(() => createAudio({ ...browserSettings(window).settings, effects: true, music: true })), [checks, setChecks] = useState<AudioCheck[]>([]), [busy, setBusy] = useState(false);
  const [state, setState] = useState(audio.inspect()), [ducked, setDucked] = useState(false);
  useEffect(() => () => audio.destroy(), [audio]);
  const act = (action: () => void) => () => { audio.unlock(); action(); setState(audio.inspect()); };
  return <main onPointerDownCapture={() => audio.unlock()}><h1>{copy['preview.audio.title']}</h1><p>{copy['preview.audio.help']}</p><button disabled={busy} onClick={() => { setBusy(true); void checkOfflineAudio().then(setChecks).finally(() => setBusy(false)); }}>{copy['preview.audio.run']}</button>
    <p data-testid="audio-result">{checks.length ? checks.every(check => check.pass) ? copy['preview.audio.pass'] : copy['preview.audio.fail'] : copy['preview.audio.pending']}</p>
    <table><caption>{copy['preview.audio.caption']}</caption><thead><tr><th>{copy['preview.audio.token']}</th><th>{copy['preview.audio.duration']}</th><th>{copy['preview.audio.peak']}</th><th>{copy['preview.audio.limit']}</th><th>{copy['preview.audio.status']}</th></tr></thead><tbody>{checks.map(check => <tr key={check.token}><th>{check.token}</th><td>{check.durationMs.toFixed(2)}</td><td>{check.peakDb.toFixed(2)}</td><td>{check.limitDb}</td><td>{check.pass ? copy['preview.audio.pass'] : copy['preview.audio.fail']}</td></tr>)}</tbody></table>
    <h2>{copy['preview.audio.cues']}</h2>
    <div className="actions">{(Object.keys(soundTokens) as SoundToken[]).filter(token => soundTokens[token].ms).map(token => <button key={token} onClick={act(() => audio.play(token))}>{token}</button>)}</div>
    <h2>{copy['sound.music.label']}</h2>
    <div className="actions">{(Object.keys(MUSIC) as MusicTrack[]).map(track => <button key={track} onClick={act(() => audio.music(track))}>{track}</button>)}<button className="secondary" onClick={act(() => audio.music(null))}>{copy['preview.audio.quiet']}</button>
      <label><input type="checkbox" checked={ducked} onChange={event => { setDucked(event.target.checked); audio.duck(event.target.checked); }} />{copy['preview.audio.duck']}</label></div>
    <p>{JSON.stringify(state)}</p>
  </main>;
}
