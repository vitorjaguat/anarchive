import type { NextApiRequest, NextApiResponse } from 'next';
import { Alchemy, Network, OwnedBaseNftsResponse } from 'alchemy-sdk';
import contract from '@/utils/contract';

type Data = string[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    res.status(400).json(['Invalid or missing address parameter']);
    return;
  }

  try {
    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ZORA_MAINNET,
    });

    const response: OwnedBaseNftsResponse = await alchemy.nft.getNftsForOwner(
      address,
      { contractAddresses: [contract], omitMetadata: true }
    );

    const data: Data = response.ownedNfts.map((ownedNft) => ownedNft.tokenId);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    res.status(500).json(['Error fetching tokens']);
  }
}
