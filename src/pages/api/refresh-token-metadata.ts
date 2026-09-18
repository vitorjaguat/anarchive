import type { NextApiRequest, NextApiResponse } from 'next';
import { Alchemy, Network } from 'alchemy-sdk';
import contract from '@/utils/contract';
import type { TokenAttribute } from '../../../types/tokens';

type RefreshedFields = {
  name?: string | null;
  description?: string | null;
  image?: string | null;
  imageSmall?: string | null;
  imageLarge?: string | null;
  imageOriginal?: string | null;
  attributes: TokenAttribute[];
  media?: string | null;
  mediaMimeType?: string | null;
};

type RefreshedToken = {
  fields: RefreshedFields;
  tokenUri: string | null;
  // Diagnostic fields (not used for display) to help tell whether Alchemy
  // is genuinely re-attempting the fetch on each refreshCache call or just
  // replaying a cached result/failure.
  timeLastUpdated: string | null;
  rawError: string | null;
};

type Data =
  | { refreshed: true; token: RefreshedToken }
  | { refreshed: false; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { tokenId } = req.method === 'GET' ? req.query : req.body;
  // Only queue a fresh Alchemy re-index on the first poll of a given update
  // (triggerRefresh=1). Later polls just check whether that crawl has
  // completed — repeatedly re-queuing refreshCache doesn't speed anything
  // up (Alchemy processes the crawl on its own schedule) and just burns
  // API quota.
  const triggerRefresh = req.query.triggerRefresh === '1';

  if (!tokenId || typeof tokenId !== 'string') {
    res.status(400).json({ refreshed: false, error: 'Missing tokenId' });
    return;
  }

  try {
    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ZORA_MAINNET,
    });

    const nft = await alchemy.nft.getNftMetadata(contract, tokenId, {
      refreshCache: triggerRefresh,
    });

    const rawMetadata = nft.raw.metadata as
      | {
          description?: string;
          animation_url?: string;
          attributes?: Array<{ trait_type?: string; value?: string }>;
        }
      | undefined;

    const attributesSource = Array.isArray(rawMetadata?.attributes)
      ? rawMetadata?.attributes
      : [];
    const attributes: TokenAttribute[] = attributesSource
      .filter(
        (attribute): attribute is { trait_type: string; value: string } =>
          Boolean(attribute?.trait_type) && Boolean(attribute?.value),
      )
      .map((attribute) => ({
        key: attribute.trait_type,
        value: attribute.value,
      }));

    const animationUrl = rawMetadata?.animation_url;

    res.status(200).json({
      refreshed: true,
      token: {
        tokenUri: nft.tokenUri ?? null,
        timeLastUpdated: nft.timeLastUpdated ?? null,
        rawError: (nft.raw as { error?: string })?.error ?? null,
        fields: {
          name: nft.name,
          description: nft.description ?? rawMetadata?.description ?? null,
          image: nft.image?.cachedUrl ?? null,
          imageSmall: nft.image?.thumbnailUrl ?? null,
          imageLarge: nft.image?.pngUrl ?? nft.image?.originalUrl ?? null,
          imageOriginal: nft.image?.originalUrl ?? null,
          attributes,
          media:
            nft.animation?.cachedUrl ??
            nft.animation?.originalUrl ??
            animationUrl ??
            null,
          mediaMimeType: nft.animation?.contentType ?? null,
        },
      },
    });
  } catch (error) {
    console.error('Error refreshing token metadata:', error);
    const message = (error as { message?: string })?.message ?? 'Unknown error';
    res.status(200).json({ refreshed: false, error: message });
  }
}
