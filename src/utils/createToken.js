import { createCreatorClient } from '@zoralabs/protocol-sdk';
import {
  publicClient,
  walletClient,
  chainId,
  creatorAccountPromise,
} from './zoraprotocolConfig';
// import { collectionAddress } from './contract';
import collectionAddress from './dummyCollectionAddress';

export default async function createToken(tokenUri) {
  try {
    // //dinamically importing the zoraprotocolConfig file, so it only runs on client:
    // const { publicClient, walletClient, chainId, creatorAccountPromise } =
    //   typeof window !== 'undefined' ? await import('./zoraprotocolConfig') : {};

    const creatorAccount = await creatorAccountPromise;
    const creatorClient = createCreatorClient({ chainId, publicClient });

    const { parameters } = await creatorClient.create1155({
      // by providing a contract address, the token will be created on an existing contract
      // at that address
      contract: collectionAddress,
      token: {
        // token metadata uri
        tokenMetadataURI: tokenUri,
      },
      // account to execute the transaction (the creator)
      account: creatorAccount,
    });

    // simulate the transaction
    const { request } = await publicClient.simulateContract(parameters);

    // execute the transaction
    const hash = await walletClient.writeContract(request);
    // wait for the response
    const writeResponse = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return { parameters, request, hash, writeResponse };
  } catch (error) {
    console.error('Error:', error);
    return error;
  }
}
