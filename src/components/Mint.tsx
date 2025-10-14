import { useState, useMemo } from 'react';
import type { Token } from '../../types/tokens';
import { mint } from '@zoralabs/protocol-sdk';
import type { Address } from 'viem';
import contract from '@/utils/contract';
import { publicClient, walletClient } from '@/utils/zoraprotocolConfig';
import { useAccount } from 'wagmi';

interface MintProps {
  token: Token['token'];
  address?: `0x${string}`; // if not provided, will use connected wallet
  quantity?: number | bigint;
  className?: string;
  onSuccess?: (hash: `0x${string}`) => void;
  onError?: (error: unknown) => void;
}

export default function Mint({
  token,
  address,
  quantity = 1,
  className,
  onSuccess,
  onError,
}: MintProps) {
  const { address: connectedAddress } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minterAccount = useMemo<`0x${string}` | undefined>(() => {
    return (address || connectedAddress) as `0x${string}` | undefined;
  }, [address, connectedAddress]);

  const handleClickMint = async () => {
    if (!minterAccount) {
      setError('Connect a wallet to mint.');
      return;
    }
    if (!token?.tokenId) {
      setError('Missing tokenId.');
      return;
    }

    setIsMinting(true);
    setError(null);
    try {
      // Build mint transaction parameters via Zora Protocol SDK
      const { parameters, erc20Approval } = await mint({
        publicClient: publicClient as any,
        tokenContract: contract as Address,
        mintType: '1155',
        tokenId: BigInt(token.tokenId),
        minterAccount: minterAccount as Address, // wallet that will submit/pay for the mint
        quantityToMint:
          typeof quantity === 'bigint' ? quantity : BigInt(quantity),
        mintRecipient: (minterAccount as Address) ?? undefined,
        // Optional:
        // preferredSaleType: 'fixedPrice',
        // mintReferral: '0x0000000000000000000000000000000000000000' as Address,
        // mintComment: 'Minted via anarchive UI',
      });

      // If this mint requires an ERC20 approval, surface a clear error for now
      if (erc20Approval) {
        throw new Error(
          'This mint requires an ERC20 approval step, which is not yet implemented in this button.'
        );
      }

      // Simulate and send transaction with viem
      const { request } = await (publicClient as any).simulateContract(
        parameters as any
      );

      const hash = await (walletClient as any).writeContract(request);
      await (publicClient as any).waitForTransactionReceipt({ hash });

      onSuccess?.(hash);
    } catch (e: any) {
      console.error('Mint error:', e);
      setError(e?.shortMessage || e?.message || 'Failed to mint');
      onError?.(e);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <button
      onClick={handleClickMint}
      className={className}
      disabled={isMinting || !minterAccount}
      title={!minterAccount ? 'Connect wallet to mint' : 'Mint'}
    >
      {isMinting ? 'Minting…' : 'Collect'}
      {error && <span className='ml-2 text-red-400 text-xs'>{error}</span>}
    </button>
  );
}
