const ALCHEMY_IMAGE_HOSTS = new Set([
  'nft-cdn.alchemy.com',
  'nft2-cdn.alchemy.com',
]);

export function shouldUseUnoptimizedImage(src?: string | null): boolean {
  if (!src) return false;

  try {
    const parsed = new URL(src);
    return ALCHEMY_IMAGE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

// WebGL textures (THREE.TextureLoader) are fetched with crossOrigin
// 'anonymous', so the remote host must send CORS headers. Alchemy's CDN
// doesn't, so route those images through Next's same-origin image proxy.
// 256 is one of Next's default allowed `imageSizes`.
export function toTextureUrl(src?: string | null): string | null | undefined {
  if (!shouldUseUnoptimizedImage(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src as string)}&w=256&q=75`;
}
