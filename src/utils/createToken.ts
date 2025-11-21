import { createNew1155Token } from '@zoralabs/protocol-sdk';
import {
  publicClient,
  walletClient,
  chainId,
  creatorAccountPromise,
  chain,
} from './zoraprotocolConfig';
// import collectionAddress from './dummyCollectionAddress';
import collectionAddress from './contract';
import { isAddress, parseEther } from 'viem';
import { SplitV1Client } from '@0xsplits/splits-sdk';

const TOKEN_ID_RETRY_LIMIT = 1;
const TOKEN_ID_RETRY_DELAY_MS = 500;

type CreatorContractInfo = {
  nextTokenId: bigint;
  contractVersion: string;
  mintFee: bigint;
  contractName: string;
};

async function fetchCreatorContractInfo(): Promise<CreatorContractInfo> {
  const response = await fetch('/api/creator-contract-info');

  if (!response.ok) {
    throw new Error('Failed to fetch creator contract info');
  }

  const data = (await response.json()) as {
    nextTokenId: string;
    contractVersion: string;
    mintFee: string;
    contractName: string;
  };

  return {
    nextTokenId: BigInt(data.nextTokenId),
    contractVersion: data.contractVersion,
    mintFee: BigInt(data.mintFee),
    contractName: data.contractName,
  };
}

function createContractGetter(info: CreatorContractInfo) {
  return {
    async getContractInfo(_: { contractAddress: string; retries?: number }) {
      return {
        name: info.contractName,
        contractVersion: info.contractVersion,
        nextTokenId: info.nextTokenId,
        mintFee: info.mintFee,
      };
    },
  };
}

const isTokenIdMismatchError = (error: unknown) => {
  if (!error) return false;
  const message =
    (
      error as {
        cause?: { message?: string; shortMessage?: string };
        message?: string;
      }
    ).cause?.message ??
    (error as { cause?: { shortMessage?: string }; message?: string }).cause
      ?.shortMessage ??
    (error as { message?: string }).message ??
    '';
  return message.includes('TokenIdMismatch');
};

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default async function createToken(
  tokenUri,
  tokenPrice,
  tokenMintingDuration,
  tokenPayoutRecipient,
  tokenEditionSize
) {
  // parsing tokenMintingDuration:
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
  // console.log('parsedTokenMintingDuration: ', parsedTokenMintingDuration);

  // managing payoutRecipient:
  let parsedPayoutRecipient;
  const creatorAccount = await creatorAccountPromise;
  if (tokenPayoutRecipient === 'me') {
    parsedPayoutRecipient = creatorAccount;
  } else if (isAddress(tokenPayoutRecipient)) {
    parsedPayoutRecipient = tokenPayoutRecipient;
  } else if (Array.isArray(tokenPayoutRecipient)) {
    // case split
    console.log('setting up split');
    // https://docs.zora.co/protocol-sdk/creator/splits
    // setup a splits client
    const splitsClient = new SplitV1Client({
      chainId,
      publicClient: publicClient as any, // Type assertion for compatibility
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
      distributorFeePercent: 2,
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

      await (walletClient as any).sendTransaction({
        to: address,
        account: creatorAccount,
        data,
      });
    }

    parsedPayoutRecipient = predicted.splitAddress;
  } else {
    parsedPayoutRecipient = creatorAccount; // default to creator account
  }

  // console.log('parsedPayoutRecipient: ', parsedPayoutRecipient);

  let attempt = 0;

  while (attempt <= TOKEN_ID_RETRY_LIMIT) {
    try {
      const contractInfo = await fetchCreatorContractInfo();
      const contractGetter = createContractGetter(contractInfo);

      const { parameters } = await createNew1155Token({
        contractAddress: collectionAddress,
        chainId: chain.id,
        token: {
          tokenMetadataURI: tokenUri,
          maxSupply: tokenEditionSize,
          mintToCreatorCount: 1,
          salesConfig: {
            type: 'fixedPrice',
            pricePerToken: parseEther(tokenPrice),
            saleStart: BigInt(0),
            saleEnd: BigInt('18446744073709551615'),
            maxTokensPerAddress: BigInt('18446744073709551615'),
          },
          payoutRecipient: parsedPayoutRecipient,
        },
        account: creatorAccount,
        contractGetter,
      });

      const { request } = await publicClient.simulateContract(parameters);
      const hash = await walletClient.writeContract(request);
      const writeResponse = await publicClient.waitForTransactionReceipt({
        hash,
      });

      return { parameters, request, hash, writeResponse };
    } catch (error) {
      if (isTokenIdMismatchError(error) && attempt < TOKEN_ID_RETRY_LIMIT) {
        console.warn(
          'TokenId mismatch detected. Retrying with fresh contract info.'
        );
        attempt += 1;
        await wait(TOKEN_ID_RETRY_DELAY_MS);
        continue;
      }

      console.error('Error in createToken.js:', error);
      return { error };
    }
  }

  return { error: new Error('Failed to create token after retries') };
}
