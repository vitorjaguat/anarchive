// import Image from 'next/image';
// import { Inter } from 'next/font/google';
import GraphWrapper from '../components/GraphWrapper';
import { useCallback, useState, useEffect } from 'react';
import TokenInfo from '../components/TokenInfo';
import Filters from '../components/Filters';
import Head from '../components/Headhead';
import CreateTokenButton from '../components/CreateTokenButton';
import { useRouter } from 'next/router';
import collectionAddress from '../utils/contract';
import Layout from '@/components/Layout';
import contract from '../utils/contract';

export default function Home({ allTokens, tokenDataForOG }) {
  //fetch collection tokens: ok from getServerSideProps!

  // sorting tokens:
  const [sort, setSort] = useState('From');
  const [showMineIsChecked, setShowMineIsChecked] = useState(false);

  //filter tokens by content tag (searchbar):
  const [filter, setFilter] = useState([]);

  const [openTokenData, setOpenTokenData] = useState('initial');
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  // console.log('tokenDataForOG', tokenDataForOG);

  // syncronize the router query with the openTokenData state:
  useEffect(() => {
    // Check if 'token' query parameter exists
    // console.log('router.query', router.query);
    if (router.query.fragment) {
      const clickedTokenData = allTokens.find(
        (token) => +token.token.tokenId === +router.query.fragment
      );
      setOpenTokenData(clickedTokenData);
    }
  }, [router.query, allTokens]);

  // Update the URL query parameter when the openTokenData state changes:
  useEffect(() => {
    // Check if openTokenData exists and has a token property
    if (openTokenData && openTokenData.token) {
      // Update the URL without refreshing the page
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, fragment: openTokenData.token.tokenId },
        },
        undefined,
        { shallow: true }
      );
      // console.log('openTokenData', openTokenData);
    } else {
      // Remove the fragment query parameter
      const newQuery = { ...router.query };
      delete newQuery.fragment;
      router.push(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [openTokenData?.token?.tokenId]);

  const handleClickOverlay = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenTokenData(null);
  }, []);

  //single token view:
  // console.log('openTokenData', openTokenData);
  // console.log('projectId', process.env.WALLET_CONNECT_PROJECT_ID);

  // dynamic metadata:
  const title = tokenDataForOG?.token
    ? tokenDataForOG?.token?.name + ' | The Anarchiving Game'
    : 'The Anarchiving Game';
  const description =
    tokenDataForOG?.token && tokenDataForOG?.token?.description
      ? tokenDataForOG?.token?.description?.slice(0, 126) + '...'
      : "A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined.";

  return (
    <>
      <Head
        ogImage={
          tokenDataForOG?.token?.image ||
          'https://the-anarchive.vercel.app/meta/image2.png'
        }
        title={title}
        description={description}
      />
      <Layout
        setShowMineIsChecked={setShowMineIsChecked}
        showMineIsChecked={showMineIsChecked}
        allTokens={allTokens}
        setSort={setSort}
        sort={sort}
        setFilter={setFilter}
        filter={filter}
      >
        <main
          className={`relative bg-[#000012] flex min-h-screen flex-col items-center justify-between max-h-screen overflow-hidden`}
        >
          <Filters filter={filter} setFilter={setFilter} />

          <TokenInfo
            openTokenData={openTokenData}
            handleClickOverlay={handleClickOverlay}
            setImageLoaded={setImageLoaded}
            imageLoaded={imageLoaded}
            setOpenTokenData={setOpenTokenData}
          />

          <GraphWrapper
            allTokens={allTokens}
            openTokenData={openTokenData}
            setOpenTokenData={setOpenTokenData}
            sort={sort}
            filter={filter}
            showMineIsChecked={showMineIsChecked}
            setImageLoaded={setImageLoaded}
          />

          <CreateTokenButton />
        </main>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  ////////// fetch all tokens:
  const fetchAllTokens = async () => {
    const options = {
      method: 'GET',
      headers: { accept: '*/*', 'x-api-key': process.env.RESERVOIR_API_KEY },
    };

    try {
      const response = await fetch(
        `https://api-zora.reservoir.tools/tokens/v7?collection=${contract}&sortBy=updatedAt&limit=1000&includeAttributes=true`,
        options
      );
      const data = await response.json();
      console.log(data.tokens);
      return data.tokens;
    } catch (err) {
      console.error(err);
    }
  };

  const allTokens = await fetchAllTokens();

  ////////// manage the query parameter 'fragment':
  const { fragment } = context.query;
  let tokenDataForOG = null;

  // Fetch data based on the query parameter
  const fetchData = async () => {
    const options = {
      method: 'GET',
      headers: { accept: '*/*', 'x-api-key': process.env.RESERVOIR_API_KEY },
    };

    try {
      const response = await fetch(
        `https://api-zora.reservoir.tools/tokens/v6?tokens=${collectionAddress}%3A${fragment}`,
        options
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  };
  if (fragment) {
    const tokenData = await fetchData();
    tokenDataForOG = tokenData.tokens[0];
  }
  // console.log('token', tokenDataForOG);

  // If no exhibition is found, return a 404 page
  // if (!token) {
  //   return {
  //     notFound: true,
  //   };
  // }

  return {
    props: {
      tokenDataForOG,
      allTokens,
    },
  };
}
