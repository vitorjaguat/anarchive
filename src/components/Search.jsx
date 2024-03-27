import { useRef, useState } from 'react';

export default function Search({ allTokens, setFilter }) {
  const searchTermRef = useRef('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchTerm = searchTermRef.current.value;
    const filteredTokens = allTokens.filter((token) =>
      token.token.attributes
        .find((att) => att.key === 'Content Tags')
        .value.toLowerCase()
        .trim()
        .includes(searchTerm.toLowerCase().trim())
    );
    setFilter((curr) => [...curr, searchTermRef.current.value.trim()]);
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
