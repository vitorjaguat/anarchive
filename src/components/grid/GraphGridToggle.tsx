import { PiGraphLight } from 'react-icons/pi';
import { CiGrid41 } from 'react-icons/ci';

export default function GraphGridToggle({
  view,
  setView,
}: {
  view: 'graph' | 'grid';
  setView: (view: string) => void;
}) {
  const handleClickGraph = () => {
    if (view === 'graph') return;
    setView('graph');
  };

  const handleClickGrid = () => {
    if (view === 'grid') return;
    setView('grid');
  };

  return (
    <div className='absolute top-3 right-3 flex flex-col gap-3 z-[11]'>
      <div
        className={
          'w-[34px] aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md ' +
          (view === 'graph' ? 'border-[1px] border-slate-600' : '')
        }
      >
        <button
          title='Graph view'
          className='cursor-pointer'
          onClick={handleClickGraph}
        >
          <PiGraphLight size={24} className='text-[#A0A0FF]' />
        </button>
      </div>
      <div
        className={
          'w-[34px] aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md ' +
          (view === 'grid' ? 'border-[1px] border-slate-600' : '')
        }
      >
        <button
          title='Grid view'
          className='cursor-pointer'
          onClick={handleClickGrid}
        >
          <CiGrid41 size={24} className='text-[#A0A0FF]' />
        </button>
      </div>
    </div>
  );
}
