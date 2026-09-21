import { BiSort } from 'react-icons/bi';

export default function SortToggleGrid({
  sortGrid,
  changeSortGrid,
}: {
  sortGrid: 'ASC' | 'DESC';
  changeSortGrid: (sortGrid: string) => void;
}) {
  const handleClickSort = () => {
    changeSortGrid(sortGrid === 'ASC' ? 'DESC' : 'ASC');
  };

  return (
    <button
      className='group grid grid-cols-[34px_0fr] hover:grid-cols-[34px_1fr] items-center cursor-pointer rounded-md bg-slate-500/40 hover:bg-slate-400/40 h-[34px] overflow-hidden transition-[grid-template-columns,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
      onClick={handleClickSort}
    >
      <div
        className={
          'flex items-center justify-center h-[34px] rounded-md border-[1px] ' +
          (sortGrid === 'DESC' ? 'border-transparent' : 'border-slate-600')
        }
      >
        <BiSort size={20} className='text-[#A0A0FF]' />
      </div>
      <div className='overflow-hidden'>
        <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap pl-2 pr-3 text-sm'>
          {sortGrid === 'DESC' ? 'Show oldest first' : 'Show newest first'}
        </div>
      </div>
    </button>
  );
}
