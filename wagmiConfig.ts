import { http, createConfig } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { mainnet, sepolia, zora } from 'wagmi/chains';

// const zora = {
//   id: 43_114,
//   name: 'Avalanche',
//   network: 'avalanche',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Avalanche',
//     symbol: 'AVAX',
//   },
//   rpcUrls: {
//     public: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
//     default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
//   },
//   blockExplorers: {
//     etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
//     default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
//   },
//   contracts: {
//     multicall3: {
//       address: '0xca11bde05977b3631167028862be2a173976ca11',
//       blockCreated: 11_907_934,
//     },
//   },
// }  as const satisfies Chain;

export const config = createConfig({
  chains: [zora as Chain],
  transports: {
    [zora.id]: http(),
  },
});

// import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
// import { publicProvider } from 'wagmi/providers/public'

// const { publicClient, webSocketPublicClient } = configureChains(
//   [mainnet],
//   [publicProvider()],
// )

// const config = createConfig({
//   publicClient,
//   webSocketPublicClient,
// })

// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// import { zora } from 'wagmi/chains';

// const config = getDefaultConfig({
//   appName: 'My RainbowKit App',
//   projectId: 'YOUR_PROJECT_ID',
//   chains: [zora],
//   ssr: true, // If your dApp uses server side rendering (SSR)
// });
