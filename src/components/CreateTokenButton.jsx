import { ConnectButton } from '@rainbow-me/rainbowkit';
import { HiOutlinePlus } from 'react-icons/hi';
import { useAccount } from 'wagmi';
import { useRef } from 'react';
import { useRouter } from 'next/router';

export default function CreateTokenButton() {
  const connectRef = useRef();
  const { isConnected } = useAccount();
  const router = useRouter();
  const handleAddClick = () => {
    if (isConnected) {
      router.push('/create');
    } else {
      connectRef.current.click();
    }
  };

  return (
    <div
      className='absolute top-3 left-3 p-2 bg-white/20 rounded-md cursor-pointer hover:bg-white/50 flex items-center justify-center w-[34px] h-[34px] overflow-hidden hover:w-fit duration-300  group'
      onClick={handleAddClick}
    >
      <div className='relative flex h-full w-full items-center justify-start gap-2'>
        <HiOutlinePlus className='' size={18} />
        <div className='hidden  group-hover:block'>Create new fragment</div>
        {!isConnected && (
          <div
            ref={connectRef}
            className='fixed top-2 left-2 w-full h-full z-10 opacity-0'
          >
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}
