import { formatCopy } from '@critter-crumbs/shared';
/**
 * A deadline in Design System §8's absolute form, "Wed 7 Oct, 18:00 (PDT)": the `deadline.absolute` template filled
 * from the viewer's own calendar parts and zone. The core game uses it; other screens keep `absoluteTime`.
 */
export function absoluteDeadline(at: number, { locale, timeZone }: { locale?: string; timeZone?: string } = {}) {
  const parts = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short', ...(timeZone ? { timeZone } : {}) }).formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(entry => entry.type === type)?.value ?? '';
  return formatCopy('deadline.absolute', { weekday: part('weekday'), day: part('day'), month: part('month'), time: `${part('hour')}:${part('minute')}`, tz: part('timeZoneName') });
}
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

/** Names in a sentence, as the review pages write them: "Moss and Clover", "Acorn, Pebble and Willow". */
export const joinNames = (names: readonly string[]) => new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(names);

/** "Scattering closes in 2 days", at minute granularity: the dock's line on the phone and the header's on desktop. */
export const closingLine = (at: number, now: number) => formatCopy('deadline.scattering', { relative: relativeTime(at, Math.floor(now / 60000) * 60000) });
