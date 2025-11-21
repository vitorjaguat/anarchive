import { type Address } from 'viem';
import { publicClient } from './zoraprotocolConfig';
import collectionAddress from './contract';
import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';

type Creator1155ContractInfo = {
  nextTokenId: bigint;
  contractVersion: string;
  mintFee: bigint;
  contractName: string;
};

type Fallbacks = {
  contractVersion: string;
  contractName: string;
};

const FALLBACKS: Fallbacks = {
  contractVersion: 'unknown',
  contractName: 'Unknown Contract',
};

async function readOptionalFunction<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn('Optional contract read failed, using fallback:', error);
    return fallback;
  }
}

async function readRequiredFunction<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}

export async function getCreator1155ContractInfo(): Promise<Creator1155ContractInfo> {
  if (!publicClient) {
    throw new Error('publicClient is not configured');
  }

  const client = publicClient as any;
  const address = collectionAddress as Address;

  const readContractValue = async <T>(functionName: string): Promise<T> => {
    return client.readContract({
      address,
      abi: zoraCreator1155ImplABI as any,
      functionName: functionName as any,
    }) as Promise<T>;
  };

  const nextTokenId = await readRequiredFunction(() =>
    readContractValue<bigint>('nextTokenId')
  );

  const contractVersion = await readOptionalFunction(
    () => readContractValue<string>('contractVersion'),
    FALLBACKS.contractVersion
  );

  const mintFee = await readOptionalFunction(
    () => readContractValue<bigint>('mintFee'),
    BigInt(0)
  );

  const contractName = await readOptionalFunction(async () => {
    try {
      return await readContractValue<string>('contractName');
    } catch (error) {
      console.warn('contractName() unavailable, attempting name()', error);
      return await readContractValue<string>('name');
    }
  }, FALLBACKS.contractName);

  return {
    nextTokenId,
    contractVersion,
    mintFee,
    contractName,
  };
}
