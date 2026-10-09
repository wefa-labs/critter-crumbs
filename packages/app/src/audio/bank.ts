/** Loads and decodes each sound once. A failed load leaves that sound silent until it is next asked for; the DOM always carries the state. */
export function createAudioBank({ fetch, decode }: { fetch: (url: string) => Promise<ArrayBuffer>; decode: (bytes: ArrayBuffer) => Promise<AudioBuffer> }) {
  const requests = new Map<string, Promise<AudioBuffer | null>>(), ready = new Map<string, AudioBuffer>();
  return {
    load(url: string): Promise<AudioBuffer | null> {
      let request = requests.get(url);
      if (!request) {
        const made: Promise<AudioBuffer | null> = fetch(url).then(decode).then(
          buffer => { if (requests.get(url) === made) ready.set(url, buffer); return buffer; },
          () => { if (requests.get(url) === made) requests.delete(url); return null; },
        );
        requests.set(url, request = made);
      }
      return request;
    },
    get: (url: string): AudioBuffer | undefined => ready.get(url),
    /** Lets go of a decoded sound, as the music does with a track it has left: a minute of stereo is about 30 MB. Asking again loads it afresh. */
    release(url: string) { requests.delete(url); ready.delete(url); },
  };
}
export type AudioBank = ReturnType<typeof createAudioBank>;
