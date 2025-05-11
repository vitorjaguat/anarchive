import GridViewItemMobile from './GridViewItemMobile';

export default function GridViewMobile({ allTokens }) {
  console.log('allTokens', allTokens);
  return (
    <div className='flex flex-col items-center w-full gap-4 p-2'>
      {allTokens.map((token, i) => {
        return <GridViewItemMobile key={i} token={token} />;
      })}
    </div>
  );
}
