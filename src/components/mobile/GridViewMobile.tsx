import GridViewItemMobile from './GridViewItemMobile';
import GridOpenToken from './GridOpenToken';
import { useContext, useState, useEffect } from 'react';
import { MainContext } from '@/context/mainContext';
import { useIsMobile } from '@/utils/useIsMobile';
import { useRouter } from 'next/router';
import useIsMounted from '@/utils/useIsMounted';
import { BiSort } from 'react-icons/bi';
import InfoButtonMobile from './InfoButtonMobile';
import InfoModalMobile from './InfoModalMobile';

export default function GridViewMobile({
  allTokens,
  showMineIsChecked,
  usersFrags,
}) {
  const { openToken, changeOpenToken } = useContext(MainContext);
  const isMobile = useIsMobile();
  const router = useRouter();
  const mounted = useIsMounted();
  const [infoMobile, setInfoMobile] = useState(false);

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

  //   sort
  const [sortGrid, setSortGrid] = useState('DESC');
  const [tokens, setTokens] = useState(
    [...allTokens].sort(
      (a, b) => Number(b.token.tokenId) - Number(a.token.tokenId)
    )
  );
  useEffect(() => {
    if (sortGrid === 'ASC') {
      setTokens(
        [...allTokens].sort(
          (a, b) => Number(a.token.tokenId) - Number(b.token.tokenId)
        )
      );
    } else {
      setTokens(
        [...allTokens].sort(
          (a, b) => Number(b.token.tokenId) - Number(a.token.tokenId)
        )
      );
    }
  }, [allTokens, showMineIsChecked, sortGrid]);

  const handleClickSort = () => {
    setSortGrid((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  if (!allTokens || allTokens.length === 0 || !mounted) return null;

  return (
    <div className='relative flex flex-col items-center w-full p-2 max-h-[calc(100dvh-72px)] overflow-y-hidden'>
      <div className='flex w-full justify-between z-10 mb-2'>
        {/* APP INFO MOBILE */}
        <InfoButtonMobile
          infoVisible={infoMobile}
          setInfoVisible={setInfoMobile}
        />
        {/* SORT TOGLE */}
        <div
          className={
            'w-[34px] aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md  ' +
            (sortGrid === 'DESC' ? 'border-[1px] border-slate-600' : '')
          }
        >
          <button
            title='Sort by date'
            className='cursor-pointer'
            onClick={handleClickSort}
          >
            <BiSort size={20} className='text-[#A0A0FF]' />
          </button>
        </div>
      </div>
      {/* GRID */}
      <div className='relative w-full overflow-y-auto'>
        <div className='w-full flex flex-col gap-4 pb-40'>
          {!showMineIsChecked ? (
            tokens.map((token, i) => {
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
        </div>
      </div>
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
      {/* OPEN TOKEN MODAL */}
      {openToken && isMobile && (
        <GridOpenToken onClose={handleClose} token={openToken} />
      )}

      {/* APP INFO MODAL */}
      {!openToken && isMobile && infoMobile && (
        <InfoModalMobile onClose={() => setInfoMobile(false)} />
      )}
    </div>
  );
}
