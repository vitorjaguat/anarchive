// clientZoraprotocolConfig.js

import { zora } from 'viem/chains';
import { http, custom, createPublicClient, createWalletClient } from 'viem';

export const chain = zora;
export const chainId = zora.id;

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain,
  transport: custom(window.ethereum),
});

export const creatorAccountPromise = (async function getAddresses() {
  const creatorAccountArr = await walletClient.getAddresses();
  return creatorAccountArr[0];
})();
