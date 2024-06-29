import { createCreatorClient } from '@zoralabs/protocol-sdk';
import {
  publicClient,
  walletClient,
  chainId,
  creatorAccountPromise,
} from './zoraprotocolConfig';
// import { collectionAddress } from './contract';
import collectionAddress from './dummyCollectionAddress';
import { isAddress, parseEther } from 'viem';
import { SplitV1Client } from '@0xsplits/splits-sdk';

export default async function createToken(
  tokenUri,
  tokenPrice,
  tokenMintingDuration,
  tokenPayoutRecipient,
  tokenEditionSize
) {
  // parsing tokenMintingDuration:
  // TODO: ask Zora team how this configuration works
  let parsedTokenMintingDuration;
  if (tokenMintingDuration === 'open') {
    parsedTokenMintingDuration = BigInt('18446744073709551615');
  } else if (tokenMintingDuration === '24h') {
    parsedTokenMintingDuration = BigInt('86400');
  } else if (tokenMintingDuration === '1week') {
    parsedTokenMintingDuration = BigInt('604800');
  } else if (tokenMintingDuration === '1month') {
    parsedTokenMintingDuration = BigInt('2592000');
  } else if (tokenMintingDuration === '3months') {
    parsedTokenMintingDuration = BigInt('7776000');
  } else if (tokenMintingDuration === '6months') {
    parsedTokenMintingDuration = BigInt('15552000');
  } else if (tokenMintingDuration === '1year') {
    parsedTokenMintingDuration = BigInt('31536000');
  } else {
    parsedTokenMintingDuration = BigInt('18446744073709551615');
  }
  console.log('parsedTokenMintingDuration: ', parsedTokenMintingDuration);

  // managing payoutRecipient:
  let parsedPayoutRecipient;
  const creatorAccount = await creatorAccountPromise;
  if (tokenPayoutRecipient === 'me') {
    parsedPayoutRecipient = creatorAccount;
  } else if (isAddress(tokenPayoutRecipient)) {
    parsedPayoutRecipient = tokenPayoutRecipient;
  } else if (Array.isArray(tokenPayoutRecipient)) {
    console.log('setting up split');
    // https://docs.zora.co/protocol-sdk/creator/splits
    // setup a splits client
    const splitsClient = new SplitV1Client({
      chainId,
      publicClient,
      apiConfig: {
        // This is a dummy 0xSplits api key, replace with your own
        apiKey: process.env.SPLIT_API_KEY,
      },
    });

    // configure the split:
    const splitsConfig = {
      recipients: tokenPayoutRecipient.map((recipient) => ({
        address: recipient.address,
        percentAllocation: +recipient.percentage,
      })),
      distributorFeePercent: 0,
    };

    // get the deterministic split address, and determine if it has been created or not.
    const predicted = await splitsClient.predictImmutableSplitAddress(
      splitsConfig
    );

    if (!predicted.splitExists) {
      // if the split has not been created, create it by getting the transaction to execute
      // and executing it with the wallet client
      const { data, address } = await splitsClient.callData.createSplit(
        splitsConfig
      );

      await walletClient.sendTransaction({
        to: address,
        account: creatorAccount,
        data,
      });
    }

    parsedPayoutRecipient = predicted.splitAddress;
  }

  console.log('parsedPayoutRecipient: ', parsedPayoutRecipient);

  try {
    // //dinamically importing the zoraprotocolConfig file, so it only runs on client:
    // const { publicClient, walletClient, chainId, creatorAccountPromise } =
    //   typeof window !== 'undefined' ? await import('./zoraprotocolConfig') : {};

    const creatorClient = createCreatorClient({ chainId, publicClient });

    const { parameters } = await creatorClient.create1155({
      // by providing a contract address, the token will be created on an existing contract
      // at that address
      contract: collectionAddress,
      token: {
        // token metadata uri
        tokenMetadataURI: tokenUri,
        // maxSupply: BigInt('18446744073709551615'),
        maxSupply: tokenEditionSize,
        mintToCreatorCount: 1,
        salesConfig: {
          //https://github.com/ourzora/zora-protocol/blob/10d3855fd05ef457c12a978d851886903cddc409/packages/protocol-sdk/src/create/types.ts#L13
          pricePerToken: parseEther(tokenPrice), // defaults to 0, type bigint
          saleStart: BigInt(0), // defaults to 0 (now), in seconds
          saleEnd: BigInt('18446744073709551615'),
          // saleEnd: parsedTokenMintingDuration, // defaults to forever, in seconds
          maxTokensPerAddress: BigInt(1), // bigint // max tokens that can be minted per address
          // currency:   //type Address, if an erc20 mint, the erc20 address.  Leave null for eth mints
        },
        payoutRecipient: parsedPayoutRecipient,
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
