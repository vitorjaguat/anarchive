import { TokenMedia } from '@reservoir0x/reservoir-kit-ui';

export default function LargeMedia({ token }) {
  if (token.media?.includes('.mpeg')) {
    return (
      <audio controls autoPlay>
        <source src={token.media} type='audio/mpeg' />
      </audio>
    );
  }

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
