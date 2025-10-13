import GraphWrapper from '../components/GraphWrapper';
import { useState, useEffect, useContext } from 'react';
import TokenInfo from '../components/TokenInfo';
import Filters from '../components/Filters';
import Head from '../components/Headhead';
import CreateTokenButton from '../components/CreateTokenButton';
import { useRouter } from 'next/router';
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
import { getTokensOfContract } from '@zoralabs/protocol-sdk';
import {
  Alchemy,
  Network,
  type Nft,
  type NftContractNftsResponse,
} from 'alchemy-sdk';
import type { Token, TokenAttribute } from '../../types/tokens';

export default function Home({ allTokens, tokenDataForOG, allTags }) {
  const isMobile = useIsMobile();
  // user account states:
  const [showMineIsChecked, setShowMineIsChecked] = useState(false);
  const account = useAccount();
  const [usersFrags, setUsersFrags] = useState([]);
  console.dir[allTokens];

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
  }, [account.address, showMineIsChecked]);

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

export async function getServerSideProps(context) {
  const fetchAllTokens = async () => {
    // Get tokenMetadata and cache images from Alchemy SDK (handle pagination)
    const getAllTokensFromAlchemy = async (): Promise<Nft[]> => {
      const alchemy = new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.ZORA_MAINNET,
      });

      const results: Nft[] = [];
      let pageKey: string | undefined = undefined;

      do {
        const resp: NftContractNftsResponse =
          await alchemy.nft.getNftsForContract(contract, {
            pageKey,
            pageSize: 100, // max per page
          });
        results.push(...resp.nfts);
        pageKey = (resp as any).pageKey; // SDK returns pageKey when more pages exist
      } while (pageKey);

      return results;
    };

    const allTokensFromAlchemy: Nft[] = await getAllTokensFromAlchemy();

    // Get totalMinted and maxSupply from Zora Protocol SDK:
    const totalMintedDataRaw = await getTokensOfContract({
      tokenContract: contract,
      publicClient,
    });

    const tokenLookup = new Map(
      totalMintedDataRaw.tokens.map((t) => [
        t.token.tokenURI,
        {
          totalMinted: BigInt(t.token.totalMinted),
          maxSupply: BigInt(t.token.maxSupply),
        },
      ])
    );

    const allTokensTyped: Token[] = allTokensFromAlchemy.map((token) => {
      const zoraData = tokenLookup.get(token.raw.tokenUri);
      return {
        token: {
          totalMinted: (zoraData?.totalMinted || BigInt(0)).toString(),
          maxSupply: (zoraData?.maxSupply || BigInt(0)).toString(),
          contract: token.contract.address,
          tokenId: token.tokenId,
          name: token.name,
          description:
            token.description ?? token.raw.metadata.description ?? null,
          image: token.image.cachedUrl,
          imageSmall: token.image.thumbnailUrl ?? null,
          imageLarge: token.image.pngUrl ?? token.image.originalUrl ?? null,
          imageOriginal: token.image.originalUrl,
          kind: token.contract.tokenType as string,
          attributes: token.raw.metadata.attributes.map((attribute) => ({
            key: attribute.trait_type as string,
            value: attribute.value as string,
          })) as TokenAttribute[],
          owners: [],
          media:
            token.animation.cachedUrl ??
            token.animation.originalUrl ??
            token.raw.metadata.animation_url ??
            null,
          mediaMimeType: token.animation.contentType ?? null,
        },
      };
    });

    return allTokensTyped;
  };

  try {
    const allTokens = await fetchAllTokens();
    // console.dir(allTokens, { depth: null });

    // Process tags
    const allTagsSet = new Set();
    allTokens.forEach((token) => {
      const tagsString = token.token?.attributes?.find(
        (attr) => attr?.key === 'Tags' || attr?.key === 'Content Tags'
      )?.value;
      if (!tagsString) return;
      const tagsArray = tagsString ? tagsString.split(', ') : [];
      tagsArray.forEach((tag) => {
        if (tag.length === 0) return;
        allTagsSet.add(tag.toLowerCase());
      });
    });
    const allTags = Array.from(allTagsSet).sort();

    // Find token for OG data - NO ADDITIONAL FETCH NEEDED
    const { fragment } = context.query;
    let tokenDataForOG = null;

    if (fragment) {
      tokenDataForOG = allTokens.find(
        (token) => String(token.token.tokenId) === String(fragment)
      );
    }

    return {
      props: {
        tokenDataForOG: tokenDataForOG || null,
        allTokens,
        allTags,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        tokenDataForOG: null,
        allTokens: [],
        allTags: [],
      },
    };
  }
}
