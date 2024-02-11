import dynamic from 'next/dynamic';

const Graph = dynamic(() => import('./Graph.jsx'), {
  loading: () => <p>Loading...</p>,
});

export default function GraphContainer() {
  return (
    <div>
      <Graph />
    </div>
  );
}
