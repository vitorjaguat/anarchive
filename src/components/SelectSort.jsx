export default function SelectSort({ setSort, sort }) {
  return (
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
  );
}
