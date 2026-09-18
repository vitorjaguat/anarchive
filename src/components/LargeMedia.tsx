// import { TokenMedia } from '@reservoir0x/reservoir-kit-ui';
import { useIsMobile } from '@/utils/useIsMobile';
import { Token } from '../../types/tokens';
import Image from 'next/image';
import { shouldUseUnoptimizedImage } from '@/utils/imageOptimization';

// import PDFViewer from '@/components/PDFViewer';

interface LargeMediaProps {
  token: Token['token'];
}

export default function LargeMedia({ token }: LargeMediaProps) {
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
    token?.mediaMimeType?.includes('mpeg')
  ) {
    return (
      <audio className='z-50' controls autoPlay>
        <source src={token.media} type='audio/mpeg' />
      </audio>
    );
  }

  if (token.media?.includes('.pdf') || token?.mediaMimeType?.includes('pdf')) {
    const width = isMobile ? 'auto' : '800';
    const height = isMobile ? 'auto' : window.innerHeight - 100;

    // if (isMobile) {
    //   return <iframe src={token.media} width='100%' height='90%'></iframe>;
    // }
    if (isMobile) {
      // Open PDF in a new tab
      if (typeof window !== 'undefined') {
        window.open(token.media, '_blank');
      }
      return (
        <div className='text-center py-8 z-50'>PDF opened in a new tab.</div>
      );
    }

    return (
      // <object data={token.media + '#toolbar=0'}> was unreliable for PDF
      // URLs containing special characters (apostrophes, #, spaces) —
      // Chrome's native PDF plugin path handles those inconsistently even
      // though the same URL fetches/downloads fine. An <iframe> uses a
      // different rendering path that doesn't have this problem, and
      // doesn't need the '#toolbar=0' fragment (which was part of what
      // broke on these URLs).
      <iframe
        src={token.media}
        title={token.name}
        style={{ height: isMobile ? '60vh' : `${window.innerHeight - 150}px` }}
        width={width}
        className='z-50'
      />
    );
  }

  if (token.media?.includes('.svg') || token?.mediaMimeType?.includes('svg')) {
    return (
      <div className='relative w-[90vw] h-[85vh] max-w-[90vw] max-h-[85vh] z-50'>
        <Image
          src={token.media}
          alt={token.name}
          fill
          unoptimized={shouldUseUnoptimizedImage(token.media)}
          style={{ objectFit: 'contain' }}
        />
      </div>
    );
  }

  if (
    token.media?.includes('.html') ||
    token?.mediaMimeType?.includes('html')
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
          zIndex: 50,
        }}
      ></iframe>
    );
  }

  // console.log('token.media', token.media);

  const maxWidth = isMobile ? '100%' : '80%';
  const maxHeight = isMobile ? '100%' : '80vh';
  const borderRadius = isMobile ? 4 : 8;

  console.log('Mimetype', token?.mediaMimeType);

  if (token?.mediaMimeType?.includes('video')) {
    return (
      <div className='w-full sm:max-w-[80vw] h-fit sm:max-h-[80vh] flex items-center justify-center'>
        <video
          // width={80}
          // height={80}
          className='h-full w-full object-contain'
          controls
          autoPlay
          preload='none'
        >
          <source src={token.media} />
        </video>
      </div>
    );
  }

  return (
    <div className='relative w-[90vw] h-[85vh] max-w-[90vw] max-h-[85vh]'>
      <Image
        src={token.media}
        alt={token.name}
        fill
        unoptimized={shouldUseUnoptimizedImage(token.media)}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );

  // return (
  //   <Image
  //     src={token.media}
  //     alt={token.name}
  //     width={500}
  //     height={500}
  //     style={{ objectFit: 'contain' }}
  //     onError={() => (
  //       <ReactPlayer
  //         src={token.media}
  //         controls
  //         width={maxWidth}
  //         height={maxHeight}
  //         style={{
  //           borderRadius,
  //           zIndex: 50,
  //         }}
  //       />
  //     )}
  //   />
  // );
}
