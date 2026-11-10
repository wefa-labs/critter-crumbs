import { decodeBallot, feastBytes32, phaseAt, verifyOffchainAttestation, type EasConfig } from '@critter-crumbs/core';
import { BALLOT_TIME_TOLERANCE_SECONDS, MAX_CIPHERTEXT_BYTES, parseSignedOffchainAttestation, type Address, type FeastClock, type Hex } from '@critter-crumbs/shared';
import { zeroAddress, zeroHash } from 'viem';
import { HttpError } from './errors.js';
export interface BallotContext extends FeastClock { id: string; shutterIdentity: Hex | null; participants: Address[] }
/** Verify cryptography once; recheck immutable context and fresh time inside each transaction attempt. */
export async function verifyBallot(input: unknown, attester: Address, config: EasConfig) {
  const signed = parseSignedOffchainAttestation(input), message = signed.message;
  if (message.data.length > 2 + (MAX_CIPHERTEXT_BYTES + 160) * 2 || message.recipient !== zeroAddress || message.expirationTime !== '0' || message.revocable || message.refUID !== zeroHash) throw new HttpError(400, 'err.generic');
  let decoded: ReturnType<typeof decodeBallot>;
  try { decoded = decodeBallot(message.data); } catch { throw new HttpError(400, 'err.generic'); }
  if (decoded.payloadVersion !== 1 || (decoded.ciphertext.length - 2) / 2 > MAX_CIPHERTEXT_BYTES || !await verifyOffchainAttestation(attester, signed, config)) throw new HttpError(400, 'err.generic');
  return {
    forFeast(feast: BallotContext, now: number) {
      if (phaseAt(feast, now) !== 'scattering') throw new HttpError(400, 'scatter.closed');
      if (!feast.participants.includes(attester)) throw new HttpError(403, 'err.notParticipant');
      const seconds = BigInt(Math.floor(now / 1000)), time = BigInt(message.time), tolerance = BigInt(BALLOT_TIME_TOLERANCE_SECONDS);
      if (decoded.feastId !== feastBytes32(feast.id) || decoded.shutterIdentity !== feast.shutterIdentity) throw new HttpError(400, 'err.generic');
      /* its own refusal, so the screen asks for a fresh signature instead of blaming the connection (rules-04) */
      if (time < seconds - tolerance || time > seconds + tolerance) throw new HttpError(400, 'scatter.sign.expired');
      return { uid: signed.uid, ciphertext: decoded.ciphertext, attestation: input };
    },
  };
}
