import { useState, useMemo } from 'react';
import type { Token } from '../../types/tokens';
import type { Address } from 'viem';
import contract from '@/utils/contract';
import { publicClient, walletClient } from '@/utils/zoraprotocolConfig';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { prepareMint1155 } from '@/utils/mintHelpers';

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
  const { address: connectedAddress, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const minterAccount = useMemo<`0x${string}` | undefined>(() => {
    return (address || connectedAddress) as `0x${string}` | undefined;
  }, [address, connectedAddress]);

  const handleClickMint = async () => {
    if (!token?.tokenId) {
      setError('Missing tokenId.');
      return;
    }

    setIsMinting(true);
    setError(null);
    setTxHash(null);
    try {
      // Build mint transaction parameters
      const { parameters } = await prepareMint1155({
        tokenContract: contract as Address,
        mintType: '1155',
        tokenId: BigInt(token.tokenId),
        minterAccount: minterAccount as Address, // wallet that will submit/pay for the mint
        quantityToMint:
          typeof quantity === 'bigint' ? quantity : BigInt(quantity),
        mintRecipient: (minterAccount as Address) ?? undefined,
      });

      // Simulate and send transaction with viem
      if (!walletClient.transport?.request) {
        throw new Error('Wallet not connected or not available');
      }

      const { request } = await (publicClient as any).simulateContract(
        parameters as any
      );

      const hash = await (walletClient as any).writeContract(request);
      await (publicClient as any).waitForTransactionReceipt({ hash });

      setTxHash(hash as `0x${string}`);
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
    <div className='flex flex-col gap-2 cursor-pointer'>
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted, openChainModal }) => {
          return (
            <button
              onPointerEnter={() => console.log(isConnected)}
              onClick={
                !mounted
                  ? undefined
                  : account && chain?.unsupported
                  ? openChainModal
                  : !isConnected
                  ? openConnectModal
                  : handleClickMint
              }
              className={className}
              disabled={isMinting}
              title={!isConnected ? 'Connect wallet to mint' : 'Mint'}
            >
              {isMinting ? 'Minting…' : 'Collect'}
            </button>
          );
        }}
      </ConnectButton.Custom>
      {error && <div className='text-xs text-red-400 break-words'>{error}</div>}
      {txHash && !error && (
        <div className='text-xs text-emerald-400 break-all'>
          Minted: {txHash.slice(0, 10)}…{' '}
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target='_blank'
            rel='noopener noreferrer'
            className='underline'
          >
            view
          </a>
        </div>
      )}
    </div>
  );
}
