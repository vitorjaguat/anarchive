import { useContract } from '@thirdweb-dev/react';
import contractAddress from '@/utils/contract';

export default function MintBtn() {
  const { contract } = useContract(contractAddress, 'nft-collection');
  console.log('contract', contract);

  return <div>MintBtn</div>;
}
