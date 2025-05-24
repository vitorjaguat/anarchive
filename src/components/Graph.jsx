// import { ForceGraph3D } from 'react-force-graph';
import { useRef, useState, useEffect, useContext } from 'react';
import * as THREE from 'three';
import { useAccount } from 'wagmi';
import { GraphDataClass } from '../model/glassDataClass';
import contract from '../utils/contract';
import ForceGraph3D from 'react-force-graph-3d';
import { useRouter } from 'next/router';
import { MainContext } from '@/context/mainContext';

const Graph = ({
  allTokens,
  usersFrags,
  sort,
  showMineIsChecked,
  filter,
  setImageLoaded,
}) => {
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [spriteMap, setSpriteMap] = useState(new Map());
  const isMounted = true;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const [isLoadingGraph, setIsLoadingGraph] = useState(true);
  const [spheres, setSpheres] = useState([]);
  const router = useRouter();
  const { openToken, changeOpenToken } = useContext(MainContext);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
  }, []);

  const handleNodeClick = (node) => {
    const clickedTokenData = allTokens.find(
      (token) => +token.token.tokenId === +node.id
    );
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, fragment: clickedTokenData.token.tokenId },
      },
      undefined,
      { shallow: true }
    );
    setImageLoaded(false);
    changeOpenToken(clickedTokenData);
  };

  // prepare nodes (as graphData):
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

  function createCircularTexture(imageUrl, size = 128) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);

        // Draw circular clipping path
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Draw the image inside the circle
        ctx.drawImage(img, 0, 0, size, size);
        ctx.restore();

        // Create texture
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        resolve(texture);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  //prepare nodes (as spheres):
  useEffect(() => {
    setIsLoadingGraph(true);

    const spheresArr = graphData.nodes.map((node) => getOrCreateSprite(node));
    setSpheres(spheresArr);
  }, [graphData]);

  // link isDestination logic:
  useEffect(() => {
    if (sort === 'From') {
      const graph = graphRef.current;
      graph.d3Force('link').strength((link) => (link.isDestination ? 0 : 0.03));
    }
  }, [sort]);

  const spriteCache = useRef(new Map());

  const getOrCreateSprite = (node) => {
    if (spriteCache.current.has(node.id)) {
      return spriteCache.current.get(node.id);
    }
    const texture = new THREE.TextureLoader().load(node.image);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(30, 30, 1);
    sprite.userData.id = node.id;
    spriteCache.current.set(node.id, sprite);
    return sprite;
  };

  useEffect(() => {
    spriteCache.current.clear();
  }, [allTokens, usersFrags]);

  return (
    <div className={'relative'} onKeyDown={(e) => handleKeyPress(e)}>
      <ForceGraph3D
        rendererConfig={{
          powerPreference: 'high-performance',
          antialias: false,
        }}
        backgroundColor='#00000000'
        ref={graphRef}
        graphData={graphData}
        //container:
        width={windowWidth}
        height={windowHeight}
        showNavInfo={false}
        // nodeRelSize={1}
        //events:
        // onBackgroundClick={handleBackgroundClick}
        onEngineStop={() => {
          if (filter?.length === 0) {
            graphRef.current.zoomToFit(1000, -2000);
          } else {
            graphRef.current.zoomToFit(1000);
          }
        }}
        cooldownTime={openToken === 'initial' ? 2000 : Infinity}
        // cooldownTime={2000}
        cooldownTicks={Infinity}
        warmupTicks={0}
        // linkVisibility={false}
        //links:
        linkColor={(link) =>
          link?.isDestination && sort === 'From'
            ? 'rgba (160, 160, 255, 0.1)'
            : 'rgba(0,0,0,0)'
        }
        linkWidth={sort === 'From' ? 20 : 0}
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
        // nodeThreeObject={(node) =>
        //   spheres.find((sphere) => sphere.userData.id === node.id)
        // }
        nodeThreeObject={(node) => {
          const sprite = spheres.find((s) => s.userData.id === node.id);
          if (sprite) return sprite;

          // Return an invisible placeholder to suppress the default sphere
          const geometry = new THREE.SphereGeometry(0.001, 8, 8);
          const material = new THREE.MeshBasicMaterial({
            visible: false,
            transparent: true,
            opacity: 0,
          });

          const mesh = new THREE.Mesh(geometry, material);
          return mesh;
        }}
        nodeRelSize={0.001}
        // nodeThreeObject={(node) => {
        //   // console.log('node', node);
        //   //SQUARES:
        //   // const sprite = new THREE.TextureLoader().load(
        //   //   node.image || '/favicon.ico'
        //   // );
        //   // const material = new THREE.SpriteMaterial({ map: sprite });
        //   // const spriteObj = new THREE.Sprite(material);
        //   // spriteObj.scale.set(90, 90, 90);
        //   // return spriteObj;

        //   //FLAT CIRCLES:
        //   // const texture = new THREE.TextureLoader().load(
        //   //   node.image || '/favicon.ico'
        //   // );
        //   // const geometry = new THREE.CircleGeometry(32, 32, 32);
        //   // const material = new THREE.MeshBasicMaterial({ map: texture });
        //   // const circle = new THREE.Mesh(geometry, material);
        //   // circle.scale.set(5, 5, 5);
        //   // return circle;

        //   //SPHERES THAT ROTATE:
        //   //storing textures in spriteMap state, so that they are not reloaded every time the graph is rerendered:
        //   let texture;
        //   let circle;

        //   if (spriteMap.has(node.id)) {
        //     texture = spriteMap.get(node.id);
        //     const geometry = new THREE.SphereGeometry(10, 32, 32); //(radius, widthSegments, heightSegments)
        //     const material = new THREE.MeshBasicMaterial({ map: texture });
        //     circle = new THREE.Mesh(geometry, material);
        //     circle.scale.set(1, 1, 1);
        //     return circle;
        //   } else {
        //     const placeholderGeometry = new THREE.SphereGeometry(10, 32, 32);
        //     const placeholderMaterial = new THREE.MeshBasicMaterial({
        //       color: 0xcccccc,
        //     });
        //     const placeholderObject = new THREE.Mesh(
        //       placeholderGeometry,
        //       placeholderMaterial
        //     );

        //     const loader = new THREE.TextureLoader();
        //     duplicateImage(node.image, 80)
        //       .then((canvas) => {
        //         texture = loader.load(canvas.toDataURL());
        //         // const geometry = new THREE.SphereGeometry(10, 32, 32); //(radius, widthSegments, heightSegments)
        //         // console.log('texture THEN', texture);
        //         // const material = new THREE.MeshBasicMaterial({
        //         //   map: texture,
        //         // });
        //         // circle = new THREE.Mesh(geometry, material);
        //         // circle.scale.set(1, 1, 1);
        //         setSpriteMap(spriteMap.set(node.id, texture));
        //         graphRef.current.refresh();
        //       })
        //       .catch((err) => console.error({ err }));
        //     return placeholderObject.clone();

        //     // texture = loader.load(
        //     //   `${node.image}`,
        //     //   (texture) => {
        //     //     texture = texture;
        //     //     setSpriteMap(spriteMap.set(node.id, texture));
        //     //   },
        //     //   undefined,
        //     //   (err) => console.error({ err })
        //     // );

        //     // texture = new THREE.TextureLoader().load(`${node.image}`);

        //     // setSpriteMap(spriteMap.set(node.id, texture));
        //   }
        // }}

        onNodeClick={handleNodeClick}
        nodeThreeObjectExtend={true}
      />
    </div>
  );
};

export default Graph;
