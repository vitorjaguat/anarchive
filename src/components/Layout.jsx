import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import AppInfoBox from './AppInfoBox';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/utils/useIsMobile';
import NavbarMobile from './mobile/NavbarMobile';

export default function Layout({
  children,
  allTokens,
  sort,
  changeSort,
  filter,
  setFilter,
  showMineIsChecked,
  setShowMineIsChecked,
}) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [infoVisible, setInfoVisible] = useState(false);

  if (isMounted && isMobile)
    return (
      // <div className='flex flex-col items-center justify-center h-screen px-10 text-center'>
      //   <h1 className='text-xl'>
      //     The Anarchiving Game is currently unavailable on mobile devices.
      //     Please open on a desktop computer to enjoy the full experience.
      //   </h1>
      // </div>
      <div className='relative w-screen h-screen overflow-scroll'>
        <div className=''>{children}</div>
        <NavbarMobile
          showMineIsChecked={showMineIsChecked}
          setShowMineIsChecked={setShowMineIsChecked}
        />
      </div>
    );

  if (isMounted && !isMobile && pathname === '/')
    return (
      <>
        <div className='relative w-screen h-screen'>
          <div>{children}</div>

          <AppInfoBox
            setInfoVisible={setInfoVisible}
            infoVisible={infoVisible}
          />

          <div className='absolute bottom-0 left-0 right-0 z-[1999]'>
            <Navbar
              allTokens={allTokens}
              sort={sort}
              changeSort={changeSort}
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

  return <>{children}</>;
}
