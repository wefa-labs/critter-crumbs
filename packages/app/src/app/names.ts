import { getAddress } from 'viem';
import { shortAddress, targetLabel } from './ui.js';
import { isMemberFeast, type PublicFeast } from './feast-view.js';

/** The critter a member owns in this feast, when they are one of its critters. */
export const targetOwnedBy = (feast: PublicFeast, address: string) => feast.targets.find(target => target.ownerAddress?.toLowerCase() === address.toLowerCase());

/**
 * A participant's name as the burrow knows it (ENS, else the name they typed), from a member's read of the feast. It is
 * what names them in an options feast, whose critters are the options (QA lifecycle-04). Null when there is none.
 */
const nameInBurrow = (feast: PublicFeast, address: string) =>
  isMemberFeast(feast) ? feast.participantNames.find(entry => entry.address.toLowerCase() === address.toLowerCase())?.name ?? null : null;

/** A member as the results name them: the critter they are in this feast, else the burrow's name for them, else their short address. */
export function memberName(feast: PublicFeast, address: string) {
  const target = targetOwnedBy(feast, address);
  return target ? targetLabel(target) : nameInBurrow(feast, address) ?? shortAddress(getAddress(address));
}

/** The same member in a CSV, the name in full: one the feast holds no name for is their whole address, as a people feast's nameless critter is. */
export const memberCsvName = (feast: PublicFeast, address: string) => targetOwnedBy(feast, address)?.name ?? nameInBurrow(feast, address) ?? getAddress(address);
