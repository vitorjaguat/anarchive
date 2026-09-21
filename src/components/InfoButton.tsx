import { GoQuestion } from 'react-icons/go';
import { IoMdInformation } from 'react-icons/io';
import { FaInfo } from 'react-icons/fa6';
import { AiOutlineInfo } from 'react-icons/ai';

interface InfoButtonProps {
  infoVisible: boolean;
  setInfoVisible: (boolean) => void;
}
export default function InfoButton({
  infoVisible,
  setInfoVisible,
}: InfoButtonProps) {
  return (
    <div
      className='group grid grid-cols-[34px_0fr] hover:grid-cols-[34px_1fr] items-center cursor-help rounded-md bg-slate-500/40 hover:bg-slate-400/40 h-[34px] overflow-hidden transition-[grid-template-columns,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
      onClick={() => setInfoVisible(!infoVisible)}
    >
      <div className='flex items-center justify-center'>
        <AiOutlineInfo size={18} />
      </div>
      <div className='overflow-hidden'>
        <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap pl-2 pr-3 text-sm'>
          About
        </div>
      </div>
    </div>
  );
}
