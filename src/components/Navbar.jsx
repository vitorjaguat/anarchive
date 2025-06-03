import Search from './Search';
import SelectSort from './SelectSort';
import { GoQuestion } from 'react-icons/go';
import { useContext } from 'react';
import { MainContext } from '@/context/mainContext';
import ConnectBtn from './ConnectButton';
import SelectTag from './SelectTag';

export default function Navbar({
  allTokens,
  allTags,
  sort,
  changeSort,
  filter,
  setFilter,
  showMineIsChecked,
  setShowMineIsChecked,
  setInfoVisible,
  infoVisible,
}) {
  const { view } = useContext(MainContext);

  return (
    <div className='w-full flex justify-between items-center p-4 select-none h-[100px] z-[1000] backdrop-blur-[6px] bg-slate-800/20'>
      <div
        className='tracking-widest flex leading-4 z-[1000] hover:text-slate-400 duration-300 cursor-help items-center pr-20'
        onMouseEnter={() => setInfoVisible(true)}
        // onMouseLeave={() => setInfoVisible(false)}
      >
        <div className='flex flex-col text-white'>
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

      <div className='flex justify-end w-full h-full gap-10'>
        {view === 'graph' && (
          <div className='min-w-[130px]'>
            <SelectSort
              changeSort={changeSort}
              sort={sort}
              setShowMineIsChecked={setShowMineIsChecked}
              showMineIsChecked={showMineIsChecked}
            />
          </div>
        )}
        {/* <Search allTokens={allTokens} setFilter={setFilter} /> */}
        {view === 'graph' && (
          <SelectTag allTags={allTags} setFilter={setFilter} filter={filter} />
        )}
        <div className='connect-btn flex h-full items-center font-thin  min-w-[150px]'>
          <ConnectBtn />
        </div>
      </div>
    </div>
  );
}
