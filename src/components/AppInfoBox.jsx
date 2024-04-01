export default function AppInfoBox() {
  return (
    <div
      className='absolute flex p-4 bg-slate-800/70 flex-col gap-4 top-[50%] left-[50%] duration-300 rounded-md'
      style={{
        transform: 'translate(-50%, calc(-50% - 50px))',
      }}
    >
      <div className='text-white'>
        The Anarchiving Game is a shared contract deployed on Zora&apos;s
        mainnet that records The Sphere&apos;s evolution, capturing its journey
        and milestones. This initiative enables collaborators to mint, share,
        and collect digital objects at minimal costs, promoting open access and
        diversity in the field of live arts.
      </div>
      <div className='text-white'>
        When participants create fragments, they are building together the The
        Sphere&apos;s Anarchive as a dynamic, participatory open canvas where
        community&apos;s memories and creativity are continuously interpreted
        and reimagined, challenging traditional archiving methods, creating a
        fluid narrative through artistic collaboration.
      </div>
      <div className='text-white'>
        The Anarchiving Game is supported by{' '}
        <a
          href='https://proud-paprika-325.notion.site/The-winning-projects-from-our-Open-Call-for-New-Models-for-Interdependence-and-Ownership-in-Art-and--b36baccbfe094012834f52b05d87dc4b'
          target='_blank'
          rel='noopener noreferrer'
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
        >
          New Models for Interdependence and Ownership in Art and Culture
        </a>
        , a program coordinated by{' '}
        <a
          href='https://futureartecosystems.org/'
          target='_blank'
          rel='noopener noreferrer'
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
        >
          Serpentine Arts Technologies
        </a>{' '}
        and{' '}
        <a
          href='https://www.radicalxchange.org/'
          target='_blank'
          rel='noopener noreferrer'
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
        >
          RadicalXChange
        </a>
        .{' '}
      </div>
      <div className='flex flex-col'>
        <a
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
          href='https://thesphere.as'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://thesphere.as
        </a>
        <a
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
          href='https://instagram.com/thesphere_as'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://instagram.com/thesphere_as
        </a>
        <a
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
          href='https://twitter.com/thesphere_as'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://twitter.com/thesphere_as
        </a>
        <a
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
          href='https://www.youtube.com/@thesphere2767'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://www.youtube.com/@thesphere2767
        </a>
        <a
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
          href='https://warpcast.com/thesphere'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://warpcast.com/thesphere
        </a>
        <a
          className='font-bold text-slate-400 hover:text-slate-50 duration-300'
          href='https://t.me/+o3hn1fgGsQMzZjgx'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://t.me/+o3hn1fgGsQMzZjgx
        </a>
      </div>
      <div className=''>
        <div className=''>alpha v.0.1 - April 2024</div>
        <div className=''>Developed by Uint Studio</div>
      </div>
    </div>
  );
}
