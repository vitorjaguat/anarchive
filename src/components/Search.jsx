import { useRef, useState } from 'react';

export default function Search({ allTokens, setFilter }) {
  const searchTermRef = useRef('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchTerm = searchTermRef.current.value;
    setFilter((curr) => [...curr, searchTerm.trim()]);
    searchTermRef.current.value = '';
  };

  return (
    <div className=''>
      <form onSubmit={handleSubmit}>
        <input
          ref={searchTermRef}
          type='text'
          name='searchTerm'
          id='searchTerm'
          placeholder='type content tag and hit enter'
          className='bg-slate-700 text-white px-4 py-2 rounded-lg w-96 outline-none text-center'
        />
      </form>
    </div>
  );
}
