import Image from 'next/image';
// import * as tokenTypes from '../../../types/tokens';
import type {
  ReservoirTokensResponse,
  ReservoirToken,
} from '../../../types/tokens';
import { useState } from 'react';
import GridOpenToken from './GridOpenToken';
import { MintModal } from '@reservoir0x/reservoir-kit-ui';
import { GoPlusCircle } from 'react-icons/go';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function GridViewItemMobile({
  token,
}: {
  token: ReservoirToken;
}) {
  const [openToken, setOpenToken] = useState<ReservoirToken | null>(null);
  const { openConnectModal } = useConnectModal();

  const handleClick = () => {
    console.log('token', token);
    setOpenToken(token);
  };
  return (
    <>
      <div
        className='w-full flex flex-col items-center border-[1px] bg-purple-300/20 border-purple-300/20 rounded-lg cursor-pointer overflow-hidden'
        onClick={handleClick}
      >
        {/* IMAGE */}
        <div className='w-full aspect-square flex items-center bg-black/20'>
          {token?.token?.image && (
            <Image
              src={token.token.image}
              alt={token.token.name}
              layout='responsive'
              width={1}
              height={1}
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
          <div className='text-sm text-gray-400 hyphens-auto'>
            {token.token.description}
          </div>
        </div>
        {/* COLLECT (LIKES) */}
        <div className='w-full bg-slate-600 mt-1 flex gap-2 items-center justify-between px-0 text-xs'>
          <div className='flex gap-2 pl-1'>
            <GoPlusCircle size={14} color='' />
            <div className=''>{token.token.supply}</div>
          </div>
          <MintModal
            chainId={7777777}
            copyOverrides={{
              mintTitle: 'Collect your own',
              mintCtaBuy: 'Collect',
            }}
            // normalizeRoyalties={true}
            trigger={
              <button
                className='px-4 py-1 rounded-b-md rounded-l-none bg-[#01ff00] text-[#000000] hover:scale-[1.02] transition-all duration-300'
                onClick={(e) => e.stopPropagation()}
              >
                Collect
              </button>
            }
            // onConnectWallet={() => {
            //   openConnectModal?.();
            // }}
            // referrerAddress='0xBFd118f0ff5d6f4D3Eb999eAF197Dbfcc421C5Ea'
            // referrer='0xBFd118f0ff5d6f4D3Eb999eAF197Dbfcc421C5Ea'

            // openState={mintOpenState}
            // collectionId={openTokenData.token.contract}
            // tokenId={openTokenData.token.tokenId}
            onMintComplete={(data) => console.log(data)}
            onMintError={(error) => console.log(error)}
            onConnectWallet={openConnectModal}
            token={token.token.contract + ':' + token.token.tokenId}
          />
          {/* <div className=''>Collect</div> */}
        </div>
      </div>

      {/* OPEN TOKEN MODAL */}
      {openToken && (
        <GridOpenToken onClose={() => setOpenToken(null)} token={token} />
      )}
    </>
  );
}
