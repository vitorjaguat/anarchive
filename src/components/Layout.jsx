import Navbar from './Navbar';
import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Check initial window size

    window.addEventListener('resize', handleResize); // Add event listener for window resize

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up event listener on component unmount
    };
  }, []);
  const [infoVisible, setInfoVisible] = useState(false);

  if (isMobile)
    return (
      <div className='flex flex-col items-center justify-center h-screen px-10 text-center'>
        <h1 className='text-xl'>
          The Anarchiving Game is currently unavailable on mobile devices.
          Please open on a desktop computer to enjoy the full experience.
        </h1>
      </div>
    );

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
