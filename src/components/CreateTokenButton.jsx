import { useConnectModal } from '@rainbow-me/rainbowkit';
import { HiOutlinePlus } from 'react-icons/hi';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import useIsMounted from '@/utils/useIsMounted';

export default function CreateTokenButton() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const handleAddClick = () => {
    if (isConnected) {
      router.push('/create');
    } else {
      openConnectModal();
    }
  };

  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className='absolute top-3 left-3 flex items-center justify-center z-10'
      onClick={handleAddClick}
    >
      <div className='p-2 relative flex items-center justify-start bg-white/10 rounded-md cursor-pointer hover:bg-white/20 w-[34px] h-[34px] overflow-hidden hover:w-fit group'>
        <HiOutlinePlus className='min-w-fit' size={18} />
        <div className='w-0 overflow-hidden group-hover:w-auto whitespace-nowrap ml-0 group-hover:ml-2 duration-300 ease-out text-sm'>
          Create new fragment
        </div>
      </div>
    </div>
  );
}
