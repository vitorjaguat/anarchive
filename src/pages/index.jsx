// import Image from 'next/image';
// import { Inter } from 'next/font/google';
import GraphWrapper from '../components/GraphWrapper';
import { useCallback, useState, useEffect, useContext } from 'react';
import TokenInfo from '../components/TokenInfo';
import Filters from '../components/Filters';
import Head from '../components/Headhead';
import CreateTokenButton from '../components/CreateTokenButton';
import { useRouter } from 'next/router';
import collectionAddress from '../utils/contract';
import Layout from '@/components/Layout';
import contract from '../utils/contract';
import { useIsMobile } from '@/utils/useIsMobile';
import GridViewMobile from '@/components/mobile/GridViewMobile';
import { useAccount } from 'wagmi';
import { MainContext } from '@/context/mainContext';
import GraphGridToggle from '@/components/grid/GraphGridToggle';
import Grid from '@/components/grid/Grid';

export default function Home({ allTokens, tokenDataForOG, allTags }) {
  const isMobile = useIsMobile();
  // user account states:
  const [showMineIsChecked, setShowMineIsChecked] = useState(false);
  const account = useAccount();
  const [usersFrags, setUsersFrags] = useState([]);
  console.log('Token Data for OG:', tokenDataForOG);

  // dynamic head metadata:
  // const [headTitle, setHeadTitle] = useState(
  //   tokenDataForOG?.token
  //     ? tokenDataForOG?.token?.name + ' | The Anarchiving Game'
  //     : 'The Anarchiving Game'
  // );
  const headTitle = tokenDataForOG?.token
    ? tokenDataForOG?.token?.name + ' | The Anarchiving Game'
    : 'The Anarchiving Game';
  const description =
    tokenDataForOG?.token && tokenDataForOG?.token?.description
      ? tokenDataForOG?.token?.description?.slice(0, 126) + '...'
      : "A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined.";

  // user account logic:
  useEffect(() => {
    if (account?.address && showMineIsChecked) {
      const fetchData = async () => {
        const options = {
          method: 'GET',
          headers: {
            accept: '*/*',
            'x-api-key': process.env.RESERVOIR_API_KEY,
          },
        };

        try {
          const response = await fetch(
            `https://api-zora.reservoir.tools/users/${account.address}/tokens/v10?collection=${contract}&limit=200&includeAttributes=true`,
            options
          );
          const data = await response.json();
          setUsersFrags(data.tokens);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [account.address, showMineIsChecked]);

  //filter tokens by content tag (searchbar):
  const [filter, setFilter] = useState([]);

  const { openToken, changeOpenToken, sort, changeSort, view, changeView } =
    useContext(MainContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('openToken', openToken);
  }, [openToken]);

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
        changeOpenToken(clickedTokenData);
        setHeadTitle(clickedTokenData?.token?.name + ' | The Anarchiving Game');
      }
    }
    // Optionally, handle the case where fragment is removed
    if (!router.query.fragment && openToken) {
      setHeadTitle('The Anarchiving Game');
      changeOpenToken(null);
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
                setImageLoaded={setImageLoaded}
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const options = {
      method: 'GET',
      headers: { accept: '*/*', 'x-api-key': process.env.RESERVOIR_API_KEY },
      signal: controller.signal,
    };

    try {
      const response = await fetch(
        `https://api-zora.reservoir.tools/tokens/v7?collection=${contract}&sortBy=updatedAt&limit=1000&includeAttributes=true`,
        options
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error fetching tokens:', err);
      return [];
    }
  };

  try {
    const allTokens = await fetchAllTokens();

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
