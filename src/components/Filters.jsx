import { VscClose } from 'react-icons/vsc';
import { FiFilter } from 'react-icons/fi';

export default function Filters({ filter, setFilter }) {
  // console.log(filter);
  return (
    <div className='absolute top-3 left-0 z-[4] w-full'>
      <div className='px-16 flex gap-2 flex-wrap justify-center'>
        {filter.map((f) => (
          <div
            key={f}
            className='bg-slate-600/50 text-white px-3 py-1 rounded-md flex justify-between items-center gap-2 mb-1'
          >
            <div className='flex gap-3 items-center'>
              <FiFilter size={14} />
              <span className='text-sm whitespace-nowrap font-light translate-y-[1px]'>
                {f}
              </span>
            </div>

            <div
              className='pl-1 cursor-pointer'
              onClick={() =>
                setFilter((curr) => curr.filter((term) => term !== f))
              }
            >
              <VscClose color='#f1f1f1' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
