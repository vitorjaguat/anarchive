import Image from 'next/image';
import { Inter } from 'next/font/google';
import GraphWrapper from '../components/GraphWrapper';
import { useCallback, useState } from 'react';
import TokenInfo from '../components/TokenInfo';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
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
      className={`relative bg-gray-600 flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      {openTokenData && openTokenData !== 'initial' && (
        <TokenInfo
          openTokenData={openTokenData}
          handleClickOverlay={handleClickOverlay}
        />
      )}
      <GraphWrapper
        openTokenData={openTokenData}
        setOpenTokenData={setOpenTokenData}
      />
    </main>
  );
}
