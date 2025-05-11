import Markdown from 'react-markdown';
import { MintModal } from '@reservoir0x/reservoir-kit-ui';
import { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { RxChevronDown } from 'react-icons/rx';
import { BsArrowsFullscreen } from 'react-icons/bs';
import LargeMedia from './LargeMedia';
import Image from 'next/image';
import CopyURLButton from './CopyURLButton';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function TokenInfo({
  openTokenData,
  handleClickOverlay,
  imageLoaded,
  setImageLoaded,
  setOpenTokenData,
}) {
  const [openLargeMedia, setOpenLargeMedia] = useState(null);
  // console.log('openTokenData', openTokenData.token);
  // console.log('imageLoaded', imageLoaded);
  const tokenInfoControls = useAnimationControls();
  const largeMediaControls = useAnimationControls();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (openTokenData && openTokenData?.token) {
      tokenInfoControls.start('visible');
      // console.log(
      //   'openTokenData',
      //   openTokenData.token.contract + ':' + openTokenData.token.tokenId
      // );
    } else {
      tokenInfoControls.start('hidden');
    }
  }, [openTokenData]);

  return (
    <>
      <motion.div
        className='absolute min-w-[600px] right-0 bg-slate-700 pb-6 z-[2] h-full'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        variants={{
          hidden: {
            // opacity: 0,
            top: '100%',
            bottom: 'auto',
          },
          visible: {
            // opacity: 1,
            top: 0,
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
              // ease: [0.4, 0.5, 0.7, 1],
              type: 'spring',
            },
            // bottom: 'auto',
          },
        }}
        initial='hidden'
        animate={tokenInfoControls}
        // exit='exit'
      >
        {/* close button */}
        <div
          className='w-full flex justify-center p-1 mb-4 bg-slate-500 hover:bg-slate-400 active:bg-slate-400 duration-300 cursor-pointer '
          onClick={() => {
            tokenInfoControls.start('hidden');
            setOpenTokenData(null);
          }}
        >
          <RxChevronDown size={24} />
        </div>

        {/* columns */}
        {openTokenData?.token && (
          <div className='pl-4 grid grid-cols-2 gap-4 max-w-[600px]'>
            {/* left column */}
            <div className=' pb-[46px] flex flex-col justify-between h-full gap-2'>
              {/* image + collect btn */}
              <div className='flex flex-col gap-2'>
                <div className='relative bg-white/10 rounded-md overflow-hidden w-full flex justify-center items-center min-h-[280px]'>
                  {!imageLoaded && (
                    // <Image
                    //   src='/assets/loading284x284.png'
                    //   width={284}
                    //   height={284}
                    //   alt='loading'
                    // />
                    <div className='w-full h-[200px] flex items-center justify-center'>
                      <div className='text-sm animate-ping'>loading...</div>
                    </div>
                  )}
                  {(openTokenData?.token?.image.slice(-3) === 'gif' ||
                    openTokenData?.token?.image.slice(-3) === 'svg') && (
                    <img
                      src={openTokenData.token.imageSmall}
                      alt={openTokenData.token.name}
                      width={300}
                      height={300}
                      className={
                        'max-w-1/2 max-h-[300px] object-contain cursor-pointer' +
                        (imageLoaded ? ' ' : ' w-0 h-0 overflow-hidden')
                      }
                      onLoad={(e) => setImageLoaded(true)}
                      onClick={() => {
                        largeMediaControls.start('visible');
                        setOpenLargeMedia(openTokenData);
                      }}
                    />
                  )}
                  {openTokenData?.token?.image && (
                    <Image
                      src={openTokenData.token.image}
                      alt={openTokenData.token.name}
                      width={300}
                      height={300}
                      className={
                        'max-w-1/2 max-h-[280px] object-contain cursor-pointer' +
                        (imageLoaded ? ' ' : ' w-0 h-0 overflow-hidden')
                      }
                      onLoad={(e) => setImageLoaded(true)}
                      onClick={() => {
                        largeMediaControls.start('visible');
                        setOpenLargeMedia(openTokenData);
                      }}
                    />
                  )}
                  <div
                    className='absolute bottom-2 right-2 cursor-pointer'
                    onClick={() => {
                      largeMediaControls.start('visible');
                      setOpenLargeMedia(openTokenData);
                    }}
                  >
                    <BsArrowsFullscreen size='12' />
                  </div>
                </div>
                <div className=''>
                  <MintModal
                    chainId={7777777}
                    copyOverrides={{
                      mintTitle: 'Collect your own',
                      mintCtaBuy: 'Collect',
                    }}
                    // normalizeRoyalties={true}
                    trigger={
                      <button className='w-full bg-slate-800/90 text-white/90 py-2 rounded-md hover:bg-[#01ff00] hover:text-[#000000] hover:scale-[1.02] transition-all duration-300'>
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
                    token={
                      openTokenData.token.contract +
                      ':' +
                      openTokenData.token.tokenId
                    }
                    onConnectWallet={openConnectModal}
                  />
                </div>
              </div>

              {/* attributes */}
              <div className='grid grid-cols-2 gap-1'>
                {openTokenData?.token?.attributes?.map((att, i) => (
                  <div
                    key={i}
                    className='flex flex-col gap-2 text-xs bg-white/10 rounded-md pb-2 h-full'
                  >
                    <div className='text-center text-[10px] bg-white/10'>
                      {att?.key}
                    </div>
                    <div className='text-center px-2 flex flex-col justify-center h-full gap-1 font-thin'>
                      {att?.key !== 'Content Tags'
                        ? att?.value
                        : att?.value
                            .split(',')
                            .map((tag) => <div key={tag}>{tag.trim()}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right column */}
            <div className='flex flex-col gap-1'>
              {/* title + authors */}
              <div className='flex flex-col gap-1'>
                <div className='pr-4 pt-4 leading-snug'>
                  {openTokenData.token?.name}
                </div>
                <div className='mt-1 text-xs pr-4 font-thin'>
                  Created by{' '}
                  <span className='font-bold'>
                    {
                      openTokenData.token?.attributes?.find(
                        (att) => att?.key === 'Creator'
                      )?.value
                    }
                  </span>
                </div>
              </div>

              {/* copy link */}
              <CopyURLButton />

              <div className=' pb-[96px] mt-6 pr-3 text-sm max-h-[calc(100vh-222px)] overflow-y-auto overflow-x-hidden font-thin'>
                <Markdown className=''>
                  {openTokenData.token?.description}
                </Markdown>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* openLargeMedia modal */}

      <motion.div
        className='absolute top-0 right-0 w-screen h-[calc(100vh-100px)] items-center justify-center bg-black/80 z-[3]'
        variants={{
          hidden: {
            opacity: 0,
            display: 'none',
          },
          visible: {
            display: 'flex',
            opacity: 1,
            transition: {
              duration: 1,
              // ease: [0.16, 1, 0.3, 1],
              // type: 'spring',
            },
          },
          exit: {
            opacity: 0,
            transition: {
              duration: 0.5,
              // ease: [0.4, 0.5, 0.7, 1],
              type: 'spring',
            },
          },
        }}
        initial='hidden'
        animate={largeMediaControls}
        // exit='exit'
        onClick={() => {
          largeMediaControls.start('hidden');
          setOpenLargeMedia(null);
        }}
      >
        <motion.div
          variants={{
            hidden: {
              scale: 0,
            },
            visible: {
              scale: 1,
              transition: {
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              },
            },
            exit: {
              scale: 0,
              transition: {
                duration: 0.5,
                ease: [0.4, 0.5, 0.7, 1],
                type: 'spring',
              },
            },
          }}
          initial='hidden'
          animate={largeMediaControls}
          // exit='exit'
          className='flex justify-center'
          // style={{ maxWidth: 'fit-content' }}
        >
          {/* <img
                  src={openLargeMedia.token.imageLarge}
                  alt={openLargeMedia.token.name}
                  width={500}
                  height={500}
                  className='max-w-[500px] max-h-[500px] object-contain rounded-md bg-white/10'
                /> */}
          {openLargeMedia?.token && (
            <LargeMedia token={openLargeMedia?.token} />
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
