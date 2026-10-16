/** Review rendering never changes a saved identity or the production default. */
export function canReviewGarden(development: boolean, enabled: string | undefined, search: string) {
  return (development || enabled === 'true') && new URLSearchParams(search).get('critters') === 'garden';
}
