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
export interface Profile { address: Address; variant: number; rerollsUsed: number; displayName: string | null; ensName: string | null; ensCheckedAt: number | null; createdAt: number }
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
