import { ConnectButton } from '@rainbow-me/rainbowkit';
import Search from './Search';
import SelectSort from './SelectSort';

export default function Navbar({
  allTokens,
  sort,
  setSort,
  filter,
  setFilter,
  showMineIsChecked,
  setShowMineIsChecked,
}) {
  return (
    <div className='w-full flex justify-between items-center bg-slate-800 p-4 select-none h-[100px] z-[1000]'>
      <div className=''>The Anarchiving Game</div>

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
