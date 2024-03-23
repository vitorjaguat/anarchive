import { useRef, useState } from 'react';

export default function Search() {
  const searchTermRef = useRef('');

  return (
    <div className=''>
      <input
        ref={searchTermRef}
        type='text'
        name='searchTerm'
        id='searchTerm'
        placeholder='search...'
        className='bg-slate-700 text-white px-4 py-2 rounded-lg w-96 outline-none'
      />
    </div>
  );
}
