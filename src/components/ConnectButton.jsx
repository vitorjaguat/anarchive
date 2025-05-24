import { ConnectButton } from '@rainbow-me/rainbowkit';
import { truncate } from '@/utils/utils';

export default function ConnectBtn() {
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
            className='px-4 py-2 rounded bg-sph-purple-light font-inter font-bold hover:bg-[#00cc00] text-white hover:text-black transition text-sm duration-300 ease-out'
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
                'translate-y-[1px] flex gap-4 items-center ' +
                (mounted && account ? 'text-sm' : '')
              }
            >
              {mounted && account ? (
                <>
                  <div className=''>{account.displayBalance}</div>
                  <div className=''>
                    {account.ensName || account.displayName}
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
