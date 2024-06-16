import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, zora } from 'wagmi/chains';

export const config = createConfig({
  chains: [zora],
  transports: {
    [zora.id]: http(),
  },
});
