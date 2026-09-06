import { createPublicClient, http, type Transport } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { parseAddress, type Address } from '@critter-crumbs/shared';
export interface EnsResolver {
  lookupName(address: Address): Promise<string | null>;
  resolveAddress(name: string): Promise<Address | null>;
}
export function createEnsResolver(transport: Transport): EnsResolver {
  const client = createPublicClient({ chain: mainnet, transport });
  async function resolveAddress(name: string) {
    const address = await client.getEnsAddress({ name: normalize(name) });
    return address ? parseAddress(address) : null;
  }
  return { resolveAddress, async lookupName(address) {
    const name = await client.getEnsName({ address });
    if (!name) return null;
    const normalized = normalize(name);
    return await resolveAddress(normalized) === parseAddress(address) ? normalized : null;
  } };
}
export const mainnetEns = (url: string) => createEnsResolver(http(url, { retryCount: 0, timeout: 10000 }));
