import { ForceGraph3D } from 'react-force-graph';
import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ForceGraphMethods } from 'react-force-graph-3d';
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three';
import { useTokens } from '@reservoir0x/reservoir-kit-ui';
import SelectSort from './SelectSort';
import { useAccount } from 'wagmi';

class GraphDataClass {
  constructor(tokenArr, attribute) {
    this.nodes = tokenArr?.map((token) => {
      return {
        id: token.token.tokenId,
        name: token.token.name,
        image: token.token.imageSmall,
        group:
          attribute !== 'none'
            ? token.token.attributes.find((att) => att.key === attribute).value
            : 'none',
        // city: token.token.attributes.find((att) => att.key === 'City').value,
      };
    });
    this.links = [];

    if (attribute === 'none') {
      return;
    }
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

const Graph = ({ setOpenTokenData, openTokenData }) => {
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [sort, setSort] = useState('Mediatype');
  const [spriteMap, setSpriteMap] = useState(new Map());
  const [showMineIsChecked, setShowMineIsChecked] = useState(false);

  const isMounted =
    typeof window !== 'undefined' && typeof document !== 'undefined';
  const router = useRouter();
  let extraRenderers = [];
  let windowWidth = 0;
  let windowHeight = 0;
  const [tokens, setTokens] = useState([]);

  // // fetching tokens using hook:
  // const { data: tokens } = useTokens({
  //   collection: '0x8e038a4805d984162028f5978acd894fad310b56',
  //   sortBy: 'updatedAt',
  //   limit: 1000,
  //   includeAttributes: true,
  // });

  //fetching token data using API:
  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET',
        headers: { accept: '*/*', 'x-api-key': process.env.RESERVOIR_API_KEY },
      };

      try {
        const response = await fetch(
          'https://api-zora.reservoir.tools/tokens/v7?collection=0x8e038a4805d984162028f5978acd894fad310b56&sortBy=updatedAt&limit=1000&includeAttributes=true',
          options
        );
        const data = await response.json();
        setTokens(data.tokens);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  // console.log('tokens', tokens);

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
    if (tokens.length > 0 && !showMineIsChecked) {
      setGraphData(new GraphDataClass(tokens, sort));
    }
  }, [tokens, sort, showMineIsChecked]);
  // console.log('graphData', graphData);
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
    // console.log('graphRef.current', graphRef.current);
    graphRef.current.zoomToFit(1000);
  }, [graphRef]);

  if (isMounted) {
    // extraRenderers = [new CSS2DRenderer()];
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  }

  // console.log(openTokenId);

  const handleNodeClick = useCallback(
    (node) => {
      console.log('tokens', tokens);
      const clickedTokenData = tokens.find(
        (token) => +token.token.tokenId === +node.id
      );

      setOpenTokenData(clickedTokenData);
      console.log(node.id);
      console.log(openTokenData);
    },
    [tokens, setOpenTokenData, openTokenData]
  );

  // user account logic:

  const account = useAccount();
  const [usersFrags, setUsersFrags] = useState([]);
  console.log('account', account);
  useEffect(() => {
    if (account?.address) {
      const fetchData = async () => {
        const options = {
          method: 'GET',
          headers: {
            accept: '*/*',
            'x-api-key': process.env.RESERVOIR_API_KEY,
          },
        };

        try {
          const response = await fetch(
            'https://api-zora.reservoir.tools/users/0x5C6DC3b2a55be4b02e26b75848e27c19df4Af9fE/tokens/v9?collection=0x8e038a4805d984162028f5978acd894fad310b56&limit=200&includeAttributes=true',
            options
          );
          const data = await response.json();
          setUsersFrags(data.tokens);
        } catch (err) {
          console.error(err);
        }
      };

      fetchData();
    }
  }, [account.address]);

  useEffect(() => {
    if (showMineIsChecked && usersFrags.length > 0) {
      setGraphData(new GraphDataClass(usersFrags, sort));
    }
  }, [showMineIsChecked, usersFrags, sort]);

  console.log('usersFrags', usersFrags);
  console.log('showMineIsChecked', showMineIsChecked);

  return (
    <div className='relative'>
      <div className='absolute top-20 left-20 z-[1000]'>
        <SelectSort setSort={setSort} sort={sort} />
        {/* link user's frags */}
        <div className='mt-2'>
          <input
            type='checkbox'
            name='link-users-frags'
            id='link-users-frags'
            checked={showMineIsChecked}
            onChange={() =>
              setShowMineIsChecked(
                (prevShowMineIsChecked) => !prevShowMineIsChecked
              )
            }
          />
          <label className='ml-2' htmlFor='link-users-frags'>
            Show collected
          </label>
        </div>
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
        cooldownTime={openTokenData === 'initial' ? 2000 : Infinity}
        cooldownTicks={Infinity}
        warmupTicks={0}
        //links:
        linkColor={(link) => 'rgba(0,0,0,0)'}
        linkWidth={0}
        //nodes:
        nodeLabel={(node) => `<div>${node.name}</div>${node.group}`}
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
          //storing textures in spriteMap state, so that they are not reloaded every time the graph is rerendered:
          let texture;
          if (spriteMap.get(node.id)) texture = spriteMap.get(node.id);
          else {
            texture = new THREE.TextureLoader().load(`${node.image}`);
            setSpriteMap(spriteMap.set(node.id, texture));
          }

          const geometry = new THREE.SphereGeometry(10, 32, 32); //(radius, widthSegments, heightSegments)
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const circle = new THREE.Mesh(geometry, material);
          circle.scale.set(1, 1, 1);
          return circle;
        }}
        extraRenderers={isMounted ? extraRenderers : []}
        onNodeClick={
          handleNodeClick
          // (node) => {
          // window.open(
          //   `https://zora.co/collect/zora:0x8e038a4805d984162028f5978acd894fad310b56/${node.id}`,
          //   '_blank'
          // );

          // }
        }
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
