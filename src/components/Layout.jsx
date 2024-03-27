import Navbar from './Navbar';

export default function Layout({
  children,
  allTokens,
  sort,
  setSort,
  filter,
  setFilter,
  showMineIsChecked,
  setShowMineIsChecked,
}) {
  return (
    <>
      <div className='relative w-screen h-screen'>
        <div>{children}</div>

        <div className='absolute bottom-0 left-0 right-0 z-[1999]'>
          <Navbar
            allTokens={allTokens}
            sort={sort}
            setSort={setSort}
            filter={filter}
            setFilter={setFilter}
            showMineIsChecked={showMineIsChecked}
            setShowMineIsChecked={setShowMineIsChecked}
          />
        </div>
      </div>
    </>
  );
}
