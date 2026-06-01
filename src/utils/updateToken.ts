import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { publicClient, walletClient } from './zoraprotocolConfig';
import collectionAddress from './contract';
import type { Address } from 'viem';

export default async function updateToken(
  tokenId: bigint,
  metadataUri: string,
  account: Address,
): Promise<{ hash?: string; error?: string }> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: collectionAddress as Address,
      abi: zoraCreator1155ImplABI,
      functionName: 'updateTokenURI',
      args: [tokenId, metadataUri],
    });

    const hash = await walletClient.writeContract(request);

    await publicClient.waitForTransactionReceipt({ hash });

    return { hash };
  } catch (error) {
    console.error('Error in updateToken:', error);
    const message =
      (error as { shortMessage?: string; message?: string })?.shortMessage ??
      (error as { message?: string })?.message ??
      'Unknown error';
    return { error: message };
  }
}
