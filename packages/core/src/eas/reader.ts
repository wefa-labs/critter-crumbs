import { createPublicClient, decodeEventLog, http, parseAbi } from 'viem';
import { hex, parseAddress, type Address, type Hex } from '@critter-crumbs/shared';
export const easAbi = parseAbi([
  'event Attested(address indexed recipient,address indexed attester,bytes32 uid,bytes32 indexed schemaUID)',
  'function getAttestation(bytes32 uid) view returns ((bytes32 uid,bytes32 schema,uint64 time,uint64 expirationTime,uint64 revocationTime,bytes32 refUID,address recipient,address attester,bool revocable,bytes data))',
  'function attest((bytes32 schema,(address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value) data) request) payable returns (bytes32)',
]);
export class EasRecordError extends Error {}
export interface ChainAttestation {
  chainId: 8453 | 84532; txHash: Hex; uid: Hex; schema: Hex; attester: Address; recipient: Address;
  time: string; expirationTime: string; revocationTime: string; revocable: boolean; refUID: Hex; data: Hex;
}
export interface EasReader { read(txHash: Hex): Promise<ChainAttestation> }
export function createEasReader(config: { chainId: 8453 | 84532; address: Address; resultSchemaUid: Hex; rpcUrl: string; fetch?: typeof fetch }): EasReader {
  if (![8453, 84532].includes(config.chainId)) throw new TypeError('Unsupported result chain');
  const address = parseAddress(config.address), schema = hex(config.resultSchemaUid, 32);
  const client = createPublicClient({ transport: http(config.rpcUrl, { fetchFn: config.fetch, timeout: 10000, retryCount: 0 }) });
  const same = (a: string | null, b: string) => a?.toLowerCase() === b.toLowerCase();
  return { async read(input) {
    const txHash = hex(input, 32);
    if (await client.getChainId() !== config.chainId) throw new EasRecordError('Wrong result chain');
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success' || !same(receipt.transactionHash, txHash) || !same(receipt.to, address)) throw new EasRecordError('Invalid result receipt');
    const finalized = await client.getBlock({ blockTag: 'finalized' });
    const block = await client.getBlock({ blockNumber: receipt.blockNumber });
    if (finalized.number === null || receipt.blockNumber > finalized.number || !same(block.hash, receipt.blockHash)) throw new EasRecordError('Unfinalized result receipt');
    const events = receipt.logs.filter(log => same(log.address, address) && !log.removed).flatMap(log => {
      try {
        const event = decodeEventLog({ abi: easAbi, eventName: 'Attested', data: log.data, topics: log.topics, strict: true });
        return same(event.args.schemaUID, schema) && same(log.transactionHash, txHash) && same(log.blockHash, receipt.blockHash) ? [event.args] : [];
      } catch { return []; }
    });
    if (events.length !== 1) throw new EasRecordError('Missing or ambiguous result event');
    const event = events[0]!;
    const stored = await client.readContract({ address, abi: easAbi, functionName: 'getAttestation', args: [event.uid], blockNumber: receipt.blockNumber });
    if (!same(stored.uid, event.uid) || !same(stored.schema, schema) || !same(stored.attester, event.attester) || !same(stored.recipient, event.recipient)
      || !same(receipt.from, stored.attester) || stored.time !== block.timestamp) throw new EasRecordError('Result event and stored attestation disagree');
    return { ...stored, chainId: config.chainId, txHash, time: String(stored.time), expirationTime: String(stored.expirationTime), revocationTime: String(stored.revocationTime) };
  } };
}
