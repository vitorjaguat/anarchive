import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useEffect } from 'react';
import {
  BsGlobe,
  BsInstagram,
  BsTelegram,
  BsTwitterX,
  BsYoutube,
} from 'react-icons/bs';
import { RxChevronDown } from 'react-icons/rx';
import {
  TbZoomScan,
  TbArrowsMove,
  TbRotate360,
  TbEye,
  TbSpace,
} from 'react-icons/tb';

const boxVariants = {
  hidden: {
    // opacity: 0,
    y: '100%', // Use transform instead of top/bottom
    x: 0,
  },
  visible: {
    // opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      // Stagger the animations
      opacity: { duration: 0.2, ease: 'easeOut' },
      y: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    // opacity: 0,
    y: '100%',
    transition: {
      duration: 0.5,
      ease: 'easeIn',
      opacity: { duration: 0.2 },
    },
  },
};

export default function AppInfoBox({ setInfoVisible, infoVisible }) {
  // const controls = useAnimationControls();
  // useEffect(() => {
  //   if (infoVisible) {
  //     controls.start('visible');
  //   } else {
  //     controls.start('exit');
  //   }
  // }, [infoVisible]);
  return (
    <AnimatePresence>
      {infoVisible && (
        <motion.div
          className='absolute rounded-tr-md max-w-[600px] flex flex-col backdrop-blur-[6px] bg-slate-800/20 bottom-[100px] left-0 items-end'
          variants={boxVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          // style={{
          //   transform: 'translate(-50%, calc(-50% - 50px))',
          // }}
        >
          <div
            className='w-fit h-4 px-3 rounded-t-md flex justify-center bg-slate-500 hover:bg-slate-400 duration-300 cursor-pointer -translate-y-full'
            onClick={() => setInfoVisible(false)}
          >
            <RxChevronDown className='-translate-y-[1px]' size={18} />
          </div>
          <div className='p-4 flex flex-col gap-4 text-sm'>
            <div className='text-white'>
              The Anarchiving Game is a participatory web3 protocol embodying
              the spirit of innovation and interdependence constitutive of the
              live arts. Based on a shared contract deployed on the Zora Chain,
              The Anarchiving Game enables players to mint, share and collect
              fragments of{' '}
              <a
                href='https://www.thesphere.as/'
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-slate-400 hover:text-slate-50 duration-300'
              >
                The Sphere
              </a>
              's creative journey.
            </div>
            <div className='text-white'>
              Think of a fractal and proliferating archive: an open-ended canvas
              where the collective memory and creative outputs of The Sphere's
              community are not only preserved, but continually re-envisioned
              and synthetically expanded upon.
            </div>
            <div className='text-white'>
              The Anarchiving Game is supported by{' '}
              <a
                href='https://proud-paprika-325.notion.site/The-winning-projects-from-our-Open-Call-for-New-Models-for-Interdependence-and-Ownership-in-Art-and--b36baccbfe094012834f52b05d87dc4b'
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-slate-400 hover:text-slate-50 duration-300'
              >
                New Models for Interdependence and Ownership in Art and Culture
              </a>
              , a program coordinated by{' '}
              <a
                href='https://futureartecosystems.org/'
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-slate-400 hover:text-slate-50 duration-300'
              >
                Serpentine Arts Technologies
              </a>{' '}
              and{' '}
              <a
                href='https://www.radicalxchange.org/'
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-slate-400 hover:text-slate-50 duration-300'
              >
                RadicalXChange
              </a>
              .{' '}
            </div>
            <div className=' my-4 flex justify-around w-full'>
              <a
                className=' hover:scale-125 duration-500'
                href='https://thesphere.as'
                target='_blank'
                rel='noopener noreferrer'
              >
                <BsGlobe size={20} />
              </a>
              <a
                className=' hover:scale-125 duration-500'
                href='https://instagram.com/thesphere_as'
                target='_blank'
                rel='noopener noreferrer'
              >
                <BsInstagram size={20} />
              </a>
              <a
                className=' hover:scale-125 duration-500'
                href='https://twitter.com/thesphere_as'
                target='_blank'
                rel='noopener noreferrer'
              >
                <BsTwitterX size={19} />
              </a>
              <a
                className=' hover:scale-125 duration-500'
                href='https://www.youtube.com/@thesphere2767'
                target='_blank'
                rel='noopener noreferrer'
              >
                <BsYoutube size={22} />
              </a>
              <a
                className=' hover:scale-125 duration-500'
                href='https://warpcast.com/thesphere'
                target='_blank'
                rel='noopener noreferrer'
              >
                <img
                  src='/icons/logo-farcaster.svg'
                  alt='Farcaster'
                  width={19}
                  height={19}
                />
              </a>
              <a
                className=' hover:scale-125 duration-500'
                href='https://t.me/+o3hn1fgGsQMzZjgx'
                target='_blank'
                rel='noopener noreferrer'
              >
                <BsTelegram size={20} />
              </a>
            </div>
            <div className='mt-2 w-full border-b-[1px] border-white/30'></div>
            <div className='mt-2 text-xs w-full flex flex-col items-end gap-[4px]'>
              <div className='text-sm bold mb-2'>Navigation instructions</div>

              <div className='flex gap-2'>
                Left-click drag to rotate
                <TbRotate360 size={20} />
              </div>
              <div className='flex gap-2'>
                Scroll to zoom in/out
                <TbZoomScan size={20} />
              </div>
              <div className='flex gap-2'>
                Right-click to pan
                <TbArrowsMove size={20} />
              </div>
              <div className='flex gap-2'>
                Left-click on fragment to see details and mint
                <TbEye size={20} />
              </div>
              <div className='flex gap-2'>
                Press spacebar to reset view (recenter)
                <TbSpace size={20} />
              </div>
            </div>
            <div className='flex flex-col items-start w-full text-xs'>
              <div className=''>beta v0.3 - June 2025</div>
              <div className=''>
                Developed by{' '}
                <a
                  className='text-slate-200 hover:text-slate-300 tracking-wide hover:tracking-wider duration-500'
                  href='http://uint.studio'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Uint Studio
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
