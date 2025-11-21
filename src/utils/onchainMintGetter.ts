import {
  zoraCreator1155ImplABI,
  zoraCreatorFixedPriceSaleStrategyABI,
  zoraCreatorFixedPriceSaleStrategyAddress,
  zoraTimedSaleStrategyABI,
  zoraTimedSaleStrategyAddress,
} from '@zoralabs/protocol-deployments';
import type { IOnchainMintGetter } from '@zoralabs/protocol-sdk';
import type { Address, PublicClient } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

type FixedPriceSaleStrategyResult = {
  type: 'FIXED_PRICE';
  fixedPrice: {
    address: Address;
    pricePerToken: string;
    saleEnd: string;
    saleStart: string;
    maxTokensPerAddress: string;
  };
};

type ZoraTimedMinterSaleStrategyResult = {
  type: 'ZORA_TIMED';
  zoraTimedMinter: {
    address: Address;
    mintFee: string;
    saleStart: string;
    saleEnd: string;
    erc20Z: {
      id: Address;
      pool: Address;
    };
    secondaryActivated: boolean;
    marketCountdown?: string;
    minimumMarketEth?: string;
  };
};

type SalesStrategyResult =
  | FixedPriceSaleStrategyResult
  | ZoraTimedMinterSaleStrategyResult;

type TimedSaleLegacyContractResponse = {
  erc20zAddress: Address;
  saleStart: bigint;
  poolAddress: Address;
  saleEnd: bigint;
  secondaryActivated: boolean;
};

type TimedSaleV2ContractResponse = {
  saleStart: bigint;
  marketCountdown: bigint;
  saleEnd: bigint;
  secondaryActivated: boolean;
  minimumMarketEth: bigint;
  poolAddress: Address;
  erc20zAddress: Address;
  name: string;
  symbol: string;
};

type TokenQueryResult = {
  tokenId?: string;
  creator: Address;
  uri: string;
  totalMinted: string;
  maxSupply: string;
  salesStrategies?: SalesStrategyResult[];
  tokenStandard: 'ERC1155' | 'ERC721';
  contract: {
    mintFeePerQuantity: string;
    salesStrategies: SalesStrategyResult[];
    address: Address;
    contractVersion: string;
    contractURI: string;
    name: string;
  };
};

function normalizeTokenId(tokenId?: bigint | number | string): bigint {
  if (typeof tokenId === 'bigint') {
    return tokenId;
  }

  if (typeof tokenId === 'number') {
    return BigInt(tokenId);
  }

  if (typeof tokenId === 'string') {
    return BigInt(tokenId);
  }

  throw new Error('Token ID is required for on-chain mint getter');
}

function coerceAddress(value: string): Address {
  return value as Address;
}

function hasActiveFixedPriceSale(sale: {
  saleStart: bigint;
  saleEnd: bigint;
  maxTokensPerAddress: bigint;
  pricePerToken: bigint;
  fundsRecipient: Address;
}) {
  return (
    sale.saleStart.toString() !== '0' ||
    sale.saleEnd.toString() !== '0' ||
    sale.maxTokensPerAddress.toString() !== '0' ||
    sale.pricePerToken.toString() !== '0' ||
    sale.fundsRecipient !== ZERO_ADDRESS
  );
}

function hasActiveTimedSaleLegacy(sale: TimedSaleLegacyContractResponse) {
  return (
    sale.erc20zAddress !== ZERO_ADDRESS ||
    sale.poolAddress !== ZERO_ADDRESS ||
    sale.secondaryActivated
  );
}

function hasActiveTimedSaleV2(sale: TimedSaleV2ContractResponse) {
  return (
    sale.erc20zAddress !== ZERO_ADDRESS ||
    sale.poolAddress !== ZERO_ADDRESS ||
    sale.secondaryActivated ||
    sale.minimumMarketEth !== BigInt(0)
  );
}

export function createOnchainMintGetter(
  publicClient: PublicClient
): IOnchainMintGetter {
  const chainId = publicClient.chain?.id;
  const client = publicClient as any;

  if (!chainId) {
    throw new Error('publicClient is missing chain id');
  }

  const fixedPriceStrategyAddress =
    zoraCreatorFixedPriceSaleStrategyAddress[
      chainId as keyof typeof zoraCreatorFixedPriceSaleStrategyAddress
    ];

  const timedSaleStrategyAddress =
    zoraTimedSaleStrategyAddress[
      chainId as keyof typeof zoraTimedSaleStrategyAddress
    ];

  const fixedPriceStrategyAddressTyped = fixedPriceStrategyAddress
    ? (fixedPriceStrategyAddress as Address)
    : undefined;

  const timedSaleStrategyAddressTyped = timedSaleStrategyAddress
    ? (timedSaleStrategyAddress as Address)
    : undefined;

  return {
    async getMintable({ tokenAddress, tokenId }) {
      const normalizedTokenId = normalizeTokenId(tokenId);
      const creatorContract = coerceAddress(tokenAddress);

      const [tokenInfo, contractURI, contractName, contractVersion, mintFee] =
        await Promise.all([
          client.readContract({
            address: creatorContract,
            abi: zoraCreator1155ImplABI,
            functionName: 'getTokenInfo',
            args: [normalizedTokenId],
          }) as Promise<{
            uri: string;
            maxSupply: bigint;
            totalMinted: bigint;
          }>,
          client.readContract({
            address: creatorContract,
            abi: zoraCreator1155ImplABI,
            functionName: 'contractURI',
          }) as Promise<string>,
          client.readContract({
            address: creatorContract,
            abi: zoraCreator1155ImplABI,
            functionName: 'name',
          }) as Promise<string>,
          client.readContract({
            address: creatorContract,
            abi: zoraCreator1155ImplABI,
            functionName: 'contractVersion',
          }) as Promise<string>,
          client.readContract({
            address: creatorContract,
            abi: zoraCreator1155ImplABI,
            functionName: 'mintFee',
          }) as Promise<bigint>,
        ]);

      let creatorAddress: Address | undefined;

      try {
        creatorAddress = (await client.readContract({
          address: creatorContract,
          abi: zoraCreator1155ImplABI,
          functionName: 'getCreatorRewardRecipient',
          args: [normalizedTokenId],
        })) as Address;
      } catch (error) {
        console.warn('Failed to read creator reward recipient', error);
      }

      if (!creatorAddress || creatorAddress === ZERO_ADDRESS) {
        try {
          const owner = (await client.readContract({
            address: creatorContract,
            abi: zoraCreator1155ImplABI,
            functionName: 'owner',
          })) as Address;
          creatorAddress = owner;
        } catch (error) {
          console.warn(
            'Failed to read creator owner; defaulting to zero address',
            error
          );
          creatorAddress = ZERO_ADDRESS as Address;
        }
      }

      let salesStrategies: SalesStrategyResult[] = [];

      if (fixedPriceStrategyAddressTyped) {
        try {
          const sale = (await client.readContract({
            address: fixedPriceStrategyAddressTyped,
            abi: zoraCreatorFixedPriceSaleStrategyABI,
            functionName: 'sale',
            args: [creatorContract, normalizedTokenId],
          })) as {
            saleStart: bigint;
            saleEnd: bigint;
            maxTokensPerAddress: bigint;
            pricePerToken: bigint;
            fundsRecipient: Address;
          };

          if (hasActiveFixedPriceSale(sale)) {
            salesStrategies = [
              {
                type: 'FIXED_PRICE',
                fixedPrice: {
                  address: fixedPriceStrategyAddressTyped,
                  pricePerToken: sale.pricePerToken.toString(),
                  saleEnd: sale.saleEnd.toString(),
                  saleStart: sale.saleStart.toString(),
                  maxTokensPerAddress: sale.maxTokensPerAddress.toString(),
                },
              },
            ];
          }
        } catch (error) {
          console.warn('Failed to read fixed price sale config', error);
        }
      }

      if (timedSaleStrategyAddressTyped) {
        let timedSaleLegacy: TimedSaleLegacyContractResponse | null = null;
        let timedSaleV2: TimedSaleV2ContractResponse | null = null;

        try {
          timedSaleLegacy = (await client.readContract({
            address: timedSaleStrategyAddressTyped,
            abi: zoraTimedSaleStrategyABI,
            functionName: 'sale',
            args: [creatorContract, normalizedTokenId],
          })) as TimedSaleLegacyContractResponse;
        } catch (error) {
          console.warn('Failed to read timed sale config (legacy)', error);
        }

        try {
          timedSaleV2 = (await client.readContract({
            address: timedSaleStrategyAddressTyped,
            abi: zoraTimedSaleStrategyABI,
            functionName: 'saleV2',
            args: [creatorContract, normalizedTokenId],
          })) as TimedSaleV2ContractResponse;
        } catch (error) {
          console.warn('Failed to read timed sale config (v2)', error);
        }

        const hasTimedSale = Boolean(
          (timedSaleLegacy && hasActiveTimedSaleLegacy(timedSaleLegacy)) ||
            (timedSaleV2 && hasActiveTimedSaleV2(timedSaleV2))
        );

        if (hasTimedSale) {
          const saleStart =
            timedSaleV2?.saleStart ?? timedSaleLegacy?.saleStart ?? BigInt(0);
          const saleEnd =
            timedSaleV2?.saleEnd ?? timedSaleLegacy?.saleEnd ?? BigInt(0);
          const poolAddress = (timedSaleLegacy?.poolAddress ??
            timedSaleV2?.poolAddress ??
            ZERO_ADDRESS) as Address;
          const erc20Address = (timedSaleLegacy?.erc20zAddress ??
            timedSaleV2?.erc20zAddress ??
            ZERO_ADDRESS) as Address;
          const secondaryActivated = Boolean(
            timedSaleV2?.secondaryActivated ??
              timedSaleLegacy?.secondaryActivated
          );
          const minimumMarketEth = timedSaleV2?.minimumMarketEth ?? BigInt(0);
          const minimumMarketEthRequired = secondaryActivated
            ? BigInt(0)
            : minimumMarketEth;
          const effectiveMintFee = mintFee + minimumMarketEthRequired;

          salesStrategies = [
            ...salesStrategies,
            {
              type: 'ZORA_TIMED',
              zoraTimedMinter: {
                address: timedSaleStrategyAddressTyped,
                mintFee: effectiveMintFee.toString(),
                saleStart: saleStart.toString(),
                saleEnd: saleEnd.toString(),
                erc20Z: {
                  id: erc20Address,
                  pool: poolAddress,
                },
                secondaryActivated,
                marketCountdown: timedSaleV2
                  ? timedSaleV2.marketCountdown.toString()
                  : undefined,
                minimumMarketEth: minimumMarketEth.toString(),
              },
            },
          ];
        }
      }

      const tokenQueryResult: TokenQueryResult = {
        tokenId: normalizedTokenId.toString(),
        creator: creatorAddress,
        uri: tokenInfo.uri,
        totalMinted: tokenInfo.totalMinted.toString(),
        maxSupply: tokenInfo.maxSupply.toString(),
        salesStrategies,
        tokenStandard: 'ERC1155',
        contract: {
          mintFeePerQuantity: mintFee.toString(),
          salesStrategies,
          address: creatorContract,
          contractVersion,
          contractURI,
          name: contractName,
        },
      };

      return tokenQueryResult as unknown as Awaited<
        ReturnType<IOnchainMintGetter['getMintable']>
      >;
    },
    async getContractMintable() {
      return [];
    },
    async getContractPremintTokenIds() {
      return [];
    },
  } satisfies IOnchainMintGetter;
}
