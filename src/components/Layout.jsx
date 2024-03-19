import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <div className='relative w-screen h-screen'>
        <div>{children}</div>

        <div className='absolute bottom-0 left-0 right-0 z-[1999]'>
          <Navbar />
        </div>
      </div>
    </>
  );
}
