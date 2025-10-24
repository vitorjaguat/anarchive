import { zora } from 'viem/chains';
import { http, custom, createPublicClient, createWalletClient } from 'viem';

export const chain = zora;
export const chainId = zora.id;

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

let walletClientInstance;

if (typeof window !== 'undefined' && window.ethereum) {
  walletClientInstance = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
} else {
  // Provide a fallback implementation for server-side rendering or when no wallet is available
  walletClientInstance = createWalletClient({
    chain,
    transport: http(), // Use HTTP transport for server-side or fallback
  });
}

export const walletClient = walletClientInstance;

export const creatorAccountPromise = (async function getAddresses() {
  try {
    if (
      typeof window !== 'undefined' &&
      window.ethereum &&
      walletClientInstance.transport?.request
    ) {
      const creatorAccountArr = await walletClient.getAddresses();
      return creatorAccountArr[0];
    }
    return null;
  } catch (error) {
    console.warn('Failed to get wallet addresses:', error);
    return null;
  }
})();

// import { zora } from 'viem/chains';
// import { http, custom, createPublicClient, createWalletClient } from 'viem';

// export const chain = zora;
// export const chainId = zora.id;

// export const publicClient = createPublicClient({
//   // this will determine which chain to interact with
//   chain,
//   transport: http(),
// });

// export const walletClient = createWalletClient({
//   chain,
//   transport: custom(window.ethereum),
// });

// export const creatorAccountPromise = (async function getAddresses() {
//   const creatorAccountArr = await walletClient.getAddresses();
//   return creatorAccountArr[0];
// })();
// // const creatorAccountArr = await walletClient.getAddresses();
// // export const creatorAccount = creatorAccountArr[0];
