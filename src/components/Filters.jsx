import { VscClose } from 'react-icons/vsc';

export default function Filters({ filter, setFilter }) {
  console.log(filter);
  return (
    <div className='absolute top-4 left-4 z-[4]'>
      <div className=''>
        {filter.map((f) => (
          <div
            key={f}
            className='bg-slate-600/50 text-white px-3 py-1 rounded-md flex justify-between items-center gap-2 mb-1'
          >
            {f}
            <div
              className='pl-1'
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
