import { ForceGraph3D } from 'react-force-graph';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ForceGraphMethods } from 'react-force-graph-3d';
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three';
import { useTokens } from '@reservoir0x/reservoir-kit-ui';

class GraphDataClass {
  constructor(tokenArr, attribute) {
    this.nodes = tokenArr.map((token) => {
      return {
        id: token.token.tokenId,
        name: token.token.name,
        image: token.token.imageSmall,
        group: token.token.attributes.find((att) => att.key === attribute)
          .value,
        city: token.token.attributes.find((att) => att.key === 'City').value,
      };
    });
    this.links = [];
    this.nodes.forEach((node, i, allNodes) => {
      allNodes.forEach((n) => {
        if (n.group === node.group && n.id !== node.id) {
          this.links.push({
            source: node.id,
            target: n.id,
            // value: Math.floor(Math.random() * 9) + 1,
            // value: 2,
          });
        }
      });
    });
  }

  changeAttribute(attribute) {}
}

const Graph = () => {
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [sort, setSort] = useState('Mediatype');

  const isMounted =
    typeof window !== 'undefined' && typeof document !== 'undefined';
  const router = useRouter();
  let extraRenderers = [];
  let windowWidth = 0;
  let windowHeight = 0;

  //fetching token data:
  const { data: tokens } = useTokens({
    collection: '0x8e038a4805d984162028f5978acd894fad310b56',
    sortBy: 'updatedAt',
    limit: 1000,
    includeAttributes: true,
  });
  console.log('tokens', tokens);
  console.log('ok');
  // const graphData = {
  //   nodes: tokens.map((token) => {
  //     return {
  //       id: token.token.tokenId,
  //       name: token.token.name,
  //       image: token.token.imageSmall,
  //       group: token.token.attributes.find((att) => att.key === 'Mediatype')
  //         .value,
  //     };
  //   }),
  //   links: [],
  // };
  useEffect(() => {
    setGraphData(new GraphDataClass(tokens, sort));
  }, [tokens, sort]);
  console.log('graphData', graphData);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setGraphData(({ nodes, links }) => {
  //       const newLinks = [...new GraphDataClass(tokens, 'City').links];
  //       return {
  //         nodes,
  //         links: newLinks,
  //       };
  //     });
  //   }, 5000);
  // }, [sort]);

  //events:
  const handleBackgroundClick = useCallback(() => {
    // graphRef.current.zoomToFit('1000ms');
    console.log('graphRef.current', graphRef.current);
    graphRef.current.zoomToFit(1000);
  }, [graphRef]);

  if (isMounted) {
    // extraRenderers = [new CSS2DRenderer()];
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  }

  return (
    <div className=''>
      <div
        className='bg-pink-200 w-fit text-black cursor-pointer'
        onClick={() => {
          setSort(sort === 'City' ? 'Mediatype' : 'City');
        }}
      >
        Sort by {sort === 'City' ? 'Mediatype' : 'City'}
      </div>
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        //container:
        width={windowWidth}
        height={windowHeight}
        // width={900}
        // height={900}
        showNavInfo={true}
        nodeRelSize={1}
        //events:
        onBackgroundClick={handleBackgroundClick}
        onEngineStop={() => graphRef.current.zoomToFit(1000)}
        cooldownTime={2000}
        //links:
        linkColor={(link) => 'rgba(0,0,0,0)'}
        linkWidth={0}
        //nodes:
        nodeAutoColorBy={'group'}
        nodeThreeObject={(node) => {
          //SQUARES:
          // const sprite = new THREE.TextureLoader().load(
          //   node.image || '/favicon.ico'
          // );
          // const material = new THREE.SpriteMaterial({ map: sprite });
          // const spriteObj = new THREE.Sprite(material);
          // spriteObj.scale.set(90, 90, 90);
          // return spriteObj;

          //FLAT CIRCLES:
          // const texture = new THREE.TextureLoader().load(
          //   node.image || '/favicon.ico'
          // );
          // const geometry = new THREE.CircleGeometry(32, 32, 32);
          // const material = new THREE.MeshBasicMaterial({ map: texture });
          // const circle = new THREE.Mesh(geometry, material);
          // circle.scale.set(5, 5, 5);
          // return circle;

          //SPHERES THAT ROTATE:
          const texture = new THREE.TextureLoader().load(
            node.image || '/favicon.ico'
          );
          const geometry = new THREE.SphereGeometry(10, 32, 32); //(radius, widthSegments, heightSegments)
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const circle = new THREE.Mesh(geometry, material);
          circle.scale.set(1, 1, 1);
          return circle;
        }}
        extraRenderers={isMounted ? extraRenderers : []}
        onNodeClick={(node) => {
          window.open(
            `https://zora.co/collect/zora:0x8e038a4805d984162028f5978acd894fad310b56/${node.id}`,
            '_blank'
          );
          // router.push(
          //   `https://zora.co/collect/zora:0x8e038a4805d984162028f5978acd894fad310b56/${node.id}`
          // );
        }}
        nodeThreeObjectExtend={true}
        // graphData={{
        //   nodes: [{ id: 'Harry' }, { id: 'Sally' }, { id: 'Alice' }],
        //   links: [
        //     { source: 'Harry', target: 'Sally' },
        //     { source: 'Harry', target: 'Alice' },
        //   ],
        // }}
      />
    </div>
  );
};

export default Graph;
