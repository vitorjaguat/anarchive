import GraphWrapper from '../components/GraphWrapper';
import { useState, useEffect, useContext } from 'react';
import TokenInfo from '../components/TokenInfo';
import Filters from '../components/Filters';
import Head from '../components/Headhead';
import CreateTokenButton from '../components/CreateTokenButton';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import contract from '../utils/contract';
// import contract from '../utils/dummyCollectionAddress';
import { useIsMobile } from '@/utils/useIsMobile';
import GridViewMobile from '@/components/mobile/GridViewMobile';
import { MainContext } from '@/context/mainContext';
import GraphGridToggle from '@/components/grid/GraphGridToggle';
import Grid from '@/components/grid/Grid';
import { publicClient } from '@/utils/zoraprotocolConfig';
import dynamic from 'next/dynamic';
import {
  Alchemy,
  Network,
  type Nft,
  type NftContractNftsResponse,
} from 'alchemy-sdk';
import type { Address } from 'viem';
import type { Token, TokenAttribute } from '../../types/tokens';

const AccountTokenSync = dynamic(
  () => import('@/components/AccountTokenSync'),
  { ssr: false }
);

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
const DEFAULT_TITLE = 'The Anarchiving Game';
const DEFAULT_DESCRIPTION =
  "A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined.";
const DEFAULT_OG_IMAGE =
  'https://anarchiving.thesphere.as/meta/ogImage2025.jpg';

type OgMeta = {
  title: string;
  description: string;
  ogImage: string;
  canonicalUrl: string;
};

type HomeProps = {
  allTokens: Token[];
  tokenDataForOG: Token | null;
  allTags: string[];
  ogMeta: OgMeta;
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
  ogMeta,
}: HomeProps) {
  const isMobile = useIsMobile();
  // user account states:
  const [showMineIsChecked, setShowMineIsChecked] = useState(false);
  const [usersFrags, setUsersFrags] = useState<Token[]>([]);
  // dynamic head metadata:
  const [headTitle, setHeadTitle] = useState(ogMeta.title);
  const [metaDescription, setMetaDescription] = useState(ogMeta.description);
  const [headOgImage, setHeadOgImage] = useState(ogMeta.ogImage);
  const [headCanonical, setHeadCanonical] = useState(ogMeta.canonicalUrl);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // user account logic:
  //filter tokens by content tag (searchbar):
  const [filter, setFilter] = useState([]);

  const { openToken, changeOpenToken, sort, changeSort, view, changeView } =
    useContext(MainContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  // syncronize the router query with the openTokenData state:
  useEffect(() => {
    const fragmentParam = router.query.fragment;
    const fragmentId = Array.isArray(fragmentParam)
      ? fragmentParam[0]
      : fragmentParam;

    if (fragmentId) {
      const clickedTokenData = allTokens.find(
        (token) => token.token.tokenId === fragmentId
      );
      if (
        clickedTokenData &&
        (!openToken ||
          clickedTokenData.token.tokenId !== openToken?.token?.tokenId)
      ) {
        const nextTitle = clickedTokenData.token.name
          ? `${clickedTokenData.token.name} | ${DEFAULT_TITLE}`
          : DEFAULT_TITLE;
        const nextDescription = clickedTokenData.token.description
          ? `${clickedTokenData.token.description.slice(0, 126)}...`
          : DEFAULT_DESCRIPTION;
        setHeadTitle(nextTitle);
        setMetaDescription(nextDescription);
        setHeadOgImage(clickedTokenData.token.image || DEFAULT_OG_IMAGE);
        setHeadCanonical(`/?fragment=${fragmentId}`);
        changeOpenToken(clickedTokenData);
      }
    } else {
      if (openToken) {
        changeOpenToken(null);
      }
      setHeadTitle(DEFAULT_TITLE);
      setMetaDescription(DEFAULT_DESCRIPTION);
      setHeadOgImage(DEFAULT_OG_IMAGE);
      setHeadCanonical('/');
    }
    // eslint-disable-next-line
  }, [router.query.fragment, allTokens]);

  return (
    <>
      <AccountTokenSync
        showMineIsChecked={showMineIsChecked}
        allTokens={allTokens}
        setUsersFrags={setUsersFrags}
      />
      {isClient && (
        <Head
          key={
            typeof router.query.fragment === 'string'
              ? router.query.fragment
              : 'home'
          }
          ogImage={headOgImage}
          title={headTitle}
          description={metaDescription}
          canonicalUrl={headCanonical}
        />
      )}
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

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
) => {
  const { query } = context;
  const fragmentId = Array.isArray(query.fragment)
    ? query.fragment[0]
    : query.fragment;

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

    // Find the specific token for OG metadata if fragmentId is provided
    let tokenDataForOG = null;
    if (fragmentId) {
      tokenDataForOG =
        allTokens.find((token) => token.token.tokenId === fragmentId) || null;
    }

    const ogTitle = tokenDataForOG?.token?.name
      ? `${tokenDataForOG.token.name} | ${DEFAULT_TITLE}`
      : DEFAULT_TITLE;
    const ogDescription = tokenDataForOG?.token?.description
      ? `${tokenDataForOG.token.description.slice(0, 126)}...`
      : DEFAULT_DESCRIPTION;
    const ogImage = tokenDataForOG?.token?.image || DEFAULT_OG_IMAGE;
    const canonicalUrl = fragmentId ? `/?fragment=${fragmentId}` : '/';

    return {
      props: {
        tokenDataForOG,
        allTokens,
        allTags,
        ogMeta: {
          title: ogTitle,
          description: ogDescription,
          ogImage,
          canonicalUrl,
        },
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        tokenDataForOG: null,
        allTokens: [],
        allTags: [],
        ogMeta: {
          title: DEFAULT_TITLE,
          description: DEFAULT_DESCRIPTION,
          ogImage: DEFAULT_OG_IMAGE,
          canonicalUrl: '/',
        },
      },
    };
  }
};
