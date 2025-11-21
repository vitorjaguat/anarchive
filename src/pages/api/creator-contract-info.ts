import type { NextApiRequest, NextApiResponse } from 'next';
import { getCreator1155ContractInfo } from '@/utils/creatorContractInfo';

type CreatorContractInfoResponse = {
  nextTokenId: string;
  contractVersion: string;
  mintFee: string;
  contractName: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const data = await getCreator1155ContractInfo();
    const response: CreatorContractInfoResponse = {
      nextTokenId: data.nextTokenId.toString(),
      contractVersion: data.contractVersion,
      mintFee: data.mintFee.toString(),
      contractName: data.contractName,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching creator contract info:', error);
    res.status(500).json({ error: 'Failed to fetch contract info' });
  }
}
