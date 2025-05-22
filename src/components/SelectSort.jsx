export default function SelectSort({
  changeSort,
  sort,
  setShowMineIsChecked,
  showMineIsChecked,
}) {
  return (
    <div className='w-full h-full flex flex-col justify-center'>
      <select
        value={sort}
        name='sort'
        id='sort'
        className='text-black text-sm font-thin px-3 flex items-center py-0 bg-slate-400 rounded-md w-full outline-none max-w-32'
        onChange={(e) => changeSort(e.target.value)}
        // style={{
        //   transition: 'all 0.3s ease',
        //   cursor: 'pointer',
        //   boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        // }}
      >
        <option value='none'>--Choose a trait--</option>
        <option value='none'>None</option>
        <option value='From'>From</option>
        <option value='To'>To</option>
        <option value='Creator'>Creator</option>
        <option value='Media'>Media</option>
        <option value='Event'>Event</option>
        <option value='Location'>Location</option>
        <option value='Year'>Year</option>
      </select>
      <div className='mt-1 flex items-center w-full justify-end'>
        <input
          className='rounded-full h-3 w-3 appearance-none bg-slate-400 checked:bg-slate-600 border-2 border-slate-400 checked:border-slate-400 checked:border-2 checked:rounded-full checked:shadow-inner focus:outline-none focus:ring-1 focus:ring-slate-400 focus:ring-opacity-50'
          type='checkbox'
          name='link-users-frags'
          id='link-users-frags'
          checked={showMineIsChecked}
          onChange={() =>
            setShowMineIsChecked(
              (prevShowMineIsChecked) => !prevShowMineIsChecked
            )
          }
        />
        <label
          className='ml-2 mb-[-2px] text-xs font-thin text-slate-300'
          htmlFor='link-users-frags'
        >
          Show collected
        </label>
      </div>
    </div>
  );
}
