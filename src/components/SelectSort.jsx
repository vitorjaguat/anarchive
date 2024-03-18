export default function SelectSort({ setSort, sort }) {
  return (
    <select
      value={sort}
      name='sort'
      id='sort'
      className='text-black px-4'
      onChange={(e) => setSort(e.target.value)}
    >
      <option value='none'>--Choose a trait--</option>
      <option value='none'>None</option>
      <option value='Mediatype'>Mediatype</option>
      <option value='Location'>Location</option>
      <option value='To'>To</option>
      <option value='Creator'>Creator</option>
      <option value='Event'>Event</option>
      <option value='From'>From</option>
      <option value='Year'>Year</option>
    </select>
  );
}
