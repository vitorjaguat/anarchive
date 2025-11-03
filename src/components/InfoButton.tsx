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
      className='absolute top-3 left-3 flex items-center justify-center cursor-help z-10 p-2 rounded-md bg-white/10 hover:bg-white/20 w-[34px] h-[34px]'
      onClick={() => setInfoVisible(!infoVisible)}
    >
      <AiOutlineInfo size={18} />
    </div>
  );
}
