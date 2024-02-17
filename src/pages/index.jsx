import Image from 'next/image';
import { Inter } from 'next/font/google';
import GraphWrapper from '../components/GraphWrapper';
import { useCallback, useState } from 'react';

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
        <div
          className='absolute top-0 left-0 w-screen h-screen bg-gray-600/40 flex items-center justify-center z-[1000]'
          onClick={handleClickOverlay}
        >
          <div className='bg-slate-700 p-6 rounded-md'>
            <div className='flex justify-between gap-4'>
              <div className='flex flex-col gap-4'>
                <img
                  src={openTokenData.token.image}
                  alt={openTokenData.token.name}
                  width={200}
                  height={200}
                />
                <div className=''>
                  {openTokenData.token.attributes.map((att) => (
                    <div key={att.key} className='text-sm'>
                      <span className='font-bold'>{att.key}:</span> {att.value}
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex h-full flex-col gap-1'>
                <div className=''>{openTokenData.token.name}</div>
                <div className='text-sm'>
                  Created by{' '}
                  <span className='font-bold'>
                    {
                      openTokenData.token.attributes.find(
                        (att) => att.key === 'Creator'
                      ).value
                    }
                  </span>
                </div>
                <div className='text-sm font-light'>
                  {openTokenData.token.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <GraphWrapper
        openTokenData={openTokenData}
        setOpenTokenData={setOpenTokenData}
      />
    </main>
  );
}
