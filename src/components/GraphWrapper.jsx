import dynamic from 'next/dynamic';

const GraphWrapper = dynamic(() => import('./Graph'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export default GraphWrapper;

// export default function GraphWrapper() {
//   return (
//     <div className=''>
//       <Graph />
//     </div>
//   );
// }
