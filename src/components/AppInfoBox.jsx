import { motion } from 'framer-motion';
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
    top: '100%',
    bottom: 'auto',
    left: 0,
  },
  visible: {
    // opacity: 1,
    top: 'auto',
    left: 0,
    bottom: 100,
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
};

export default function AppInfoBox({ setInfoVisible, infoVisible }) {
  return (
    <motion.div
      className='absolute bg-slate-700 rounded-tr-md max-w-[600px] flex flex-col'
      variants={boxVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      // style={{
      //   transform: 'translate(-50%, calc(-50% - 50px))',
      // }}
    >
      <div
        className='w-full flex justify-center p-0 mb-2 bg-slate-500 hover:bg-slate-400 duration-300 cursor-pointer rounded-tr-md'
        onClick={() => setInfoVisible(false)}
      >
        <RxChevronDown size={22} />
      </div>
      <div className='p-4 flex flex-col gap-4 text-sm'>
        <div className='text-white'>
          The Anarchiving Game is a shared contract deployed on Zora&apos;s
          mainnet that records The Sphere&apos;s evolution, capturing its
          journey and milestones. This initiative enables collaborators to mint,
          share, and collect digital objects at minimal costs, promoting open
          access and diversity in the field of live arts.
        </div>
        <div className='text-white'>
          When participants create fragments, they are building together the The
          Sphere&apos;s Anarchive as a dynamic, participatory open canvas where
          community&apos;s memories and creativity are continuously interpreted
          and reimagined, challenging traditional archiving methods, creating a
          fluid narrative through artistic collaboration.
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
            <BsTwitterX size={20} />
          </a>
          <a
            className=' hover:scale-125 duration-500'
            href='https://www.youtube.com/@thesphere2767'
            target='_blank'
            rel='noopener noreferrer'
          >
            <BsYoutube size={20} />
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
              width={20}
              height={20}
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
          <div className=''>alpha v.0.1 - April 2024</div>
          <div className=''>Developed by Uint Studio</div>
        </div>
      </div>
    </motion.div>
  );
}
