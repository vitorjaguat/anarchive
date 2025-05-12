import { TokenMedia } from '@reservoir0x/reservoir-kit-ui';
import { useIsMobile } from '@/utils/useIsMobile';
// import PDFViewer from '@/components/PDFViewer';

export default function LargeMedia({ token }) {
  const isMobile = useIsMobile();
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
  if (!token.media) {
    token.media = token.imageLarge;
  }

  if (
    token.media?.includes('.mpeg') ||
    token?.metadata?.mediaOriginal?.includes('.mpeg')
  ) {
    return (
      <audio controls autoPlay>
        <source src={token.media} type='audio/mpeg' />
      </audio>
    );
  }

  if (
    token.media?.includes('.pdf') ||
    token?.metadata?.mediaOriginal?.includes('.pdf')
  ) {
    const width = isMobile ? 'auto' : '800';
    const height = isMobile ? 'auto' : window.innerHeight - 100;

    if (isMobile) {
      return <iframe src={token.media} width='100%' height='90%'></iframe>;
    }

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
        style={{ height: isMobile ? '60vh' : `${window.innerHeight - 150}px` }}
        width={width}
        // height={height}
      >
        <p>
          PDF cannot be displayed. <a href={token.media}>Download PDF</a>
        </p>
      </object>
    );
  }

  if (
    token.media?.includes('.svg') ||
    token?.metadata?.mediaOriginal?.includes('.svg')
  ) {
    return (
      <img
        src={token.media}
        alt={token.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    );
  }

  if (
    token.media?.includes('.html') ||
    token?.metadata?.mediaOriginal?.includes('.html')
  ) {
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

  // console.log('token.media', token.media);

  const maxWidth = isMobile ? '100%' : '80%';
  const maxHeight = isMobile ? '100%' : '80vh';
  const borderRadius = isMobile ? 4 : 8;

  return (
    <TokenMedia
      token={token}
      imageResolution='large'
      videoOptions={{ autoPlay: true }}
      // modelViewerOptions={}
      style={{
        width: 'fit-content',
        maxWidth,
        maxHeight,
        height: 'auto',
        // minHeight: 445,
        borderRadius,
        // overflow: 'hidden',
        // objectFit: 'contain',
        display: 'flex',
        justifyContent: 'center',
      }}
    />
  );
}
