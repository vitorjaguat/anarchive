import { ForceGraph3D } from 'react-force-graph';
import { useRef, useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { ForceGraphMethods } from 'react-force-graph-3d';
// import {
//   CSS2DRenderer,
//   CSS2DObject,
// } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three';
// import { useTokens } from '@reservoir0x/reservoir-kit-ui';
import { useAccount } from 'wagmi';
import { GraphDataClass } from '../model/glassDataClass';
import contract from '../utils/contract';

const Graph = ({
  allTokens,
  setOpenTokenData,
  openTokenData,
  sort,
  showMineIsChecked,
  filter,
  setImageLoaded,
}) => {
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [spriteMap, setSpriteMap] = useState(new Map());
  const [isMounted, setIsMounted] = useState(false);

  // const isMounted =
  //   typeof window !== 'undefined' && typeof document !== 'undefined';

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // const router = useRouter();
  // let extraRenderers = [];

  //events:

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      // console.log('key', key);
      if (key === ' ') {
        graphRef?.current?.zoomToFit(1000);
        return;
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMounted]);

  // const handleBackgroundClick = useCallback(() => {
  //   console.log('graphData', graphData);
  //   graphRef.current.zoomToFit(1000);
  // }, [graphRef]);

  // if (isMounted) {
  //   // extraRenderers = [new CSS2DRenderer()];
  //   windowWidth = window.innerWidth;
  //   windowHeight = window.innerHeight;
  // }

  const handleNodeClick = (node) => {
    const clickedTokenData = allTokens.find(
      (token) => +token.token.tokenId === +node.id
    );
    // console.log('clickedTokenData', clickedTokenData);
    setImageLoaded(false);
    setOpenTokenData(clickedTokenData);
  };

  // user account logic:
  const account = useAccount();
  const [usersFrags, setUsersFrags] = useState([]);
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
            `https://api-zora.reservoir.tools/users/${account.address}/tokens/v10?collection=${contract}&limit=200&includeAttributes=true`,
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

  //graph data logic:
  useEffect(() => {
    if (!showMineIsChecked) {
      setGraphData(new GraphDataClass(allTokens, sort, filter));
    }
    if (showMineIsChecked && usersFrags.length > 0) {
      setGraphData(new GraphDataClass(usersFrags, sort, filter));
    }
    if (showMineIsChecked && usersFrags.length === 0) {
      setGraphData({ nodes: [], links: [] });
    }
  }, [allTokens, showMineIsChecked, usersFrags, sort, filter]);

  // useEffect(() => {

  // }, [allTokens, sort, filter, showMineIsChecked]);

  // link isDestination logic:
  useEffect(() => {
    if (sort === 'From') {
      const graph = graphRef.current;
      graph.d3Force('link').strength((link) => (link.isDestination ? 0 : 0.03));
    }
  }, [sort]);

  // const graphWidth =
  //   openTokenData === 'initial' ? windowWidth : windowWidth - 600;

  //add padding to node.image before loading it as a texture:
  const addPaddingToImage = (imageSrc, padding) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Add this line
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // canvas.width = img.width + 2 * padding;
        canvas.width = img.width * 2;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        // ctx.fillStyle = 'transparent'; // or any other color for the padding
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.drawImage(img, img.width, 0);
        resolve(canvas);
      };
      img.onerror = reject;
    });
  };

  return (
    <div className='relative' onKeyDown={(e) => handleKeyPress(e)}>
      <ForceGraph3D
        // rendererConfig={{
        //   powerPreference: 'high-performance',
        //   antialias: true,
        // }}
        ref={graphRef}
        graphData={graphData}
        //container:
        width={windowWidth}
        height={windowHeight - 100}
        // width={900}
        // height={900}
        showNavInfo={false}
        nodeRelSize={1}
        //events:
        // onBackgroundClick={handleBackgroundClick}
        onEngineStop={() => {
          if (filter?.length === 0) {
            graphRef.current.zoomToFit(1000, -2000);
          } else {
            graphRef.current.zoomToFit(1000);
          }
        }}
        cooldownTime={openTokenData === 'initial' ? 2000 : Infinity}
        // cooldownTime={2000}
        cooldownTicks={Infinity}
        warmupTicks={0}
        //links:
        linkColor={(link) =>
          link?.isDestination && sort === 'From'
            ? // ? 'rgba(255,255,255,0.1)'
              'rgba (160, 160, 255, 0.1)'
            : 'rgba(0,0,0,0)'
        }
        linkWidth={(link) => (sort === 'From' ? 20 : 0)}
        // linkDirectionalParticles={(link) => (link.isDestination ? 1 : 0)}
        linkDirectionalParticles={(link) =>
          link?.isDestination && sort === 'From' ? 3 : 0
        }
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleSpeed={0.0025}
        //nodes:
        nodeLabel={(node) =>
          `<div class='node-label'><div class='title'>${node.name}</div><div>${node.group}</div></div>`
        }
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
            const loader = new THREE.TextureLoader();
            addPaddingToImage(node.image, 80)
              .then((canvas) => {
                texture = loader.load(canvas.toDataURL());
                setSpriteMap(spriteMap.set(node.id, texture));
              })
              .catch((err) => console.error({ err }));
            // texture = loader.load(
            //   `${node.image}`,
            //   (texture) => {
            //     texture = texture;
            //     setSpriteMap(spriteMap.set(node.id, texture));
            //   },
            //   undefined,
            //   (err) => console.error({ err })
            // );

            // texture = new THREE.TextureLoader().load(`${node.image}`);

            // setSpriteMap(spriteMap.set(node.id, texture));
          }

          const geometry = new THREE.SphereGeometry(10, 32, 32); //(radius, widthSegments, heightSegments)
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const circle = new THREE.Mesh(geometry, material);
          circle.scale.set(1, 1, 1);
          return circle;
        }}
        // extraRenderers={isMounted ? extraRenderers : []}
        // extraRenderers={[]}
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
