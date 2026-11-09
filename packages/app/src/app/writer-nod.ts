import { useEffect, useRef, useState } from 'react';

/** One small nod from the feet: the critter dips, settles a little wider, and stands again. */
const NOD = [{ translate: '0 0', scale: '1 1' }, { translate: '0 3px', scale: '1.02 .96', offset: .35 }, { translate: '0 0', scale: '1 1' }];
const NOD_TIMING: KeyframeAnimationOptions = { duration: 360, easing: 'ease-in-out' };
/** How long the writer's critter smiles after its statement saves. */
const PLEASED_MS = 1200;

/**
 * A writer's critter on the gathering floor replies to their statement saving (the November UI audit, build step 11):
 * it smiles and gives one quiet nod, run by the browser's own animation clock because nothing here is counted or kept,
 * as the first steps' practice squash is (practice-flight.ts). `still` is Still critters or the device's reduced
 * motion, under which it smiles without moving. `mark` goes on an element inside the writer's FloorCritter, which takes
 * no ref of its own; `pleased` is its `delighted`; `reply` is called on each save the store accepts.
 */
export function useSaveReply(still: boolean) {
  const mark = useRef<HTMLSpanElement>(null), timer = useRef<number | undefined>(undefined), [pleased, setPleased] = useState(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function reply() {
    if (!still) mark.current?.parentElement?.querySelector('.stage')?.animate(NOD, NOD_TIMING);
    setPleased(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPleased(false), PLEASED_MS);
  }
  return { mark, pleased, reply };
}
