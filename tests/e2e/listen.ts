import type { Page } from 'playwright/test';

/**
 * Records which recordings the browser is asked to play and stop, by following each file through the three Web Audio
 * calls a recording passes through: the fetched bytes, the decoded buffer, the source that starts. The sound itself is
 * measured in audio.spec.ts; this is about which sound plays when.
 */
export async function listen(page: Page) {
  await page.addInitScript(() => {
    const fetched = new WeakMap<ArrayBuffer, string>(), decoded = new WeakMap<AudioBuffer, string>(), heard = { played: [] as string[], stopped: [] as string[] };
    Object.assign(window, { heard });
    const name = (url: string) => new URL(url).pathname.replace('/audio/', '').replace('.mp3', '');
    const arrayBuffer = Response.prototype.arrayBuffer, decode = BaseAudioContext.prototype.decodeAudioData, start = AudioBufferSourceNode.prototype.start, stop = AudioBufferSourceNode.prototype.stop;
    Response.prototype.arrayBuffer = async function () { const bytes = await arrayBuffer.call(this); if (this.url.includes('/audio/')) fetched.set(bytes, name(this.url)); return bytes; };
    BaseAudioContext.prototype.decodeAudioData = async function (bytes: ArrayBuffer) { const file = fetched.get(bytes), buffer = await decode.call(this, bytes); if (file) decoded.set(buffer, file); return buffer; };
    AudioBufferSourceNode.prototype.start = function (...time) { const file = this.buffer && decoded.get(this.buffer); if (file) heard.played.push(file); start.apply(this, time); };
    AudioBufferSourceNode.prototype.stop = function (...time) { const file = this.buffer && decoded.get(this.buffer); if (file) heard.stopped.push(file); stop.apply(this, time); };
  });
  const read = (list: 'played' | 'stopped') => () => page.evaluate(key => (window as unknown as { heard: Record<string, string[]> }).heard[key]!, list);
  return { played: read('played'), stopped: read('stopped') };
}
