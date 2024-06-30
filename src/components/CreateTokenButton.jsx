import { ConnectButton } from '@rainbow-me/rainbowkit';
import { HiOutlinePlus } from 'react-icons/hi';
import { useAccount } from 'wagmi';
import { useRef, useState, useEffect } from 'react';
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

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className='absolute top-3 left-3 flex items-center justify-center'
      onClick={handleAddClick}
    >
      <div className='p-2 relative flex items-center justify-start gap-2 bg-white/20 rounded-md cursor-pointer hover:bg-white/50 w-[34px] h-[34px] overflow-hidden hover:w-fit group'>
        <HiOutlinePlus className='' size={18} />
        <div className='hidden  group-hover:block'>Create new fragment</div>
        {!isConnected && (
          <div
            ref={connectRef}
            className='fixed top-2 left-2 w-[100px] h-[34px] z-10 opacity-0'
          >
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}
