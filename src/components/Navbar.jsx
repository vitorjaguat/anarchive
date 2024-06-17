import { ConnectButton } from '@rainbow-me/rainbowkit';
import Search from './Search';
import SelectSort from './SelectSort';
import { GoQuestion } from 'react-icons/go';

export default function Navbar({
  allTokens,
  sort,
  setSort,
  filter,
  setFilter,
  showMineIsChecked,
  setShowMineIsChecked,
  setInfoVisible,
  infoVisible,
}) {
  return (
    <div className='w-full flex justify-between items-center bg-slate-800 p-4 select-none h-[100px] z-[1000]'>
      <div
        className='tracking-widest flex leading-4 z-[1000] hover:text-slate-400 duration-300 cursor-help items-center pr-20'
        onMouseEnter={() => setInfoVisible(true)}
        // onMouseLeave={() => setInfoVisible(false)}
      >
        <div className='flex flex-col'>
          <div>The</div>
          <div>Anarchiving</div>
          <div>Game</div>
        </div>

        <div
          className='h-full flex items-center px-4 cursor-help'
          onClick={() => setInfoVisible(!infoVisible)}
        >
          <GoQuestion size={16} />
        </div>
      </div>

      <div className='flex w-full h-full gap-6'>
        <div className=''>
          <SelectSort
            setSort={setSort}
            sort={sort}
            setShowMineIsChecked={setShowMineIsChecked}
            showMineIsChecked={showMineIsChecked}
          />
        </div>
        <div style={{ flex: 2 }} className='flex-2'>
          <Search allTokens={allTokens} setFilter={setFilter} />
        </div>
        <div className='flex h-full items-center'>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
