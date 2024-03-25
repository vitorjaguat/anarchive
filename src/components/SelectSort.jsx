export default function SelectSort({
  setSort,
  sort,
  setShowMineIsChecked,
  showMineIsChecked,
}) {
  return (
    <div className=''>
      <select
        value={sort}
        name='sort'
        id='sort'
        className='text-black text-sm px-4 py-1 bg-slate-400 rounded-md w-40 outline-none'
        onChange={(e) => setSort(e.target.value)}
      >
        <option value='none'>--Choose a trait--</option>
        <option value='none'>None</option>
        <option value='From'>From</option>
        <option value='To'>To</option>
        <option value='Creator'>Creator</option>
        <option value='Mediatype'>Mediatype</option>
        <option value='Event'>Event</option>
        <option value='Location'>Location</option>
        <option value='Year'>Year</option>
      </select>
      <div className='mt-1 flex items-center'>
        <input
          className=''
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
          className='ml-2 mb-[-2px] text-sm text-slate-300'
          htmlFor='link-users-frags'
        >
          Show collected
        </label>
      </div>
    </div>
  );
}
