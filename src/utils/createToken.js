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
  console.log(collectionAddress);
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
        maxSupply: BigInt('18446744073709551615'),
        mintToCreatorCount: 1,
        salesConfig: {
          //https://github.com/ourzora/zora-protocol/blob/10d3855fd05ef457c12a978d851886903cddc409/packages/protocol-sdk/src/create/types.ts#L13
          pricePerToken: BigInt(0), // defaults to 0, type bigint
          saleStart: BigInt(0), // defaults to 0 (now), in seconds
          saleEnd: BigInt('18446744073709551615'), // defaults to forever, in seconds
          maxTokensPerAddress: BigInt(1), // bigint
          // currency:   //type Address, if an erc20 mint, the erc20 address.  Leave null for eth mints
        },
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
