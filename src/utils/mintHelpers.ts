import {
  mint,
  type MakeMintParametersArguments,
  type PrepareMintReturn,
  type MintCosts,
  type IPremintGetter,
} from '@zoralabs/protocol-sdk';
import { publicClient } from './zoraprotocolConfig';
import { createOnchainMintGetter } from './onchainMintGetter';

const mintGetter = createOnchainMintGetter(publicClient as any);

const premintGetterStub: IPremintGetter = {
  async get() {
    throw new Error('Premint is not supported in this mint flow');
  },
  async getOfCollection() {
    return {
      collection: undefined,
      premints: [],
    } as unknown as Awaited<ReturnType<IPremintGetter['getOfCollection']>>;
  },
};

export async function prepareMint1155(
  params: MakeMintParametersArguments
): Promise<PrepareMintReturn> {
  return mint({
    ...params,
    publicClient: publicClient as any,
    mintGetter,
    premintGetter: premintGetterStub,
  });
}

export async function estimateMintCosts1155(
  params: MakeMintParametersArguments
): Promise<MintCosts> {
  const { costs } = await mint({
    ...params,
    publicClient: publicClient as any,
    mintGetter,
    premintGetter: premintGetterStub,
  });

  return costs;
}
