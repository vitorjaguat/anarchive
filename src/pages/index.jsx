import Image from 'next/image';
import { Inter } from 'next/font/google';
import GraphWrapper from '../components/GraphWrapper';
import { useCallback, useState } from 'react';
import TokenInfo from '../components/TokenInfo';
import { AnimatePresence } from 'framer-motion';

// const inter = Inter({ subsets: ['latin'] });

export default function Home({ tokens }) {
  const [openTokenData, setOpenTokenData] = useState('initial');
  console.log(openTokenData);

  const handleClickOverlay = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenTokenData(null);
  }, []);

  //single token view:
  console.log('openTokenData', openTokenData);

  return (
    <main
      className={`relative bg-[#000012] flex min-h-screen flex-col items-center justify-between max-h-screen overflow-hidden`}
    >
      <AnimatePresence>
        {openTokenData && openTokenData !== 'initial' && (
          <TokenInfo
            openTokenData={openTokenData}
            handleClickOverlay={handleClickOverlay}
          />
        )}
      </AnimatePresence>
      <GraphWrapper
        tokens={tokens}
        openTokenData={openTokenData}
        setOpenTokenData={setOpenTokenData}
      />
    </main>
  );
}
