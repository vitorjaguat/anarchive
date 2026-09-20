import { PiGraphLight } from 'react-icons/pi';
import { CiGrid41 } from 'react-icons/ci';

export default function GraphGridToggle({
  view,
  changeView,
}: {
  view: 'graph' | 'grid';
  changeView: (view: string) => void;
}) {
  const handleClickGraph = () => {
    if (view === 'graph') return;
    changeView('graph');
  };

  const handleClickGrid = () => {
    if (view === 'grid') return;
    changeView('grid');
  };

  return (
    <div className='flex flex-col items-start gap-1'>
      <button
        className='group grid grid-cols-[34px_0fr] hover:grid-cols-[34px_1fr] items-center cursor-pointer rounded-md bg-slate-500/40 hover:bg-slate-900/90 h-[34px] overflow-hidden transition-[grid-template-columns,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
        onClick={handleClickGraph}
      >
        <div
          className={
            'flex items-center justify-center h-[34px] rounded-md border-[1px] ' +
            (view === 'graph' ? 'border-slate-600' : 'border-transparent')
          }
        >
          <PiGraphLight size={24} className='text-[#A0A0FF]' />
        </div>
        <div className='overflow-hidden'>
          <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap pl-2 pr-3 text-sm'>
            Graph view
          </div>
        </div>
      </button>
      <button
        className='group grid grid-cols-[34px_0fr] hover:grid-cols-[34px_1fr] items-center cursor-pointer rounded-md bg-slate-500/40 hover:bg-slate-900/90 h-[34px] overflow-hidden transition-[grid-template-columns,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
        onClick={handleClickGrid}
      >
        <div
          className={
            'flex items-center justify-center h-[34px] rounded-md border-[1px] ' +
            (view === 'grid' ? 'border-slate-600' : 'border-transparent')
          }
        >
          <CiGrid41 size={24} className='text-[#A0A0FF]' />
        </div>
        <div className='overflow-hidden'>
          <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap pl-2 pr-3 text-sm'>
            Grid view
          </div>
        </div>
      </button>
    </div>
  );
}
