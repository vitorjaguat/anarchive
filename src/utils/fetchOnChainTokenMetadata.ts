import type { TokenAttribute } from '../../types/tokens';

const FETCH_TIMEOUT_MS = 10_000;

type OnChainTokenMetadata = {
  name: string | null;
  description: string | null;
  attributes: TokenAttribute[];
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
// that never gets retried), so text metadata is sourced this way for every
// token rather than depending on Alchemy's indexing succeeding.
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

    return {
      name: json.name ?? null,
      description: json.description ?? null,
      attributes,
    };
  } catch (error) {
    console.warn(`Failed to fetch on-chain metadata from ${gatewayUrl}:`, error);
    return null;
  }
}
