/** The only client adapter that reads wall time. Until stamped, time is unknown. */
export function clockOffset(clock = () => Date.now()) {
  let offset: number | null = null;
  return {
    now: (): number | null => offset === null ? null : clock() + offset,
    accept(serverNow: number): number { offset = serverNow - clock(); return offset; },
  };
}
