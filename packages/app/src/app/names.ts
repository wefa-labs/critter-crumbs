import { getAddress } from 'viem';
import { shortAddress, targetLabel } from './ui.js';
import type { PublicFeast } from './feast-view.js';

/** The critter a member owns in this feast, when they are one of its critters. */
export const targetOwnedBy = (feast: PublicFeast, address: string) => feast.targets.find(target => target.ownerAddress?.toLowerCase() === address.toLowerCase());

/** A member as the results name them: their critter's name, or their short address when they have no critter here. */
export function memberName(feast: PublicFeast, address: string) {
  const target = targetOwnedBy(feast, address);
  return target ? targetLabel(target) : shortAddress(getAddress(address));
}
