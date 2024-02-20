import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <div className='w-full flex justify-between items-center bg-slate-800/95 p-4 select-none h-[100px]'>
      <div className=''>The Anarchiving Game</div>
      <ConnectButton />
    </div>
  );
}
