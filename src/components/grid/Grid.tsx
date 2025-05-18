import { ReservoirToken } from '../../../types/tokens';
import GridViewItemMobile from '../mobile/GridViewItemMobile';
// import { Masonry } from 'react-plock';
import dynamic from 'next/dynamic';
import useIsMounted from '@/utils/useIsMounted';
import { useState } from 'react';

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

  const [sortGrid, setSortGrid] = useState('ASC');

  if (!allTokens || allTokens.length === 0 || !mounted) return null;

  return (
    <div className='flex flex-col items-center w-full pt-3'>
      {/* SORT TOGLE */}
      <div className='bg-white/10'></div>
      {/* GRID */}
      <div className='relative w-full  overflow-y-auto px-14'>
        <div className=' w-full pb-40 '>
          {!showMineIsChecked ? (
            <Masonry
              items={allTokens}
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
