import { ReservoirToken } from '../../../types/tokens';
import GridViewItemMobile from '../mobile/GridViewItemMobile';
// import { Masonry } from 'react-plock';
import dynamic from 'next/dynamic';
import useIsMounted from '@/utils/useIsMounted';
import { useEffect, useState } from 'react';
import { TbArrowsSort } from 'react-icons/tb';
import { BiSort } from 'react-icons/bi';

const Masonry = dynamic(
  () => import('react-plock').then((mod) => mod.Masonry),
  { ssr: false }
);

interface GridProps {
  allTokens: ReservoirToken[];
  showMineIsChecked: boolean;
  usersFrags: ReservoirToken[];
  sort: string;
  filter: string[];
}
export default function Grid({
  allTokens,
  showMineIsChecked,
  usersFrags,
  sort,
  filter,
}: GridProps) {
  const mounted = useIsMounted();

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
    <div className='flex flex-col items-center w-full pt-3 h-full overflow-y-auto'>
      {/* SORT TOGLE */}
      <div className='flex w-full justify-center z-10 mb-2'>
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
      <div className='relative w-full  overflow-y-auto px-14'>
        <div className=' w-full pb-40 '>
          {!showMineIsChecked ? (
            <Masonry
              items={tokens}
              config={{
                columns: [2, 3, 4],
                gap: [24, 32, 40],
                media: [1024, 1280, 1536],
                useBalancedLayout: true,
              }}
              as='div'
              render={(token: ReservoirToken, i: number) => (
                <GridViewItemMobile key={i} token={token} />
              )}
            />
          ) : !usersFrags || usersFrags.length === 0 ? (
            <div className='w-full flex items-center justify-center text-sm text-gray-400'>
              No fragments found.
            </div>
          ) : (
            <Masonry
              items={usersFrags}
              config={{
                columns: [2, 3, 4],
                gap: [16, 16, 16],
                media: [1024, 1280, 1536],
                useBalancedLayout: true,
              }}
              as='div'
              render={(token: ReservoirToken, i: number) => (
                <GridViewItemMobile key={i} token={token} />
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
