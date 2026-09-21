import { PiGraphLight } from 'react-icons/pi';
import { CiGrid41 } from 'react-icons/ci';

export default function GraphGridToggle({
  view,
  changeView,
}: {
  view: 'graph' | 'grid';
  changeView: (view: string) => void;
}) {
  const handleClick = () => {
    changeView(view === 'graph' ? 'grid' : 'graph');
  };

  return (
    <button
      className='group grid grid-cols-[34px_0fr] hover:grid-cols-[34px_1fr] items-center cursor-pointer rounded-md bg-slate-500/40 hover:bg-slate-400/40 h-[34px] overflow-hidden transition-[grid-template-columns,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
      onClick={handleClick}
    >
      <div className='flex items-center justify-center h-[34px] rounded-md'>
        {view === 'graph' ? (
          <CiGrid41 size={24} className='text-[#A0A0FF]' />
        ) : (
          <PiGraphLight size={24} className='text-[#A0A0FF]' />
        )}
      </div>
      <div className='overflow-hidden'>
        <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap pl-2 pr-3 text-sm'>
          {view === 'graph' ? 'Grid view' : 'Graph view'}
        </div>
      </div>
    </button>
  );
}
