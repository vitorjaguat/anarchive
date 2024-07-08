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

  useEffect(() => {
    // Check if 'token' query parameter exists
    if (router.query.token) {
      const clickedTokenData = allTokens.find(
        (token) => +token.token.tokenId === +router.query.token
      );
      setOpenTokenData(clickedTokenData);
    }
  }, [router.query, allTokens]);

  // console.log(openTokenData);

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
