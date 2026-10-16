// Writes ../audition.html from the render manifest and the seam checks, so the page shows the measured numbers.
// The page plays the files render.mjs and evaluate.mjs write into the package’s media/ folder.
// Usage: node audition-page.mjs <.scratch/music-loops dir>
import { readFileSync, writeFileSync } from 'node:fs';

const dir = process.argv[2] ?? new URL('../media', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(`${dir}/auditions/manifest.json`, 'utf8')), verify = JSON.parse(readFileSync(`${dir}/auditions/verify.json`, 'utf8'));
const TRACKS = [
  ['burrow', 'M1 The burrow', 'The launcher, the first steps and home'],
  ['square', 'M2 The town square', 'A burrow, setup and gathering'],
  ['feeding', 'M3 Feeding time', 'Scattering: the reveal, reading and scattering'],
  ['full', 'M5 Everyone is full', 'After the feast: the results'],
];
const LABEL = { current: 'As the app plays it today', proposed: 'Proposed loop', alternative: 'Alternative loop' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const CANDIDATES = {
  burrow: [[17, 41, 'a'], [9, 41, 'b'], [25, 41, 'c'], [17, 33, 'd'], [21, 37, 'e'], [9, 33, 'f']],
  square: [[9, 33, 'a'], [5, 29, 'b'], [7, 31, 'c'], [17, 33, 'd'], [1, 25, 'e']],
  feeding: [[7, 28, 'a'], [5, 26, 'b'], [6, 27, 'c'], [8, 29, 'd'], [10, 27, 'e']],
  full: [[5, 17, 'a'], [6, 18, 'b'], [7, 19, 'c'], [8, 20, 'd'], [9, 17, 'e']],
};
const sections = TRACKS.map(([id, name, where]) => {
  const entry = manifest[id];
  const rows = entry.versions.map(v => {
    const check = verify[id].find(c => c.id === v.id), first = check.checks[0];
    const what = v.id === 'current'
      ? `Whole file (${entry.seconds.toFixed(2)} s), next pass 2 s early, sine in and cosine out`
      : `File to bar ${v.bars[1]}, then bars ${v.bars[0]}–${v.bars[1] - 1} again; ${v.fadeMs} ms fade before the downbeat`;
    const measured = `Beat grid ${check.gridMs >= 0 ? '+' : '−'}${Math.abs(check.gridMs).toFixed(0)} ms, next downbeat on beat ${check.landsOnBeat}, level ${first.levelDb >= 0 ? '+' : '−'}${Math.abs(first.levelDb).toFixed(1)} dB`;
    const seams = v.seams.map((t, k) => `<button type="button" data-audio="${id}-${v.id}" data-at="${Math.max(0, t - 6).toFixed(2)}">Seam ${k + 1} · ${fmt(t)}</button>`).join('');
    return `<tr><th scope="row">${LABEL[v.id]}<span>${esc(what)}</span></th><td><audio id="${id}-${v.id}" controls preload="none" src="media/auditions/${esc(v.file)}"></audio><div class="seams">${seams}</div></td><td class="measured">${esc(measured)}</td></tr>`;
  }).join('');
  const closeups = `<figure><figcaption>Today</figcaption><audio controls preload="none" src="media/seams/${id}-seam-current.mp3"></audio></figure>`;
  return `<section aria-labelledby="h-${id}"><h2 id="h-${id}">${esc(name)}</h2><p class="where">${esc(where)}</p>
<table><thead><tr><th scope="col">Version</th><th scope="col">Three repeats (four passes)</th><th scope="col">Measured at each seam</th></tr></thead><tbody>${rows}</tbody></table>
<details><summary>Close-ups of every candidate (8 s either side of one seam)</summary><div class="closeups">${closeups}${(CANDIDATES[id] ?? []).map(c => `<figure><figcaption>Bars ${c[0]} → ${c[1]}</figcaption><audio controls preload="none" src="media/seams/${id}-seam-${c[2]}-bar${c[0]}-${c[1]}.mp3"></audio></figure>`).join('')}</div></details></section>`;
});
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Music Loop Auditions</title>
<style>
:root { color-scheme: light dark; --bg:#F1E7D6; --raised:#FBF6EC; --ink:#2A211A; --soft:#5A4B3C; --line:#D6C7AD; --gold:#D89A2E; }
@media (prefers-color-scheme: dark) { :root { --bg:#25202B; --raised:#2F2936; --ink:#F3EBDD; --soft:#CDBFAE; --line:#4A4152; } }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width:1100px; margin:0 auto; padding:24px 16px 64px; }
h1 { font-size:28px; margin:0 0 8px; } h2 { font-size:20px; margin:0; }
p { max-width:72ch; } .lede { color:var(--soft); }
section { background:var(--raised); border:1.5px solid var(--ink); border-radius:22px; padding:20px; margin:20px 0; box-shadow:3px 3px 0 var(--ink); }
.where { margin:2px 0 12px; color:var(--soft); font-size:14px; }
table { width:100%; border-collapse:collapse; } th, td { text-align:left; vertical-align:top; padding:10px 8px; border-top:1px solid var(--line); }
thead th { font-size:12px; color:var(--soft); border-top:0; }
th[scope=row] { width:26%; font-size:14px; } th[scope=row] span { display:block; font-weight:400; color:var(--soft); font-size:12px; margin-top:4px; }
audio { width:100%; max-width:420px; }
.seams { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
button { font:inherit; font-size:13px; min-height:32px; padding:4px 12px; border-radius:999px; border:1.5px solid var(--ink); background:var(--bg); color:var(--ink); cursor:pointer; }
button:focus-visible, summary:focus-visible { outline:3px solid var(--ink); outline-offset:2px; }
.measured { font-size:13px; color:var(--soft); width:26%; font-variant-numeric:tabular-nums; }
details { margin-top:12px; } summary { cursor:pointer; font-weight:600; font-size:14px; }
.closeups { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:12px; margin-top:10px; }
figure { margin:0; } figcaption { font-size:13px; color:var(--soft); margin-bottom:4px; }
@media (max-width:700px) { thead { display:none; } tr, th, td { display:block; width:auto !important; } th[scope=row] { border-top:1px solid var(--line); padding-bottom:0; } td { border-top:0; } }
</style>
</head>
<body>
<main>
<h1>Music loop auditions</h1>
<p class="lede">Each track three ways: as the app loops it today, as proposed, and an alternative. Every file plays four passes, so it holds three seams; the seam buttons start six seconds before one. Files are at their shipped level (−16 LUFS), not the app's music level. The numbers are measurements, not listening: see <a href="README.md">the record</a>. Nothing plays until you press play.</p>
${sections.join('\n')}
</main>
<script>
for (const button of document.querySelectorAll('button[data-audio]')) button.addEventListener('click', () => {
  const audio = document.getElementById(button.dataset.audio);
  for (const other of document.querySelectorAll('audio')) if (other !== audio) other.pause();
  audio.preload = 'auto';
  const go = () => { audio.currentTime = Number(button.dataset.at); audio.play(); };
  if (audio.readyState >= 1) go(); else audio.addEventListener('loadedmetadata', go, { once: true }), audio.load();
});
for (const audio of document.querySelectorAll('audio')) audio.addEventListener('play', () => { for (const other of document.querySelectorAll('audio')) if (other !== audio) other.pause(); });
</script>
</body>
</html>
`;
writeFileSync(new URL('../audition.html', import.meta.url), html);
console.log('wrote audition.html');
