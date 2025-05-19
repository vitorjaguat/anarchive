import { HiPlus } from 'react-icons/hi';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import useIsMounted from '@/utils/useIsMounted';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { BsFillPlusCircleFill } from 'react-icons/bs';

export default function CreateTokenButtonMobile() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const isMounted = useIsMounted();

  const handleAddClick = () => {
    if (isConnected) {
      router.push('/create');
    } else {
      openConnectModal?.();
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className='flex items-center justify-center' onClick={handleAddClick}>
      <div className='p-2 relative flex items-center justify-center bg-white/10 rounded-full cursor-pointer w-[34px] h-[34px] overflow-hidden '>
        <HiPlus className='min-w-fit' size={20} color='#A0A0FF' />
      </div>
    </div>
  );
}
