import Image from 'next/image';
import type { Token } from '../../../types/tokens';
import { useContext } from 'react';
import { MainContext } from '@/context/mainContext';
import { GoPlusCircle } from 'react-icons/go';
import { useRouter } from 'next/router';
import Markdown from 'react-markdown';
import Mint from '../Mint';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import CollectModal from '../CollectModal';

export default function GridViewItemMobile({ token }: { token: Token }) {
  const { changeOpenToken } = useContext(MainContext);
  const { address } = useAccount();
  const [openCollect, setOpenCollect] = useState(false);

  const router = useRouter();

  const handleClick = (e) => {
    e.stopPropagation();
    changeOpenToken(token);
    // Check if openTokenData exists and has a token property
    if (token.token.tokenId) {
      // Update the URL without refreshing the page
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, fragment: token.token.tokenId },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  if (!token?.token?.tokenId) return null;

  if (token.token.tokenId == '63') console.dir(token);
  return (
    <>
      <div
        className='w-full flex flex-col items-center justify-between border-[1px] bg-purple-300/20 border-purple-300/20 rounded-lg cursor-pointer overflow-hidden'
        onClick={handleClick}
      >
        <div className='w-full'>
          {/* IMAGE */}
          <div className='w-full aspect-square flex items-center bg-black/20'>
            {token?.token?.image && (
              <Image
                src={token.token.image}
                alt={token.token.name}
                //   layout='responsive'
                width={400}
                height={400}
                className={'w-full cursor-pointer'}
                //   onLoad={(e) => setImageLoaded(true)}
                onClick={() => {
                  // largeMediaControls.start('visible');
                  // setOpenLargeMedia(token);
                }}
              />
            )}
          </div>
          {/* DETAILS */}
          <div className='w-full flex flex-col gap-1 py-2 px-1'>
            <div className='my-1'>{token.token.name}</div>
            <Markdown className='text-sm text-gray-400 hyphens-auto whitespace-pre-line'>
              {token.token.description}
            </Markdown>
          </div>
        </div>
        {/* COLLECT (LIKES) */}
        <div className='w-full bg-slate-600 mt-1 flex gap-2 items-center justify-between px-0 text-xs'>
          <div className='flex gap-2 pl-1'>
            <GoPlusCircle size={14} color='' />
            <div className=''>{token.token.totalMinted || '1'}</div>
          </div>
          {/* "MINT" button (will open the CollectModal) */}
          <div className=' pointer-events-none'>
            <button
              className='px-4 py-1 rounded-b-md rounded-l-none bg-[#01ff00] text-black duration-300 pointer-events-auto'
              onClick={(e) => {
                e.stopPropagation();
                setOpenCollect(true);
              }}
            >
              <div className='translate-y-[1px]'>Collect</div>
            </button>
          </div>
        </div>
      </div>
      <CollectModal
        open={openCollect}
        onClose={() => setOpenCollect(false)}
        token={token.token}
        defaultQuantity={1}
      />
    </>
  );
}
