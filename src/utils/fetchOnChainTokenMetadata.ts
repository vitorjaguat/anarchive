import type { TokenAttribute } from '../../types/tokens';

const FETCH_TIMEOUT_MS = 10_000;

type OnChainTokenMetadata = {
  name: string | null;
  description: string | null;
  attributes: TokenAttribute[];
  image: string | null;
  media: string | null;
  mediaMimeType: string | null;
};

function resolveIpfsUri(uri: string): string | null {
  if (!uri.startsWith('ipfs://')) return null;
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) return null;
  const path = uri.replace('ipfs://', '');
  return `https://${clientId}.ipfscdn.io/ipfs/${path}`;
}

// Fetches a token's metadata JSON directly from its on-chain tokenURI (via
// thirdweb's own IPFS gateway), bypassing Alchemy entirely. Alchemy's NFT
// metadata indexer has been observed to fail permanently for some tokens
// (either an explicit "too large" rejection, or a transient fetch error
// that never gets retried), so text metadata (name/description/attributes)
// is sourced this way for every token rather than depending on Alchemy's
// indexing succeeding. image/media are also extracted here (already present
// in the same JSON, no extra fetch) so callers can fall back to the raw
// on-chain file when Alchemy has no image data for a token at all.
export default async function fetchOnChainTokenMetadata(
  uri: string
): Promise<OnChainTokenMetadata | null> {
  const gatewayUrl = resolveIpfsUri(uri);
  if (!gatewayUrl) return null;

  try {
    const res = await fetch(gatewayUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      name?: string;
      description?: string;
      attributes?: Array<{ trait_type?: string; value?: string }>;
      image?: string;
      content?: { mime?: string; uri?: string };
      animation_url?: string;
    };

    const attributesSource = Array.isArray(json.attributes)
      ? json.attributes
      : [];
    const attributes: TokenAttribute[] = attributesSource
      .filter(
        (attribute): attribute is { trait_type: string; value: string } =>
          Boolean(attribute?.trait_type) && Boolean(attribute?.value)
      )
      .map((attribute) => ({
        key: attribute.trait_type,
        value: attribute.value,
      }));

    const resolvedImage = json.image ? resolveIpfsUri(json.image) : null;
    // Only treat this as a distinct "media" (video/pdf/audio) file when
    // animation_url is present — the create/update flows omit it entirely
    // when the token's media IS an image, but always set content.uri to
    // the same file as image in that case, so falling back to content.uri
    // unconditionally would wrongly duplicate the image into media.
    const resolvedMedia = json.animation_url
      ? resolveIpfsUri(json.animation_url)
      : null;

    return {
      name: json.name ?? null,
      description: json.description ?? null,
      attributes,
      image: resolvedImage,
      media: resolvedMedia,
      mediaMimeType: resolvedMedia ? json.content?.mime ?? null : null,
    };
  } catch (error) {
    console.warn(`Failed to fetch on-chain metadata from ${gatewayUrl}:`, error);
    return null;
  }
}
