import { TokenMedia } from '@reservoir0x/reservoir-kit-ui';
import { useEffect, useState } from 'react';

export default function LargeMedia({ token }) {
  //   const [file, setFile] = useState(null);

  //   useEffect(() => {
  //     const fetchFile = async () => {
  //       try {
  //         const response = await fetch(
  //           'https://img.reservoir.tools/images/v2/zora/i9YO%2F4yHXUdJsWcTqhqvf%2FVBd%2FGKEcuTw3LiAUIsDnndtIVQjh5bveWRv9rFS91v%2FrQ7NWrfitYfPBBKlX5bDDS42PGupsw8hYYHduF1CeCoJ2ciACcORBcP67fMFZU2.gltf-binary'
  //         );

  //         if (!response.ok) {
  //           throw new Error('Failed to fetch file');
  //         }

  //         const blob = await response.blob();
  //         const newMedia = URL.createObjectURL(blob);
  //         setFile(newMedia);
  //       } catch (error) {
  //         console.error('Error fetching file:', error);
  //       }
  //     };
  //     if (token.media?.includes('.gltf')) {
  //       fetchFile();
  //     }
  //   }, [token]);

  //   if (token.media?.includes('.gltf')) {
  //     console.log('token.media', token.media);
  //     return (
  //       <model-viewer
  //         src={token.media}
  //         alt={token.name}
  //         auto-rotate
  //         camera-controls
  //       ></model-viewer>
  //     );
  //   }

  if (token.media?.includes('.mpeg')) {
    return (
      <audio controls autoPlay>
        <source src={token.media} type='audio/mpeg' />
      </audio>
    );
  }

  if (token.media?.includes('.pdf')) {
    return (
      //   <embed
      //     src={token.media}
      //     type='application/pdf'
      //     width='500px'
      //     height='1000px'
      //   />

      //   <iframe src={token.media} width='100%' height='100%' ></iframe>

      <object
        // style={{
        //   width: '100%',
        //   height: '100%',
        //   aspectRatio: '4/3',
        // }}
        data={token.media}
        width='800'
        height='500'
      ></object>
    );
  }

  if (token.media?.includes('.html')) {
    const tokenMedia = token.media.split(';')[0];
    // console.log('tokenMedia', tokenMedia);
    return (
      <iframe
        src={tokenMedia}
        width='100%'
        height='100%'
        style={{
          background: 'white',
          border: 'none',
          overflow: 'hidden',
        }}
      ></iframe>
    );
  }

  console.log('token.media', token.media);

  return (
    <TokenMedia
      token={token}
      imageResolution='large'
      videoOptions={{ autoPlay: true }}
      style={{
        width: 'fit-content',
        maxWidth: '80%',
        maxHeight: '80vh',
        height: 'auto',
        // minHeight: 445,
        borderRadius: 8,
        // overflow: 'hidden',
        // objectFit: 'contain',
        display: 'flex',
        justifyContent: 'center',
      }}
    />
  );
}
