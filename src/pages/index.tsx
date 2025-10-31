import GraphWrapper from '../components/GraphWrapper';
import { useState, useEffect, useContext } from 'react';
import TokenInfo from '../components/TokenInfo';
import Filters from '../components/Filters';
import Head from '../components/Headhead';
import CreateTokenButton from '../components/CreateTokenButton';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import contract from '../utils/contract';
// import contract from '../utils/dummyCollectionAddress';
import { useIsMobile } from '@/utils/useIsMobile';
import GridViewMobile from '@/components/mobile/GridViewMobile';
import { useAccount } from 'wagmi';
import { MainContext } from '@/context/mainContext';
import GraphGridToggle from '@/components/grid/GraphGridToggle';
import Grid from '@/components/grid/Grid';
import { publicClient } from '@/utils/zoraprotocolConfig';
import {
  Alchemy,
  Network,
  type Nft,
  type NftContractNftsResponse,
} from 'alchemy-sdk';
import type { Address } from 'viem';
import type { Token, TokenAttribute } from '../../types/tokens';

const CONTRACT_ADDRESS = contract as Address;

const ZORA_CREATOR_1155_ABI = [
  {
    type: 'function',
    name: 'getTokenInfo',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    outputs: [
      {
        name: '',
        internalType: 'struct IZoraCreator1155TypesV1.TokenData',
        type: 'tuple',
        components: [
          { name: 'uri', internalType: 'string', type: 'string' },
          { name: 'maxSupply', internalType: 'uint256', type: 'uint256' },
          { name: 'totalMinted', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

const MULTICALL_CHUNK_SIZE = 200;
const REVALIDATE_SECONDS = 60;

type HomeProps = {
  allTokens: Token[];
  tokenDataForOG: Token | null;
  allTags: string[];
};

type TokenInfoOnChain = {
  uri: string;
  maxSupply: bigint;
  totalMinted: bigint;
};

type MulticallResult =
  | { status: 'success'; result: TokenInfoOnChain }
  | { status: 'failure'; error: unknown };

const normalizeTokenId = (tokenId: string): string => {
  try {
    return BigInt(tokenId).toString();
  } catch (error) {
    console.warn(`Failed to normalize tokenId ${tokenId}:`, error);
    return tokenId;
  }
};

const fetchOnChainTokenData = async (tokenIds: string[]) => {
  const totals = new Map<string, { totalMinted: bigint; maxSupply: bigint }>();
  const normalizedIds = Array.from(new Set(tokenIds.map(normalizeTokenId)));

  if (!normalizedIds.length) {
    return totals;
  }

  for (let i = 0; i < normalizedIds.length; i += MULTICALL_CHUNK_SIZE) {
    const chunkIds = normalizedIds.slice(i, i + MULTICALL_CHUNK_SIZE);

    const multicallResults = (await (publicClient as any).multicall({
      allowFailure: true,
      contracts: chunkIds.map((id) => ({
        address: CONTRACT_ADDRESS,
        abi: ZORA_CREATOR_1155_ABI,
        functionName: 'getTokenInfo',
        args: [BigInt(id)],
      })),
      authorizationList: undefined,
    })) as MulticallResult[];

    multicallResults.forEach((entry, index) => {
      const tokenId = chunkIds[index];

      if (entry.status === 'success') {
        const tokenInfo = entry.result as TokenInfoOnChain;
        totals.set(tokenId, {
          maxSupply: tokenInfo.maxSupply,
          totalMinted: tokenInfo.totalMinted,
        });
      } else {
        console.warn(`Multicall failed for token ${tokenId}`, entry.error);
      }
    });
  }

  return totals;
};

export default function Home({
  allTokens,
  tokenDataForOG,
  allTags,
}: HomeProps) {
  const isMobile = useIsMobile();
  // user account states:
  const [showMineIsChecked, setShowMineIsChecked] = useState(false);
  const account = useAccount();
  const [usersFrags, setUsersFrags] = useState<Token[]>([]);
  // console.dir[allTokens];

  // dynamic head metadata:
  const [headTitle, setHeadTitle] = useState(
    tokenDataForOG?.token
      ? tokenDataForOG?.token?.name + ' | The Anarchiving Game'
      : 'The Anarchiving Game'
  );

  const description =
    tokenDataForOG?.token && tokenDataForOG?.token?.description
      ? tokenDataForOG?.token?.description?.slice(0, 126) + '...'
      : "A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined.";

  // user account logic:
  useEffect(() => {
    if (account?.address && showMineIsChecked) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `/api/user-tokens?address=${account.address}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const tokenIds = await response.json();

          const userTokens = allTokens.filter((token) =>
            tokenIds.includes(token.token.tokenId)
          );

          setUsersFrags(userTokens);
        } catch (err) {
          console.error('Error fetching user tokens: ', err);
          setUsersFrags([]);
        }
      };

      fetchData();
    } else {
      setUsersFrags([]);
    }
  }, [account.address, showMineIsChecked, allTokens]);

  //filter tokens by content tag (searchbar):
  const [filter, setFilter] = useState([]);

  const { openToken, changeOpenToken, sort, changeSort, view, changeView } =
    useContext(MainContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  // syncronize the router query with the openTokenData state:
  useEffect(() => {
    if (router.query.fragment) {
      const clickedTokenData = allTokens.find(
        (token) => +token.token.tokenId === +router.query.fragment
      );
      // Only update if different
      if (
        clickedTokenData &&
        (!openToken ||
          clickedTokenData.token.tokenId !== openToken?.token?.tokenId)
      ) {
        setHeadTitle(clickedTokenData?.token?.name + ' | The Anarchiving Game');
        changeOpenToken(clickedTokenData);
      }
    }
    // Optionally, handle the case where fragment is removed
    if (!router.query.fragment && openToken) {
      setHeadTitle('The Anarchiving Game');
      changeOpenToken(null);
    }

    if (!router.query.fragment && !openToken) {
      setHeadTitle('The Anarchiving Game');
    }
    // eslint-disable-next-line
  }, [router.query.fragment, allTokens]);

  return (
    <>
      <Head
        ogImage={
          tokenDataForOG?.token?.image ||
          'https://the-anarchive.vercel.app/meta/ogImage2025.jpg'
        }
        title={headTitle}
        description={description}
        canonicalUrl={
          router.query.fragment ? `/?fragment=${router.query.fragment}` : '/'
        }
      />
      <Layout
        setShowMineIsChecked={setShowMineIsChecked}
        showMineIsChecked={showMineIsChecked}
        allTokens={allTokens}
        allTags={allTags}
        changeSort={changeSort}
        sort={sort}
        setFilter={setFilter}
        filter={filter}
      >
        {/* MOBILE */}
        {isMobile && (
          <GridViewMobile
            allTokens={allTokens}
            showMineIsChecked={showMineIsChecked}
            usersFrags={usersFrags}
          />
        )}

        {/* DESKTOP */}
        {!isMobile && (
          <div
            className={`relative bg-[#000012] flex min-h-screen flex-col items-center justify-between max-h-screen overflow-hidden`}
          >
            {/* BG */}
            <div className='site-background'>
              <div className='star-container'>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>

            <Filters filter={filter} setFilter={setFilter} />

            <TokenInfo
              setImageLoaded={setImageLoaded}
              imageLoaded={imageLoaded}
            />

            {view === 'graph' && (
              <GraphWrapper
                allTokens={allTokens}
                sort={sort}
                filter={filter}
                showMineIsChecked={showMineIsChecked}
                setImageLoaded={setImageLoaded}
                usersFrags={usersFrags}
              />
            )}

            {view === 'grid' && (
              <Grid
                allTokens={allTokens}
                sort={sort}
                filter={filter}
                showMineIsChecked={showMineIsChecked}
                usersFrags={usersFrags}
              />
            )}

            <CreateTokenButton />
            <GraphGridToggle view={view} changeView={changeView} />
          </div>
        )}
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const fetchAllTokens = async () => {
    const getAllTokensFromAlchemy = async (): Promise<Nft[]> => {
      const alchemy = new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.ZORA_MAINNET,
      });

      const results: Nft[] = [];
      let pageKey: string | undefined;

      do {
        const resp: NftContractNftsResponse =
          await alchemy.nft.getNftsForContract(contract, {
            pageKey,
            pageSize: 100,
          });
        results.push(...resp.nfts);
        pageKey = (resp as { pageKey?: string }).pageKey;
      } while (pageKey);

      return results;
    };

    const allTokensFromAlchemy = await getAllTokensFromAlchemy();
    const onChainTotals = await fetchOnChainTokenData(
      allTokensFromAlchemy.map((token) => token.tokenId)
    );

    const allTokensTyped: Token[] = allTokensFromAlchemy.map((token) => {
      const tokenIdKey = normalizeTokenId(token.tokenId);
      const onChainData = onChainTotals.get(tokenIdKey);
      const rawMetadata = token.raw.metadata as
        | {
            description?: string;
            animation_url?: string;
            attributes?: Array<{ trait_type?: string; value?: string }>;
          }
        | undefined;
      const attributesSource = Array.isArray(rawMetadata?.attributes)
        ? rawMetadata?.attributes
        : [];
      const attributes: TokenAttribute[] = attributesSource
        .filter(
          (attribute): attribute is { trait_type: string; value: string } =>
            Boolean(attribute?.trait_type) && Boolean(attribute?.value)
        )
        .map((attribute) => ({
          key: attribute.trait_type,
          value: attribute.value,
        }));

      const animationUrl = rawMetadata?.animation_url;

      return {
        token: {
          totalMinted: (onChainData?.totalMinted ?? BigInt(0)).toString(),
          maxSupply: (onChainData?.maxSupply ?? BigInt(0)).toString(),
          contract: token.contract.address,
          tokenId: tokenIdKey,
          name: token.name,
          description: token.description ?? rawMetadata?.description ?? null,
          image: token.image?.cachedUrl ?? null,
          imageSmall: token.image?.thumbnailUrl ?? null,
          imageLarge: token.image?.pngUrl ?? token.image?.originalUrl ?? null,
          imageOriginal: token.image?.originalUrl ?? null,
          kind: token.contract.tokenType as string,
          attributes,
          owners: [],
          media:
            token.animation?.cachedUrl ??
            token.animation?.originalUrl ??
            animationUrl ??
            null,
          mediaMimeType: token.animation?.contentType ?? null,
        },
      };
    });

    return allTokensTyped;
  };

  try {
    const allTokens = await fetchAllTokens();

    const allTagsSet = new Set<string>();
    allTokens.forEach((token) => {
      const tagsString = token.token?.attributes?.find(
        (attr) => attr?.key === 'Tags' || attr?.key === 'Content Tags'
      )?.value;
      if (!tagsString) return;
      const tagsArray = tagsString.split(',');
      tagsArray.forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed.length === 0) return;
        allTagsSet.add(trimmed.toLowerCase());
      });
    });
    const allTags = Array.from(allTagsSet).sort();

    return {
      props: {
        tokenDataForOG: null,
        allTokens,
        allTags,
      },
      revalidate: REVALIDATE_SECONDS,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        tokenDataForOG: null,
        allTokens: [],
        allTags: [],
      },
      revalidate: REVALIDATE_SECONDS,
    };
  }
};
