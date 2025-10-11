'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { config as wagmiConfig } from '../../wagmiConfig';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { MainContextProvider } from '@/context/mainContext';

const queryClient = new QueryClient();

export default function WalletProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize='compact'>
          <ThirdwebProvider
            clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
          >
            <MainContextProvider>{children}</MainContextProvider>
          </ThirdwebProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
