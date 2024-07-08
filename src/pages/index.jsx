// import Image from 'next/image';
// import { Inter } from 'next/font/google';
import GraphWrapper from '../components/GraphWrapper';
import { useCallback, useState, useEffect } from 'react';
import TokenInfo from '../components/TokenInfo';
import Filters from '../components/Filters';
import Head from '../components/Headhead';
import CreateTokenButton from '../components/CreateTokenButton';
import { useRouter } from 'next/router';

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
}) {
  const [openTokenData, setOpenTokenData] = useState('initial');
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

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
      <Head />
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
