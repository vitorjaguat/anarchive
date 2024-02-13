import dynamic from 'next/dynamic';

const Graph = dynamic(() => import('./GraphWrapper.jsx'), {
  loading: () => <p>Loading...</p>,
});

export default function GraphContainer() {
  return (
    <div>
      <Graph graphData={graphData} />
    </div>
  );
}
