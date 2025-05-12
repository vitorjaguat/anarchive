import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function NavbarMobile() {
  return (
    <div className='fixed bottom-0 left-0 right-0 h-20 bg-slate-800'>
      <div className='flex items-center justify-between w-full h-full px-3'>
        <div className='flex flex-col text-sm w-fit leading-4'>
          <div className=''>The</div>
          <div>Anarchiving</div>
          <div>Game</div>
        </div>
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
                className='px-4 py-2 rounded bg-[#01ff00] text-black font-bold hover:bg-[#00cc00] transition text-sm'
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
                {mounted && account ? account.displayName : 'Connect'}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}
