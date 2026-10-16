import { ValidationError } from '@critter-crumbs/shared';

/** Success is only announced after the browser confirms the clipboard write. */
export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); }
  catch { throw new ValidationError('err.copy'); }
}

export const copyBurrowLink = (id: string) => copyText(new URL(`/burrows/${id}`, location.origin).href);
