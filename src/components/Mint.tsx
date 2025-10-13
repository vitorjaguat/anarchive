import type { Token } from '../../types/tokens';
import { mint } from '@zoralabs/protocol-sdk';
import { useWalletClient, usePublicClient } from 'wagmi';
import { useState } from 'react';
import contract from '@/utils/contract';

interface MintProps {
  token: Token['token'];
  address: string;
  _classname: string;
}

export default function Mint({ token, address, _classname }: MintProps) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleClickMint = async () => {
    if (!walletClient || !publicClient) {
      console.error('Wallet not connected');
      return;
    }

    setIsLoading(true);

    try {
      const mintParameters = {
        tokenContract: contract,
        tokenId: BigInt(token.tokenId),
        mintToAddress: address,
        quantityToMint: BigInt(1), // BigInt for quantity
        mintComment: '', // Optional comment
        mintReferral: '0x0000000000000000000000000000000000000000', // Optional referral address
      };

      // Get the mint transaction
      const { parameters } = await mint({
        ...mintParameters,
        publicClient,
      });

      // Execute the transaction
      const hash = await walletClient.writeContract(parameters);

      console.log('Mint transaction sent:', hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      console.log('Mint successful:', receipt);
    } catch (error) {
      console.error('Mint failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={handleClickMint}
      className={`${_classname} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {isLoading ? 'Minting...' : 'Collect'}
    </div>
  );
}
