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
    if (node.id === openToken?.token?.tokenId) {
      return;
    }

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

  // function createCircularTexture(imageUrl, size = 128) {
  //   return new Promise((resolve, reject) => {
  //     const img = new window.Image();
  //     img.crossOrigin = 'anonymous';
  //     img.onload = () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = size;
  //       canvas.height = size;
  //       const ctx = canvas.getContext('2d');
  //       ctx.clearRect(0, 0, size, size);

  //       // Draw circular clipping path
  //       ctx.save();
  //       ctx.beginPath();
  //       ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
  //       ctx.closePath();
  //       ctx.clip();

  //       // Draw the image inside the circle
  //       ctx.drawImage(img, 0, 0, size, size);
  //       ctx.restore();

  //       // Create texture
  //       const texture = new THREE.Texture(canvas);
  //       texture.needsUpdate = true;
  //       resolve(texture);
  //     };
  //     img.onerror = reject;
  //     img.src = imageUrl;
  //   });
  // }

  // function createGlowTexture(size = 256, color = 'rgba(0,255,0,1)') {
  //   const canvas = document.createElement('canvas');
  //   canvas.width = size;
  //   canvas.height = size;
  //   const ctx = canvas.getContext('2d');
  //   const gradient = ctx.createRadialGradient(
  //     size / 2,
  //     size / 2,
  //     size / 8,
  //     size / 2,
  //     size / 2,
  //     size / 2
  //   );
  //   gradient.addColorStop(0, color);
  //   gradient.addColorStop(1, 'rgba(0,255,0,0)');
  //   ctx.fillStyle = gradient;
  //   ctx.fillRect(0, 0, size, size);
  //   const texture = new THREE.Texture(canvas);
  //   texture.needsUpdate = true;
  //   return texture;
  // }

  //prepare nodes (as spheres):
  useEffect(() => {
    setIsLoadingGraph(true);
    setSpheres(graphData.nodes.map((node) => getOrCreateSprite(node)));
  }, [graphData, openToken]);

  // Add memoization for spheres
  const spheresDeps = [graphData.nodes.length, openToken?.token?.tokenId];

  useEffect(() => {
    setIsLoadingGraph(true);
    setSpheres(graphData.nodes.map((node) => getOrCreateSprite(node)));
  }, spheresDeps);

  // link isDestination logic:
  useEffect(() => {
    if (sort === 'From') {
      const graph = graphRef.current;
      graph
        .d3Force('link')
        .strength((link) => (link.isDestination ? 0.0008 : 0.03));
    }
  }, [sort]);

  const spriteCache = useRef(new Map());

  const getOrCreateSprite = (node) => {
    const isSelected =
      openToken && String(openToken.token.tokenId) === String(node.id);

    if (!isSelected && spriteCache.current.has(node.id)) {
      return spriteCache.current.get(node.id);
    }

    // Create a promise-based texture loader to get image dimensions
    const createProportionalTexture = (imageUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate aspect ratio
          const aspectRatio = img.width / img.height;

          // Set canvas size maintaining aspect ratio
          const baseSize = 256;
          if (aspectRatio > 1) {
            // Landscape image
            canvas.width = baseSize;
            canvas.height = baseSize / aspectRatio;
          } else {
            // Portrait or square image
            canvas.width = baseSize * aspectRatio;
            canvas.height = baseSize;
          }

          // Draw image maintaining proportions
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const texture = new THREE.Texture(canvas);
          texture.needsUpdate = true;
          resolve({ texture, aspectRatio });
        };
        img.src = imageUrl;
      });
    };

    // For now, use the standard texture loader, but we'll enhance it
    const texture = new THREE.TextureLoader().load(
      node.image,
      (loadedTexture) => {
        // console.log(`Texture loaded for node: ${node.id}`);
        // Get the image to calculate aspect ratio
        const img = loadedTexture.image;
        const aspectRatio = img.width / img.height;

        // Adjust sprite scale based on aspect ratio
        if (aspectRatio > 1) {
          // Landscape: keep width, reduce height
          sprite.scale.set(30, 30 / aspectRatio, 1);
        } else {
          // Portrait: keep height, reduce width
          sprite.scale.set(30 * aspectRatio, 30, 1);
        }
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture for node: ${node.id}`, error);
        if (sprite.material) {
          sprite.material.color.set(0x999999);
        }
      }
    );

    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(30, 30, 1); // Default scale, will be adjusted in onLoad
    sprite.userData.id = node.id;

    if (isSelected) {
      // Create a proper glow with transparency at the edges
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Create a radial gradient
      const gradient = ctx.createRadialGradient(
        128,
        128,
        50, // Inner circle (start of gradient)
        128,
        128,
        128 // Outer circle (end of gradient)
      );

      // Add color stops for the gradient
      gradient.addColorStop(0, 'rgba(0,255,0,0.85)'); // More opaque in center
      gradient.addColorStop(1, 'rgba(0,255,0,0)'); // Transparent at edges

      // Fill with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      // Create texture and material
      const glowTexture = new THREE.Texture(canvas);
      glowTexture.needsUpdate = true;
      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
      });

      // CREATE THE GLOW SPRITE
      const glowSprite = new THREE.Sprite(glowMaterial);
      glowSprite.scale.set(60, 60, 1);
      glowSprite.position.set(0, 0, -0.1); // Behind main sprite
      glowSprite.renderOrder = 0; // Render first

      // Set sprite properties
      sprite.position.set(0, 0, 0); // In front
      sprite.renderOrder = 1; // Render second

      // Create group with both sprites
      const group = new THREE.Group();
      group.add(glowSprite); // Add glow first (behind)
      group.add(sprite); // Add main sprite second (in front)
      group.userData.id = node.id;

      return group;
    }

    // Cache and return normal sprite for non-selected nodes
    spriteCache.current.set(node.id, sprite);
    return sprite;
  };

  useEffect(() => {
    // Dispose of all cached sprites before clearing
    spriteCache.current.forEach((sprite) => {
      if (sprite.material && sprite.material.map) {
        sprite.material.map.dispose();
      }
      if (sprite.material) {
        sprite.material.dispose();
      }
    });
    spriteCache.current.clear();
  }, [allTokens, usersFrags]);

  useEffect(() => {
    if (openToken && openToken.token && openToken.token.tokenId) {
      // Dispose of the specific sprite before removing from cache
      const nodeId = String(openToken.token.tokenId);
      if (spriteCache.current.has(nodeId)) {
        const sprite = spriteCache.current.get(nodeId);
        if (sprite.material && sprite.material.map) {
          sprite.material.map.dispose();
        }
        if (sprite.material) {
          sprite.material.dispose();
        }
      }
      spriteCache.current.delete(nodeId);
      setSpheres(graphData.nodes.map((node) => getOrCreateSprite(node)));
    }
  }, [openToken]);

  const focusOnNode = (nodeId) => {
    if (!graphRef.current) return;

    const node = graphData.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const nodePos = {
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
    };

    // Calculate camera position for left-side centering
    const distance = 250;
    const horizontalShift = windowWidth * 0.3; // Adjust this value to fine-tune positioning

    const cameraPos = {
      x: nodePos.x + horizontalShift, // Positive value moves camera right
      y: nodePos.y,
      z: nodePos.z + distance,
    };

    // Create a look-at point slightly to the left of the node
    const lookAtPos = {
      x: nodePos.x + windowWidth * 0.1, // Shift look-at point left
      y: nodePos.y,
      z: nodePos.z,
    };

    graphRef.current.cameraPosition(cameraPos, lookAtPos, 1200);
  };

  // Add effect to focus on selected node
  useEffect(() => {
    if (openToken && openToken.token && openToken.token.tokenId) {
      // Small delay to ensure the glow effect is rendered first
      setTimeout(() => {
        focusOnNode(String(openToken.token.tokenId));
      }, 300);
    }
  }, [openToken, graphData.nodes]);

  const resetCamera = () => {
    if (!graphRef.current) return;

    // Reset to default view
    graphRef.current.zoomToFit(1000);
  };

  // Call this when closing the token modal
  useEffect(() => {
    if (!openToken || openToken === 'initial') {
      resetCamera();
    }
  }, [openToken]);

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
          link?.isDestination && sort === 'From' ? 2 : 0
        }
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleSpeed={0.001}
        linkDirectionalParticleResolution={4}
        enablePointerInteraction={true}
        enableNavigationControls={true}
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
