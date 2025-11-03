import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import AppInfoBox from './AppInfoBox';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/utils/useIsMobile';
import NavbarMobile from './mobile/NavbarMobile';
import InfoButton from './InfoButton';

export default function Layout({
  children,
  allTokens,
  allTags,
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

          <InfoButton
            setInfoVisible={setInfoVisible}
            infoVisible={infoVisible}
          />
          <AppInfoBox
            setInfoVisible={setInfoVisible}
            infoVisible={infoVisible}
          />

          <div className='absolute bottom-0 left-0 right-0 z-[1999]'>
            <Navbar
              allTokens={allTokens}
              allTags={allTags}
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
