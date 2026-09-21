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
    <div className='flex items-center justify-center' onClick={handleAddClick}>
      <div className='group grid grid-cols-[34px_0fr] hover:grid-cols-[34px_1fr] items-center bg-slate-500/40 rounded-md cursor-pointer hover:bg-slate-700/90 h-[34px] overflow-hidden transition-[grid-template-columns,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'>
        <div className='flex items-center justify-center'>
          <HiOutlinePlus size={18} />
        </div>
        <div className='overflow-hidden'>
          <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap pl-2 pr-3 text-sm'>
            Create new fragment
          </div>
        </div>
      </div>
    </div>
  );
}
