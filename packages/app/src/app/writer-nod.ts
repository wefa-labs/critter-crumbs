/** One small nod from the feet: the critter dips, settles a little wider, and stands again. */
const NOD = [{ translate: '0 0', scale: '1 1' }, { translate: '0 3px', scale: '1.02 .96', offset: .35 }, { translate: '0 0', scale: '1 1' }];
const NOD_TIMING: KeyframeAnimationOptions = { duration: 360, easing: 'ease-in-out' };

/**
 * A writer's critter on the gathering floor replies to their statement saving (the November UI audit, build step 11):
 * one quiet nod, run by the browser's own animation clock because nothing here is counted or kept, as the first steps'
 * practice squash is (practice-flight.ts). `drawing` is the critter's drawing; `still` is Still critters or the
 * device's reduced motion, under which it does not move.
 */
export function nod(drawing: Element | null | undefined, still: boolean) {
  if (!still) drawing?.animate(NOD, NOD_TIMING);
}
