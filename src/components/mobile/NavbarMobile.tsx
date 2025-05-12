import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BsFillPlusCircleFill } from 'react-icons/bs';

export default function NavbarMobile({
  showMineIsChecked,
  setShowMineIsChecked,
}) {
  return (
    <div className='fixed bottom-0 left-0 right-0 h-20 bg-slate-800'>
      <div className='flex items-center justify-between w-full h-full px-3'>
        {/* LOGO */}
        <div className='flex flex-col text-sm w-fit leading-4'>
          <div className=''>The</div>
          <div>Anarchiving</div>
          <div>Game</div>
        </div>

        {/* CREATE BUTTON */}
        <div className=''>
          <BsFillPlusCircleFill size={24} className='text-[#A0A0FF]' />
        </div>

        {/* CONNECT BUTTON */}
        <div className='flex flex-col gap-1'>
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
                  <div className='translate-y-[1px]'>
                    {mounted && account ? account.displayName : 'Connect'}
                  </div>
                </button>
              );
            }}
          </ConnectButton.Custom>
          <div className='mt-1 flex items-center w-full justify-end'>
            <input
              className='rounded-full h-3 w-3 appearance-none bg-slate-400 checked:bg-slate-600 border-2 border-slate-400 checked:border-slate-400 checked:border-2 checked:rounded-full checked:shadow-inner focus:outline-none focus:ring-1 focus:ring-slate-400 focus:ring-opacity-50'
              type='checkbox'
              name='link-users-frags'
              id='link-users-frags'
              checked={showMineIsChecked}
              onChange={() =>
                setShowMineIsChecked(
                  (prevShowMineIsChecked) => !prevShowMineIsChecked
                )
              }
            />
            <label
              className='ml-2 mb-[-2px] text-xs font-thin text-slate-300'
              htmlFor='link-users-frags'
            >
              Show collected
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
