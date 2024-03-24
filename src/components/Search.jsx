import { useRef, useState } from 'react';

export default function Search({ tokens }) {
  const searchTermRef = useRef('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchTerm = searchTermRef.current.value;
    const filteredTokens = tokens.filter((token) =>
      token.token.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log(filteredTokens);
  };

  return (
    <div className=''>
      <form onSubmit={handleSubmit}>
        <input
          ref={searchTermRef}
          type='text'
          name='searchTerm'
          id='searchTerm'
          placeholder='search...'
          className='bg-slate-700 text-white px-4 py-2 rounded-lg w-96 outline-none'
        />
      </form>
    </div>
  );
}
