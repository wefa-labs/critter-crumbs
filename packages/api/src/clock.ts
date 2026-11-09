/** The sole server wall-clock adapter. Domain code receives this function. */
export const serverNow = (): number => Date.now();
export function createServerClock(initialOffset = 0, saveOffset?: (offset: number) => Promise<void>) {
  let offset = initialOffset, pending = Promise.resolve();
  return {
    now: () => Date.now() + offset,
    /** how far a development server has moved its clock from the wall clock, to reach a phase */
    offset: () => offset,
    setTime(now: number) {
      const update = pending.then(async () => { const next = now - Date.now(); await saveOffset?.(next); offset = next; });
      pending = update.catch(() => {}); return update;
    },
  };
}
