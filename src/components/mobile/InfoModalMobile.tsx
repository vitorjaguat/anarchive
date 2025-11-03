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
import {
  BsGlobe,
  BsInstagram,
  BsTwitterX,
  BsTelegram,
  BsYoutube,
} from 'react-icons/bs';
import {
  TbRotate360,
  TbZoomScan,
  TbArrowsMove,
  TbEye,
  TbSpace,
} from 'react-icons/tb';

export default function InfoModalMobile({ onClose }: { onClose: () => void }) {
  const { openConnectModal } = useConnectModal();
  const [openLargeMedia, setOpenLargeMedia] = useState(null);
  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] font-light'>
      <div
        className='bg-slate-700 rounded-md mx-3 max-w-lg w-full max-h-[90vh] overflow-y-auto p-0'
        tabIndex={-1}
      >
        <button className='absolute top-2 right-2 blur-none' onClick={onClose}>
          <IoCloseOutline className='text-white' size={25} />
        </button>
        <div className='p-4 flex flex-col gap-4 text-sm'>
          {/* SOCIALS */}
          <div className=' mt-5 mb-3 flex justify-around w-full'>
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

          {/* TEXT */}
          <div className='text-white'>
            The Anarchiving Game is a participatory web3 protocol embodying the
            spirit of innovation and interdependence constitutive of the live
            arts. Based on a shared contract deployed on the Zora Chain, The
            Anarchiving Game enables players to mint, share and collect
            fragments of{' '}
            <a
              href='https://www.thesphere.as/'
              target='_blank'
              rel='noopener noreferrer'
              className='font-bold text-slate-400 hover:text-slate-50 duration-300'
            >
              The Sphere
            </a>
            &apos;s creative journey.
          </div>
          <div className='text-white'>
            Think of a fractal and proliferating archive: an open-ended canvas
            where the collective memory and creative outputs of The
            Sphere&apos;s community are not only preserved, but continually
            re-envisioned and synthetically expanded upon.
          </div>
          <div className='text-white'>
            The Anarchiving Game was supported by{' '}
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
              Serpentine’s Future Art Ecosystems
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

          {/* <div className='mt-1 w-full border-b-[1px] border-white/30'></div> */}

          {/* CREDITS */}
          <div className='flex flex-col items-center w-full mb-4 mt-2'>
            <div className=''>beta v0.4 - November 2025</div>
            <div className=''>
              Developed by{' '}
              <a
                className='text-slate-400 text-sm font-bold hover:text-slate-300 tracking-wide hover:tracking-wider duration-500'
                href='http://uint.studio'
                target='_blank'
                rel='noopener noreferrer'
              >
                Uint Studio
              </a>
            </div>
          </div>

          {/* <div className='mt-1 text-xs w-full flex flex-col items-end gap-[4px]'>
            <div className='text-sm tracking-wide mb-2'>
              Navigation instructions
            </div>

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
          </div> */}
        </div>
      </div>
    </div>,
    document.body
  );
}
