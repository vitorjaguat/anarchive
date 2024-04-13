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
        className='tracking-widest flex leading-4 z-[1000] hover:text-slate-400 duration-300 cursor-help items-end'
        onMouseEnter={() => setInfoVisible(true)}
        // onMouseLeave={() => setInfoVisible(false)}
      >
        <div className='flex flex-col'>
          <div>The</div>
          <div>Anarchiving</div>
          <div>Game</div>
        </div>
      </div>

      <div
        className='px-4 cursor-help'
        onClick={() => setInfoVisible(!infoVisible)}
      >
        <GoQuestion size={16} />
      </div>

      <SelectSort
        setSort={setSort}
        sort={sort}
        setShowMineIsChecked={setShowMineIsChecked}
        showMineIsChecked={showMineIsChecked}
      />
      <Search allTokens={allTokens} setFilter={setFilter} />
      <ConnectButton />
    </div>
  );
}
