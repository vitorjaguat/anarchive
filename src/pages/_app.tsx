import '@/styles/globals.css';
import type { AppProps } from 'next/app';

//wagmi:
import {
  WagmiConfig,
  createConfig,
  configureChains,
  type CreateConfigParameters,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

//reservoir:
import {
  ReservoirKitProvider,
  darkTheme,
  ReservoirKitTheme,
  CartProvider,
} from '@reservoir0x/reservoir-kit-ui';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { reservoirChains } from '@reservoir0x/reservoir-sdk';
import { zora } from 'wagmi/chains';

const zoraChain = {
  ...zora,
  lightIconUrl: '/icons/zora-icon-dark.svg',
  darkIconUrl: '/icons/zora-icon-light.svg',
  reservoirBaseUrl: reservoirChains.zora.baseApiUrl,
  proxyApi: '/api/reservoir/zora',
  routePrefix: 'zora',
  coingeckoId: 'ethereum',
  checkPollingInterval: reservoirChains.zora.checkPollingInterval,
};

const { connectors } = getDefaultWallets({
  // appName: 'Reservoir NFT Explorer',
  appName: 'The Sphere Common Pool',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [zoraChain],
});

const { chains, publicClient } = configureChains(
  [{ ...zoraChain }],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || '' }),
    publicProvider(),
  ]
);

const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});
// const wagmiClient = createConfig({
//   // autoConnect: true,
//   chains: [zora],
//   connectors: [injected()],
// });
console.log('wagmiClient', wagmiClient);
const theme = darkTheme({
  headlineFont: 'Sans Serif',
  font: 'Serif',
  primaryColor: '#323aa8',
  primaryHoverColor: '#252ea5',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiClient}>
      <ReservoirKitProvider
        options={{
          // Reservoir API key which you can generate at https://reservoir.tools/
          // This is a protected key and displays as 'undefined' on the browser
          // DO NOT add NEXT_PUBLIC to the key or you'll risk leaking it on the browser
          apiKey: process.env.RESERVOIR_API_KEY,
          //CONFIGURABLE: Override any configuration available in RK: https://docs.reservoir.tools/docs/reservoirkit-ui#configuring-reservoirkit-ui
          // Note that you should at the very least configure the source with your own domain
          chains: [{ ...reservoirChains.zora, active: true }],
          logLevel: 4,
          // source: source,
          normalizeRoyalties: true,
          //CONFIGURABLE: Set your marketplace fee and recipient, (fee is in BPS)
          // Note that this impacts orders created on your marketplace (offers/listings)
          // marketplaceFee: 250,
          // marketplaceFeeRecipient: "0xabc"
          disablePoweredByReservoir: true,
        }}
        theme={theme}
      >
        <Component {...pageProps} />
      </ReservoirKitProvider>
    </WagmiConfig>
  );
}
