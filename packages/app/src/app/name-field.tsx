import { useId } from 'react';
import { copy, formatCopy, MAX_NAME_LENGTH, type CopyId } from '@critter-crumbs/shared';

/**
 * A name as it is typed or pasted (Design System D35): it stops at MAX_NAME_LENGTH characters,
 * counted in code points as the server counts them. A longer name saved before the limit can be shortened, never
 * lengthened.
 */
export function fitName(next: string, previous: string) {
  const letters = Array.from(next), room = Math.max(MAX_NAME_LENGTH, Array.from(previous).length);
  return letters.length <= room ? next : letters.slice(0, room).join('');
}

/** A name field with its counter at the end of the box, as the flow page draws it ("7 / 16", SCREENS.name). */
export function NameField({ label, value, change, autoComplete }: { label: CopyId; value: string; change: (value: string) => void; autoComplete?: string }) {
  const field = useId(), counter = useId(), count = Array.from(value).length;
  return (
    <div className="field name-field">
      <label htmlFor={field}>{copy[label]}</label>
      <span className="name-box">
        <input id={field} required value={value} autoComplete={autoComplete} aria-describedby={counter} onChange={event => change(fitName(event.target.value, value))} />
        <span id={counter} className="name-count" data-over={count > MAX_NAME_LENGTH}>{formatCopy('name.counter', { n: count, max: MAX_NAME_LENGTH })}</span>
      </span>
    </div>
  );
}
