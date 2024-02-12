import dynamic from 'next/dynamic';
import { useNFTMetadata } from '@zoralabs/nft-hooks';

const Graph = dynamic(() => import('./Graph.jsx'), {
  loading: () => <p>Loading...</p>,
});

export default function GraphContainer() {
  const { metadata, error } = useNFTMetadata(
    '0x8e038a4805d984162028f5978acd894fad310b56'
  );

  console.log(metadata, error);
  return (
    <div>
      <Graph />
    </div>
  );
}
