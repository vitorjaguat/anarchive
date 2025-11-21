import Image from 'next/image';
import type { Token } from '../../../types/tokens';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from 'react-icons/io5';
import { GoPlusCircle } from 'react-icons/go';
// import { MintModal } from '@reservoir0x/reservoir-kit-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import LargeMedia from '../LargeMedia';
import Markdown from 'react-markdown';
// import Mint from '../Mint';
import CollectModal from '../CollectModal';

export default function GridOpenToken({
  token,
  onClose,
}: {
  token: Token;
  onClose: () => void;
}) {
  const [openLargeMedia, setOpenLargeMedia] = useState(null);
  const [openCollect, setOpenCollect] = useState(false);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!token?.token?.tokenId) return null;
  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px]'>
      <div
        className='bg-slate-500 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-4'
        tabIndex={-1}
      >
        <button className='absolute top-2 right-2 blur-none' onClick={onClose}>
          <IoCloseOutline className='text-white' size={25} />
        </button>
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
                setOpenLargeMedia(token);
              }}
            />
          )}
        </div>
        {/* COLLECT (LIKES) */}
        <div className='mt-5 flex gap-2 items-center justify-between px-1'>
          <div className='flex gap-2 items-center text-slate-300'>
            <GoPlusCircle size={18} color='#cbd5e1' />
            <div className='text-sm'>{token?.token?.totalMinted}</div>
          </div>
          {/* <MintModal
            chainId={7777777}
            copyOverrides={{
              mintTitle: 'Collect your own',
              mintCtaBuy: 'Collect',
            }}
            trigger={
              <button className='px-4 py-1 rounded-md bg-[#01ff00] text-[#000000] hover:scale-[1.02] transition-all duration-300'>
                Collect
              </button>
            }
            onMintComplete={(data) => console.log(data)}
            onMintError={(error) => console.log(error)}
            onConnectWallet={openConnectModal}
            token={token.token.contract + ':' + token.token.tokenId}
          /> */}
          <button
            className='px-3.5 text-sm py-1 tracking-wide rounded-md bg-[#01ff00] text-[#000000] hover:scale-[1.02] transition-all duration-300 translate-y-0.5 -translate-x-0.5'
            onClick={() => setOpenCollect(true)}
          >
            {/* <Mint token={token.token} /> */}
            Collect
          </button>
        </div>

        {/* DETAILS */}
        <div className='flex flex-col gap-5 my-3 px-1'>
          {/* TITLE */}
          <div className=''>{token.token.name}</div>

          {/* ATTRIBUTES */}
          <div className='grid grid-cols-2 gap-1'>
            {token?.token?.attributes?.map((att, i) => (
              <div
                key={i}
                className='flex flex-col gap-1 text-xs bg-white/10 rounded-md pb-1 h-full'
              >
                <div className='text-left py-0.5 px-2 text-xs bg-white/10'>
                  {att?.key}
                </div>
                <div className='text-left px-2 flex flex-col justify-center h-full gap-1 font-thin'>
                  {att?.key !== 'Content Tags'
                    ? att?.value
                    : att?.value
                        .split(',')
                        .map((tag) => <div key={tag}>{tag.trim()}</div>)}
                </div>
              </div>
            ))}
          </div>

          {/* DETAILS */}
          <div className='w-full flex flex-col gap-1 px-1'>
            <Markdown className='text-sm text-gray-200 hyphens-auto whitespace-pre-line'>
              {token.token.description}
            </Markdown>
          </div>
        </div>
      </div>

      {/* LARGE MEDIA */}
      {openLargeMedia && (
        <div
          className='absolute inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-[2px]'
          onClick={() => {
            // console.log('token:', token);
            setOpenLargeMedia(null);
          }}
        >
          <button
            className='absolute top-2 right-2 blur-none'
            onClick={() => setOpenLargeMedia(null)}
          >
            <IoCloseOutline className='text-white' size={25} />
          </button>
          <LargeMedia
            token={token.token}
            // className={'w-full cursor-pointer'}
          />
        </div>
      )}
      <CollectModal
        open={openCollect}
        onClose={() => setOpenCollect(false)}
        token={token.token}
        defaultQuantity={1}
      />
    </div>,
    document.body
  );
}
