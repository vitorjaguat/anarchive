import Markdown from 'react-markdown';
import { CollectModal } from '@reservoir0x/reservoir-kit-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RxChevronDown } from 'react-icons/rx';

const boxVariants = {
  hidden: {
    // opacity: 0,
    top: '100%',
    bottom: 'auto',
  },
  visible: {
    // opacity: 1,
    top: 'auto',
    bottom: 0,
    transition: {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      // type: 'spring',
    },
  },
  exit: {
    top: '100%',
    transition: {
      duration: 2,
      // ease: [0.7, 1, 0.3, 1],
      // type: 'spring',
    },
    // bottom: 'auto',
  },
};

export default function TokenInfo({ openTokenData, handleClickOverlay }) {
  const { openConnectModal } = useConnectModal();
  const mintOpenState = useState(true);

  return (
    <motion.div
      className='absolute top-0 left-0 w-screen h-screen flex items-start justify-end z-1000'
      onClick={handleClickOverlay}
      variants={boxVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
    >
      <div
        className='bg-slate-700 pb-6 z-[1001] h-[calc(100%-100px)]'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* close button */}
        <div
          className='w-full flex justify-center p-1 mb-4 bg-slate-500 hover:bg-slate-400 active:bg-slate-400 duration-300 cursor-pointer'
          onClick={handleClickOverlay}
        >
          <RxChevronDown size={24} />
        </div>
        {/* columns */}
        <div className='px-4 flex justify-between gap-4'>
          <div className='flex flex-col gap-4'>
            <img
              src={openTokenData.token.image}
              alt={openTokenData.token.name}
              width={250}
              height={250}
              className='max-w-[250px] max-h-[250px] object-contain rounded-md bg-white/10'
            />
            <div className=''>
              <CollectModal
                type='trade'
                trigger={
                  <button
                    className='w-full bg-slate-800/90 text-white/90 py-2 rounded-md hover:bg-slate-800/70 transition-all duration-300'
                    //   onClick={() => setMintOpenState(true)}
                  >
                    Mint
                  </button>
                }
                onConnectWallet={() => {
                  openConnectModal?.();
                }}
                defaultQuantity={2}
                // openState={mintOpenState}
                collectionId={openTokenData.token.contract}
                tokenId={openTokenData.token.tokenId}
                onCollectComplete={(data) => console.log(data)}
                onCollectError={(error) => console.log(error)}

                // token={
                //   openTokenData.token.contract +
                //   ':' +
                //   openTokenData.token.tokenId
                // }
              />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              {openTokenData.token.attributes.map((att) => (
                <div
                  key={att.key}
                  className='flex flex-col gap-2 text-xs bg-white/10 rounded-md pb-2 h-fit'
                >
                  <div className='text-center text-[10px] bg-white/10'>
                    {att.key}
                  </div>
                  <div className='text-center px-2 flex flex-col gap-1'>
                    {att.key !== 'Content Tags'
                      ? att.value
                      : att.value
                          .split(',')
                          .map((tag) => <div key={tag}>{tag.trim()}</div>)}
                  </div>
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
              <Markdown>{openTokenData.token.description}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
