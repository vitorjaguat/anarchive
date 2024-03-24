import { ConnectButton } from '@rainbow-me/rainbowkit';
import Search from './Search';

export default function Navbar({ tokens }) {
  return (
    <div className='w-full flex justify-between items-center bg-slate-800 p-4 select-none h-[100px] z-[1000]'>
      <div className=''>The Anarchiving Game</div>
      <Search tokens={tokens} />
      <ConnectButton />
    </div>
  );
}
