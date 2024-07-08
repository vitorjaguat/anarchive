import { BsLink } from 'react-icons/bs';
import { useState } from 'react';

export default function CopyURLButton() {
  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    }
  };
  return (
    <div
      className={
        'mt-1 w-fit flex items-center gap-1 text-xs rounded-md px-2 py-[2px] bg-[#8989dc]/20 hover:bg-[#8989dc]/40 duration-300 cursor-grab ' +
        (copied && 'bg-[#00ff20]/10 hover:bg-[#00ff20]/20')
      }
      onClick={handleCopyLink}
    >
      <BsLink size='16' />
      <div className='font-thin'>{!copied ? 'copy URL' : 'copied!'}</div>
    </div>
  );
}
