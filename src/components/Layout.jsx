import Navbar from './Navbar';
import { useState } from 'react';
import AppInfoBox from './AppInfoBox';

export default function Layout({
  children,
  allTokens,
  sort,
  setSort,
  filter,
  setFilter,
  showMineIsChecked,
  setShowMineIsChecked,
}) {
  const [infoVisible, setInfoVisible] = useState(false);
  return (
    <>
      <div className='relative w-screen h-screen'>
        <div>{children}</div>

        {infoVisible && <AppInfoBox />}

        <div className='absolute bottom-0 left-0 right-0 z-[1999]'>
          <Navbar
            allTokens={allTokens}
            sort={sort}
            setSort={setSort}
            filter={filter}
            setFilter={setFilter}
            showMineIsChecked={showMineIsChecked}
            setShowMineIsChecked={setShowMineIsChecked}
            setInfoVisible={setInfoVisible}
            infoVisible={infoVisible}
          />
        </div>
      </div>
    </>
  );
}
