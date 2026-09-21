import SelectSort from './SelectSort';
import { useContext } from 'react';
import { MainContext } from '@/context/mainContext';
import ConnectBtn from './ConnectButton';
import SelectTag from './SelectTag';
import ConstellationsBtn from './ConstellationsBtn';

export default function Navbar({
  allTags,
  sort,
  changeSort,
  filter,
  setFilter,
  showMineIsChecked,
  setShowMineIsChecked,
}) {
  const { view, constellations, changeConstellations } =
    useContext(MainContext);

  return (
    <div className='w-full flex justify-between items-center p-4 select-none h-[90px] z-[1000] backdrop-blur-[6px] bg-slate-800/50 border-t-[1px] border-t-slate-700/50'>
      <div
        className='tracking-widest flex leading-[17px] z-[1000] hover:text-slate-400 duration-300 items-center min-w-[150px] w-[150px] text-[17px]'
        // onMouseEnter={() => setInfoVisible(true)}
        // onMouseLeave={() => setInfoVisible(false)}
      >
        <div className='flex flex-col text-white'>
          <div>The</div>
          <div>Anarchiving</div>
          <div>Game</div>
        </div>
      </div>

      <div className='flex justify-center gap-10 w-full h-full'>
        <div className='w-[220px]'>
          <ConstellationsBtn
            constellations={constellations}
            changeConstellations={changeConstellations}
            showMineIsChecked={showMineIsChecked}
            setShowMineIsChecked={setShowMineIsChecked}
          />
        </div>
        <div className='w-[500px]'>
          <SelectTag allTags={allTags} setFilter={setFilter} filter={filter} />
        </div>
        <div className='w-[220px]'>
          <SelectSort changeSort={changeSort} sort={sort} view={view} />
        </div>
      </div>
      <div className='connect-btn flex h-full items-center font-thin  min-w-[150px]'>
        <ConnectBtn />
      </div>
    </div>
  );
}
