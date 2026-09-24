/** Formatting accepts trusted timestamps; it never reads a clock. */
export const absoluteTime = (at: number) => new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(at);
export function relativeTime(at: number, now: number) {
  const difference = at - now;
  const unit = Math.abs(difference) >= 86400000 ? 'day' : Math.abs(difference) >= 3600000 ? 'hour' : 'minute';
  return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(Math.round(difference / (unit === 'day' ? 86400000 : unit === 'hour' ? 3600000 : 60000)), unit);
}
export function localDateTime(at: number) { const date = new Date(at); return new Date(at - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
export const localTimeZone = () => new Intl.DateTimeFormat().resolvedOptions().timeZone;

export const percentShare = (share: [number,number]) => new Intl.NumberFormat('en',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1}).format(share[0]/share[1]);
