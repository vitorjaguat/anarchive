import dynamic from 'next/dynamic';
import { useNFTMetadata } from '@zoralabs/nft-hooks';
import { useCollections, useTokens } from '@reservoir0x/reservoir-kit-ui';

const Graph = dynamic(() => import('./Graph.jsx'), {
  loading: () => <p>Loading...</p>,
});

export default function GraphContainer() {
  const { data: tokens } = useTokens({
    collection: '0x8e038a4805d984162028f5978acd894fad310b56',
    sortBy: 'updatedAt',
    limit: 1000,
  });
  console.log('tokens', tokens);
  console.log('ok');
  const graphData = {
    nodes: tokens.map((token) => {
      return {
        id: token.token.tokenId,
        name: token.token.name,
        image: token.token.imageSmall,
        group: +token.token.tokenId > 15 ? 1 : 2,
      };
    }),
    links: [
      // {
      //   source: 2,
      //   target: 1,
      //   value: 4,
      // },
      // {
      //   source: 1,
      //   target: 2,
      //   value: 1,
      // },
      // {
      //   source: 2,
      //   target: 3,
      //   value: 9,
      // },
      // {
      //   source: 3,
      //   target: 2,
      //   value: 3,
      // },
    ],
  };

  return (
    <div>
      <Graph graphData={graphData} />
    </div>
  );
}
