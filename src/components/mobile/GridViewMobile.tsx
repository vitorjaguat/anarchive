import GridViewItemMobile from './GridViewItemMobile';

export default function GridViewMobile({
  allTokens,
  showMineIsChecked,
  usersFrags,
  setOpenTokenData,
  openTokenData,
}) {
  if (!allTokens || allTokens.length === 0) return null;

  return (
    <div className='flex flex-col items-center w-full gap-4 p-2 pb-[90px]'>
      {!showMineIsChecked ? (
        allTokens.map((token, i) => {
          return (
            <GridViewItemMobile
              key={i}
              token={token}
              setOpenTokenData={setOpenTokenData}
              openTokenData={openTokenData}
            />
          );
        })
      ) : !usersFrags || usersFrags.length === 0 ? (
        <div className='w-full flex items-center justify-center text-sm text-gray-400'>
          No fragments found.
        </div>
      ) : (
        usersFrags.map((token, i) => {
          return (
            <GridViewItemMobile
              key={i}
              token={token}
              setOpenTokenData={setOpenTokenData}
              openTokenData={openTokenData}
            />
          );
        })
      )}
    </div>
  );
}
