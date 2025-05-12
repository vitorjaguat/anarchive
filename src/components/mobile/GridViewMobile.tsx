import GridViewItemMobile from './GridViewItemMobile';

export default function GridViewMobile({
  allTokens,
  showMineIsChecked,
  usersFrags,
}) {
  console.log('allTokens', allTokens);
  return (
    <div className='flex flex-col items-center w-full gap-4 p-2 pb-[90px]'>
      {!showMineIsChecked ? (
        allTokens.map((token, i) => {
          return <GridViewItemMobile key={i} token={token} />;
        })
      ) : !usersFrags || usersFrags.length === 0 ? (
        <div className='w-full flex items-center justify-center text-sm text-gray-400'>
          No frags found
        </div>
      ) : (
        usersFrags.map((token, i) => {
          return <GridViewItemMobile key={i} token={token} />;
        })
      )}
    </div>
  );
}
