import { useState, useEffect } from 'react';

export default function EditionSize({ editionSize, setEditionSize }) {
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
    // <div className='flex flex-col gap-2 mt-5'>
    <>
      <div className=''>
        <label htmlFor='editionSize'>Edition size: </label>
        <select
          className='w-full px-4 py-3 rounded-lg outline-none font-thin'
          id='editionSize'
          name='editionSize'
          defaultValue={'unlimited'}
          onChange={handleUnlimitedLimited}
        >
          <option value='unlimited'>Unlimited</option>
          <option value='limited'>Limited</option>
        </select>
      </div>
      {!isUnlimited && (
        <div className=''>
          <label htmlFor='editionSizeNumber'>Max number of copies:</label>
          <input
            className='w-full px-4 py-3 rounded-lg outline-none font-thin'
            // ref={priceRef}
            type='number'
            id='editionSizeNumber'
            name='editionSizeNumber'
            defaultValue='1000'
            step={1}
            onChange={handleChangeEditionSize}
          />
        </div>
      )}
    </>
    // </div>
  );
}
