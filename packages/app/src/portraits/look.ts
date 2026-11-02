/**
 * Which critters a page draws. Every build draws Garden Spirits (decision of 2 November 2026). A page opened with
 * ?critters=1 draws version 1, as production did before; the development server also keeps the October inked
 * drawing at ?critters=2. The look is chosen per page and never changes a saved identity.
 */
export type CritterLook = 'garden' | 'inked' | 'baseline';
export function critterLook(development: boolean, search: string): CritterLook {
  const asked = new URLSearchParams(search).get('critters');
  if (asked === '1') return 'baseline';
  if (development && asked === '2') return 'inked';
  return 'garden';
}
