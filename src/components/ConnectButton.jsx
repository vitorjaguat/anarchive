import { ConnectButton } from '@rainbow-me/rainbowkit';
import { truncate } from '@/utils/utils';
import Image from 'next/image';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

function formatBalance(value, decimals, symbol) {
  if (value === undefined) return null;
  const formatted = Number(formatUnits(value, decimals));
  return `${Number(formatted.toFixed(5))} ${symbol}`;
}

export default function ConnectBtn() {
  const { address, chainId } = useAccount();
  const { data: balance } = useBalance({ address, chainId });

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        // You can use Tailwind or any custom styles here
        return (
          <button
            type='button'
            className='w-full px-4 py-2 rounded bg-sph-purple-light font-inter font-bold hover:bg-[#00cc00] text-white hover:text-black transition text-sm duration-300 ease-out'
            onClick={
              !mounted
                ? undefined
                : !account
                ? openConnectModal
                : chain.unsupported
                ? openChainModal
                : openAccountModal
            }
          >
            <div
              className={
                'w-full translate-y-[1px] flex flex-col gap-0  items-center ' +
                (mounted && account ? 'text-sm' : '')
              }
            >
              {mounted && account ? (
                <>
                  <div className='flex items-center'>
                    {account.ensAvatar && (
                      <Image
                        src={account.ensAvatar}
                        className='w-4 h-4 inline mr-2 '
                      />
                    )}
                    {account.displayName}
                  </div>
                  <div className='h-[1px] w-2/3 bg-black/50 rounded-sm'></div>
                  <div className=''>
                    {balance
                      ? formatBalance(
                          balance.value,
                          balance.decimals,
                          balance.symbol
                        )
                      : account.displayBalance}
                  </div>
                </>
              ) : (
                'Connect'
              )}
            </div>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
