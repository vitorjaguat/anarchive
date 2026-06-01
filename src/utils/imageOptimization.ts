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
