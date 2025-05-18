import { ConnectButton } from '@rainbow-me/rainbowkit';
import { HiOutlinePlus } from 'react-icons/hi';
import { useAccount } from 'wagmi';
import { useRef } from 'react';
import { useRouter } from 'next/router';
import useIsMounted from '@/utils/useIsMounted';

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

  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className='absolute top-3 left-3 flex items-center justify-center'
      onClick={handleAddClick}
    >
      <div className='p-2 relative flex items-center justify-start bg-white/10 rounded-md cursor-pointer hover:bg-white/20 w-[34px] h-[34px] overflow-hidden hover:w-fit group'>
        <HiOutlinePlus className='min-w-fit' size={18} />
        <div className='w-0 overflow-hidden group-hover:w-auto whitespace-nowrap ml-0 group-hover:ml-2 duration-300 ease-out text-sm'>
          Create new fragment
        </div>
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
