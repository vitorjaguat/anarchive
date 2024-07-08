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
// const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '...',
  description: '...',
};

export default function Home({
  allTokens,
  sort,
  showMineIsChecked,
  filter,
  setFilter,
  token,
}) {
  const [openTokenData, setOpenTokenData] = useState('initial');
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  console.log('token', token);

  // syncronize the router query with the openTokenData state:
  useEffect(() => {
    // Check if 'token' query parameter exists
    console.log('router.query', router.query);
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
      console.log('openTokenData', openTokenData);
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

  return (
    <>
      <Head
        ogImage={
          token?.token?.image ||
          'https://the-anarchive.vercel.app/meta/image2.png'
        }
      />
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
    </>
  );
}

export async function getServerSideProps(context) {
  const { fragment } = context.query;
  let token = null;

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
    token = tokenData.tokens[0];
  }
  console.log('token', token);

  // If no exhibition is found, return a 404 page
  // if (!token) {
  //   return {
  //     notFound: true,
  //   };
  // }

  return {
    props: {
      token,
    },
  };
}
