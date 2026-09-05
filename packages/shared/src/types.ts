export type Hex = `0x${string}`;
export type Address = Hex;
export type FeastStatus = 'draft' | 'open' | 'cancelled' | 'void';
export type Phase = 'draft' | 'gathering' | 'scattering' | 'feast' | 'cancelled' | 'void';
export interface FeastClock { status: FeastStatus; gatheringEndsAt: number; scatteringEndsAt: number }
export type FeastKind = 'people' | 'options';
export interface FeastSetup {
  title: string; context: string; kind: FeastKind; crumbsPerCritter: number;
  gatheringEndsAt: number; scatteringEndsAt: number; aggregatePublic: boolean; individualOpen: boolean;
  options: { name: string; statement: string }[];
}
export interface Profile { address: Address; variant: number; rerollsUsed: number; critterLocked: boolean; displayName: string | null; ensName: string | null; ensCheckedAt: number | null; createdAt: number }
export interface Target { id: Hex; ownerAddress: Address | null; name: string; position: number; kind: 'person' | 'option' }
export interface Statement { targetId: Hex; authorAddress: Address; body: string; updatedAt: number }
export interface PublishedEntry { seq: string; uid: Hex; attester: Address }
export interface CloseRecord { published: PublishedEntry[]; counted: PublishedEntry[]; publishedSetHash: Hex; closedAt: number }
export interface Registration { identityPrefix: Hex; identity: Hex; eon: number; eonKey: Hex; txHash: Hex | null }
export interface Feast extends FeastClock, Omit<FeastSetup, 'options'> {
  id: string; burrowId: string; createdBy: Address; gatheringExtended: boolean;
  openedAt: number | null; cancelledAt: number | null; participantsFrozenAt: number | null;
  registration: Registration | null; targets: Target[]; participants: Address[]; closeRecord: CloseRecord | null;
}
export interface AllocationPayload { v: 1; feast: string; scatterer: Address; participants: Hex; allocation: [Hex, number][]; nonce: string }
export interface ApiError { error: import('./copy.js').CopyId; serverNow: number }
export type ApiResponse<T> = T & { serverNow: number };
export interface TallyCandidate { seq: string; uid: Hex; attester: Address; plaintext: string | null }
export interface TallyInput {
  feastId: string; publishedSetHash: Hex; crumbsIssued: number;
  targets: Pick<Target, 'id' | 'ownerAddress' | 'position'>[]; participants: Address[]; ballots: TallyCandidate[];
}
export interface TallyResult {
  counted: PublishedEntry[];
  rejected: { attester: Address; seq: string; reason: 'not_participant' | 'unreadable' | 'invalid_payload' }[];
  didNotScatter: Address[];
  totals: { targetId: Hex; crumbs: number; share: [number, number] }[];
  totalScattered: number; ties: Hex[][]; resultHash: Hex;
}
export interface OffchainMessage {
  version: 2; schema: Hex; recipient: Address; time: string; expirationTime: string;
  revocable: boolean; refUID: Hex; data: Hex; salt: Hex;
}
export interface SignedOffchainAttestation {
  version: 2; uid: Hex;
  domain: { name: string; version: string; chainId: number; verifyingContract: Address };
  primaryType: 'Attest';
  types: { Attest: { name: string; type: 'uint16' | 'bytes32' | 'address' | 'uint64' | 'bool' | 'bytes' }[] };
  message: OffchainMessage; signature: { v: 27 | 28; r: Hex; s: Hex };
}
