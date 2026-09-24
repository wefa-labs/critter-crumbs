import { useEffect, useState } from 'react';
import { copy } from '@critter-crumbs/shared';
import { createAudio, soundTokens } from '../audio/index.js';
import { checkOfflineAudio, type AudioCheck } from '../audio/offline.js';
import { browserSettings } from '../sim/settings.js';
import type { SoundToken } from '../world/index.js';
export function AudioWorkshop() {
  const [audio] = useState(() => createAudio(browserSettings(window).settings)), [checks, setChecks] = useState<AudioCheck[]>([]), [busy, setBusy] = useState(false);
  const [state, setState] = useState(audio.inspect());
  useEffect(() => () => audio.destroy(), [audio]);
  return <main><h1>{copy['preview.audio.title']}</h1><p>{copy['preview.audio.help']}</p><button disabled={busy} onClick={() => { setBusy(true); void checkOfflineAudio().then(setChecks).finally(() => setBusy(false)); }}>{copy['preview.audio.run']}</button>
    <p data-testid="audio-result">{checks.length ? checks.every(check => check.pass) ? copy['preview.audio.pass'] : copy['preview.audio.fail'] : copy['preview.audio.pending']}</p>
    <table><caption>{copy['preview.audio.caption']}</caption><thead><tr><th>{copy['preview.audio.token']}</th><th>{copy['preview.audio.duration']}</th><th>{copy['preview.audio.peak']}</th><th>{copy['preview.audio.limit']}</th><th>{copy['preview.audio.status']}</th></tr></thead><tbody>{checks.map(check => <tr key={check.token}><th>{check.token}</th><td>{check.durationMs.toFixed(2)}</td><td>{check.peakDb.toFixed(2)}</td><td>{check.limitDb}</td><td>{check.pass ? copy['preview.audio.pass'] : copy['preview.audio.fail']}</td></tr>)}</tbody></table>
    <div className="actions">{(Object.keys(soundTokens) as SoundToken[]).filter(token => soundTokens[token].ms).map(token => <button key={token} onClick={() => { audio.unlock(); audio.play(token); setState(audio.inspect()); }}>{token}</button>)}</div><p>{JSON.stringify(state)}</p>
  </main>;
}
