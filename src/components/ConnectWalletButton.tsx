import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FC } from 'react';

type Props = {};

export const ConnectWalletButton: FC<Props> = () => {
  return (
    // <ConnectButton.Custom>
    //   {({ account, chain, openConnectModal, mounted }) => {
    //     return (
    //       <div>
    //         {(() => {
    //           if (!mounted || !account || !chain) {
    //             return (
    //               <button className='' onClick={openConnectModal}>
    //                 Connect Wallet
    //               </button>
    //             );
    //           }
    //         })()}
    //       </div>
    //     );
    //   }}
    // </ConnectButton.Custom>
    <ConnectButton />
  );
};
