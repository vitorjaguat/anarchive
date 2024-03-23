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
import { GraphDataClass } from '../model/glassDataClass';

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

  useEffect(() => {
    if (tokens.length > 0 && !showMineIsChecked) {
      setGraphData(new GraphDataClass(tokens, sort));
    }
  }, [tokens, sort, showMineIsChecked]);

  //events:
  const handleBackgroundClick = useCallback(() => {
    graphRef.current.zoomToFit(1000);
  }, [graphRef]);

  if (isMounted) {
    // extraRenderers = [new CSS2DRenderer()];
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  }

  const handleNodeClick = useCallback(
    (node) => {
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
            `https://api-zora.reservoir.tools/users/${account.address}/tokens/v9?collection=0x8e038a4805d984162028f5978acd894fad310b56&limit=200&includeAttributes=true`,
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

  // link isDestination logic:
  useEffect(() => {
    if (sort === 'From' && tokens.length > 0) {
      const graph = graphRef.current;
      graph.d3Force('link').strength((link) => (link.isDestination ? 0 : 0.03));
    }
  }, [tokens, sort]);

  return (
    <div className='relative'>
      <div className='absolute top-20 left-20 z-[1]'>
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
        height={windowHeight - 100}
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
        linkColor={(link) =>
          link?.isDestination && sort === 'From'
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0)'
        }
        linkWidth={(link) => (sort === 'From' ? 20 : 0)}
        // linkDirectionalParticles={(link) => (link.isDestination ? 1 : 0)}
        linkDirectionalParticles={(link) =>
          link?.isDestination && sort === 'From' ? 10 : 0
        }
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleSpeed={0.005}
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
