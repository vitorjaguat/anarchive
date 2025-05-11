import { useContract } from '@thirdweb-dev/react';
import contractAddress from '@/utils/contract';
import { useState } from 'react';

export default function MintBtn({ tokenId }) {
  const [isMinting, setIsMinting] = useState(false);
  const { contract } = useContract(contractAddress, 'edition-drop'); // Use 'edition' for ERC-1155 contracts

  const handleMint = async () => {
    if (!contract) return;

    try {
      setIsMinting(true);

      const quantity = 1; // Number of copies to mint

      // Call the `claim` method to mint the token
      const tx = await contract.claim(tokenId, quantity);
      console.log('Mint successful:', tx);

      alert('Token minted successfully!');
    } catch (error) {
      console.error('Error minting token:', error);
      alert('Failed to mint token.');
    } finally {
      setIsMinting(false);
    }
  };

  return <div onClick={handleMint}>MintBtn</div>;
}
