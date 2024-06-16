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
    <div className='w-full flex h-full items-center justify-center'>
      <form onSubmit={handleSubmit} className='w-full'>
        <input
          ref={searchTermRef}
          type='text'
          name='searchTerm'
          id='searchTerm'
          placeholder='type content tag (e.g. aliens, archive) and hit enter'
          className='bg-slate-700 text-white px-4 py-2 rounded-lg w-full outline-none text-center'
        />
      </form>
    </div>
  );
}
