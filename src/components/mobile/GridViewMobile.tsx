import GridViewItemMobile from './GridViewItemMobile';
import GridOpenToken from './GridOpenToken';
import { useContext } from 'react';
import { MainContext } from '@/context/mainContext';
import { useIsMobile } from '@/utils/useIsMobile';
import { useRouter } from 'next/router';
import useIsMounted from '@/utils/useIsMounted';

export default function GridViewMobile({
  allTokens,
  showMineIsChecked,
  usersFrags,
}) {
  const { openToken, changeOpenToken } = useContext(MainContext);
  const isMobile = useIsMobile();
  const router = useRouter();
  const mounted = useIsMounted();

  const handleClose = () => {
    // Remove the fragment query parameter
    const newQuery = { ...router.query };
    delete newQuery.fragment;
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
    changeOpenToken(null);
  };

  if (!allTokens || allTokens.length === 0 || !mounted) return null;

  return (
    <div className='relative flex flex-col items-center w-full gap-4 p-2 pb-[90px]'>
      {/* BG */}
      <div className='site-background'>
        <div className='star-container'>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>
      </div>
      {!showMineIsChecked ? (
        allTokens.map((token, i) => {
          return <GridViewItemMobile key={i} token={token} />;
        })
      ) : !usersFrags || usersFrags.length === 0 ? (
        <div className='w-full flex items-center justify-center text-sm text-gray-400'>
          No fragments found.
        </div>
      ) : (
        usersFrags.map((token, i) => {
          return <GridViewItemMobile key={i} token={token} />;
        })
      )}
      {/* OPEN TOKEN MODAL */}
      {openToken && isMobile && (
        <GridOpenToken onClose={handleClose} token={openToken} />
      )}
    </div>
  );
}
