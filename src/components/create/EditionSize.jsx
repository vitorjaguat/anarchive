import { useState } from 'react';

export default function EditionSize({ setEditionSize }) {
  const [isUnlimited, setIsUnlimited] = useState(true);

  const handleUnlimitedLimited = (e) => {
    if (e.target.value === 'unlimited') {
      setIsUnlimited(true);
      setEditionSize(BigInt('18446744073709551615'));
    } else {
      setIsUnlimited(false);
      setEditionSize(BigInt('1000'));
    }
  };

  const handleChangeEditionSize = (e) => {
    setEditionSize(BigInt(e.target.value));
  };

  return (
    <>
      <div className=''>
        <label htmlFor='editionSize'>Edition size: </label>
        <div className='relative w-full'>
          <select
            className='w-full px-4 py-3 pr-10 rounded-lg outline-none font-thin bg-slate-800 text-slate-200 appearance-none'
            id='editionSize'
            name='editionSize'
            defaultValue={'unlimited'}
            onChange={handleUnlimitedLimited}
          >
            <option value='unlimited'>Unlimited</option>
            <option value='limited'>Limited</option>
          </select>
          {/* Custom arrow */}
          <div className='pointer-events-none absolute inset-y-0 right-2 md:right-4 flex items-center'>
            <svg
              className='w-4 h-4 text-slate-200'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              viewBox='0 0 24 24'
            >
              <path d='M19 9l-7 7-7-7' />
            </svg>
          </div>
        </div>
      </div>
      {!isUnlimited && (
        <div className=''>
          <label htmlFor='editionSizeNumber'>Max number of copies:</label>
          <input
            className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
            type='number'
            id='editionSizeNumber'
            name='editionSizeNumber'
            defaultValue='1000'
            step={1}
            min={1}
            onChange={handleChangeEditionSize}
          />
        </div>
      )}
    </>
  );
}
