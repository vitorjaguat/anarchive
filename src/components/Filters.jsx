import { VscClose } from 'react-icons/vsc';
import { FiFilter } from 'react-icons/fi';
import { TbChartDots3 } from 'react-icons/tb';
import { useContext } from 'react';
import { MainContext } from '@/context/mainContext';

export default function Filters({ filter, setFilter }) {
  const { view, constellations, changeConstellations } =
    useContext(MainContext);

  if (view !== 'graph') return null; // Only show filters in graph view
  const hasConstellations = constellations && constellations.length > 0;
  const hasFilters = filter && filter.length > 0;
  if (!hasConstellations && !hasFilters) return null; // Don't render if nothing is applied

  return (
    <div className='fixed top-[126px] left-3 z-50 w-full pointer-events-none'>
      <div className={'flex flex-col gap-[4px] flex-wrap  '}>
        {(constellations || []).map((c) => (
          <div
            key={c}
            className='bg-slate-500/40 hover:bg-slate-400/40 transition-colors duration-300 text-sph-green px-2 h-[34px] rounded-md flex justify-between items-center gap-2 pointer-events-auto w-fit'
          >
            <div className='flex gap-3 items-center'>
              <TbChartDots3 size={14} />
              <span className='text-sm whitespace-nowrap font-light translate-y-[1px]'>
                {c}
              </span>
            </div>

            <div
              className='cursor-pointer'
              onClick={() =>
                changeConstellations(
                  constellations.filter((term) => term !== c)
                )
              }
            >
              <VscClose color='var(--color-sph-green)' />
            </div>
          </div>
        ))}
        {(filter || []).map((f) => (
          <div
            key={f}
            className='bg-slate-500/40 hover:bg-slate-400/40 transition-colors duration-300 text-sph-green px-2 h-[34px] rounded-md flex justify-between items-center gap-2 pointer-events-auto w-fit'
          >
            <div className='flex gap-3 items-center'>
              <FiFilter size={14} />
              <span className='text-sm whitespace-nowrap font-light translate-y-[1px]'>
                {f}
              </span>
            </div>

            <div
              className='cursor-pointer'
              onClick={() =>
                setFilter((curr) => curr.filter((term) => term !== f))
              }
            >
              <VscClose
                color='var(--color-sph-green)'
                // color='#f1f1f1'
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
