import Markdown from 'react-markdown';
// import { MintModal } from '@reservoir0x/reservoir-kit-ui';
import { Fragment, useState, useContext } from 'react';
import { MainContext } from '@/context/mainContext';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { RxChevronRight } from 'react-icons/rx';
import { BsArrowsFullscreen } from 'react-icons/bs';
import LargeMedia from './LargeMedia';
import Image from 'next/image';
import CopyURLButton from './CopyURLButton';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';
import CollectModal from './CollectModal';

export default function TokenInfo({ imageLoaded, setImageLoaded }) {
  const [openLargeMedia, setOpenLargeMedia] = useState(null);
  const tokenInfoControls = useAnimationControls();
  const largeMediaControls = useAnimationControls();
  // const { openConnectModal } = useConnectModal();
  const [openCollect, setOpenCollect] = useState(false);
  const router = useRouter();
  const { openToken, changeOpenToken } = useContext(MainContext);

  const handleClose = () => {
    tokenInfoControls.start('hidden');
    // Remove the fragment query parameter
    const newQuery = { ...router.query };
    delete newQuery.fragment;
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
    changeOpenToken(null);
  };

  return (
    <AnimatePresence>
      {openToken?.token?.tokenId && (
        <Fragment key={`token-panel-${openToken.token.tokenId || 'unknown'}`}>
          <motion.div
            className='absolute min-w-[600px] right-0  h-[calc(100%-100px)] z-20 flex backdrop-blur-[6px] bg-slate-800/20'
            key={openToken.token.tokenId}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            variants={{
              hidden: {
                right: -600,
              },
              visible: {
                // opacity: 1,
                right: 0,
                transition: {
                  duration: 2,
                  // ease: [0.16, 1, 0.3, 1],
                  ease: 'easeInOut',
                  // type: 'spring',
                },
              },
              exit: {
                right: -616,
                transition: {
                  duration: 1.5,
                  // ease: [0.4, 0.5, 0.7, 1],
                  // type: 'spring',
                  ease: 'easeInOut',
                },
              },
            }}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            {/* close button */}
            <div
              className='w-4 h-fit py-2 rounded-s-md flex justify-center bg-slate-500 hover:bg-slate-400 active:bg-slate-400 duration-300 cursor-pointer translate-x-[-100%]'
              onClick={handleClose}
            >
              <RxChevronRight size={24} />
            </div>

            {/* columns */}
            {openToken?.token && (
              <div className='pt-4 grid grid-cols-2 gap-4 max-w-[576px]'>
                {/* left column */}
                <div className=' pb-4 flex flex-col justify-between h-full gap-2'>
                  {/* image + collect btn */}
                  <div className='flex flex-col gap-2'>
                    <div className='relative  bg-white/10 rounded-md overflow-hidden w-full flex justify-center items-center min-h-[280px]'>
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
                      {/* {(openTokenData?.token?.image.slice(-3) === 'gif' ||
                    openTokenData?.token?.image.slice(-3) === 'svg') && (
                    <Image
                      src={openTokenData.token.imageSmall}
                      alt={openTokenData.token.name}
                      width={300}
                      height={300}
                      className={
                        'max-w-1/2 max-h-[300px] object-contain cursor-pointer' +
                        (imageLoaded ? ' ' : ' w-0 h-0 overflow-hidden')
                      }
                      onLoad={() => setImageLoaded(true)}
                      onClick={() => {
                        largeMediaControls.start('visible');
                        setOpenLargeMedia(openTokenData);
                      }}
                    />
                  )} */}
                      {openToken?.token?.image && (
                        <Image
                          src={openToken.token.image}
                          alt={openToken.token.name}
                          width={300}
                          height={300}
                          className={
                            'max-w-1/2 max-h-[280px] object-contain cursor-pointer' +
                            (imageLoaded ? ' ' : ' w-0 h-0 overflow-hidden')
                          }
                          onLoad={() => setImageLoaded(true)}
                          onClick={() => {
                            largeMediaControls.start('visible');
                            setOpenLargeMedia(openToken);
                          }}
                        />
                      )}
                      <div
                        className='absolute bottom-2 right-2 cursor-pointer mix-blend-difference'
                        onClick={() => {
                          largeMediaControls.start('visible');
                          setOpenLargeMedia(openToken);
                        }}
                      >
                        <BsArrowsFullscreen size='12' />
                      </div>
                    </div>
                    <div className=''>
                      <button
                        className='w-full bg-sph-purple-light text-white/90 py-2 rounded-md hover:bg-[#01ff00] hover:text-[#000000] hover:scale-[1.02] transition-all duration-300'
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCollect(true);
                        }}
                      >
                        Collect
                      </button>
                    </div>
                  </div>

                  {/* attributes */}
                  <div className='grid grid-cols-2 gap-1'>
                    {openToken?.token?.attributes?.map((att, i) => {
                      const rawKey = String(att?.key ?? '').trim();
                      const rawValue = String(att?.value ?? '').trim();
                      const attributeKey = `${rawKey || 'attribute'}-${
                        rawValue || i
                      }`;
                      return (
                        <div
                          key={attributeKey}
                          className='flex flex-col gap-2 text-xs bg-white/10 rounded-md pb-2 h-full'
                        >
                          <div className='text-center text-[10px] bg-white/10'>
                            {att?.key}
                          </div>
                          <div className='text-center px-2 flex flex-col justify-center h-full gap-1 font-thin'>
                            {att?.key !== 'Content Tags'
                              ? att?.value
                              : att?.value.split(',').map((tag, tagIndex) => {
                                  const trimmedTag = tag.trim();
                                  const tagKey = `${attributeKey}-tag-${
                                    trimmedTag || tagIndex
                                  }`;
                                  return <div key={tagKey}>{trimmedTag}</div>;
                                })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* right column */}
                <div className='flex flex-col gap-1'>
                  {/* title + authors */}
                  <div className='flex flex-col gap-1'>
                    <div className='pr-4 pt-4 leading-snug'>
                      {openToken.token?.name}
                    </div>
                    <div className='mt-1 text-xs pr-4 font-thin'>
                      Created by{' '}
                      <span className='font-bold'>
                        {
                          openToken.token?.attributes?.find(
                            (att) => att?.key === 'Creator'
                          )?.value
                        }
                      </span>
                    </div>
                  </div>

                  {/* copy link */}
                  <CopyURLButton />

                  <div className=' pb-[96px] mt-6 pr-3 text-sm max-h-[calc(100vh-222px)] overflow-y-auto overflow-x-hidden font-thin'>
                    <Markdown className=' whitespace-pre-line'>
                      {openToken.token?.description}
                    </Markdown>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* openLargeMedia modal */}

          <motion.div
            className='absolute top-0 right-0 w-screen h-[calc(100vh-100px)] items-center justify-center bg-black/80 z-50'
            key={'modal_' + openToken.token.tokenId}
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
        </Fragment>
      )}
      {openToken?.token && (
        <CollectModal
          key={`collect-modal-${openToken.token.tokenId || 'unknown'}`}
          open={openCollect}
          onClose={() => setOpenCollect(false)}
          token={openToken.token}
          defaultQuantity={1}
        />
      )}
    </AnimatePresence>
  );
}
