'use client';

import React, { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { config as wagmiConfig } from '../../wagmiConfig';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { MainContextProvider } from '@/context/mainContext';

export default function WalletProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setIsClient(true);
  }, []);

  const appTree = (
    <ThirdwebProvider clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}>
      <MainContextProvider>{children}</MainContextProvider>
    </ThirdwebProvider>
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {isClient ? (
          <RainbowKitProvider modalSize='compact'>{appTree}</RainbowKitProvider>
        ) : (
          appTree
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
