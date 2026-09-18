import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import type { Address } from 'viem';
import { publicClient } from './zoraprotocolConfig';
import collectionAddress from './contract';

// Reads a token's current tokenURI directly from the contract — the
// ground truth for what a write actually landed as, rather than assuming
// a just-submitted value was applied as intended.
export default async function readTokenUriOnChain(
  tokenId: bigint
): Promise<string | null> {
  try {
    const uri = await (publicClient as any).readContract({
      address: collectionAddress as Address,
      abi: zoraCreator1155ImplABI,
      functionName: 'uri',
      args: [tokenId],
    });
    return typeof uri === 'string' ? uri : null;
  } catch (error) {
    console.warn(`Failed to read uri() for token ${tokenId}:`, error);
    return null;
  }
}
