import { createThirdwebClient, type ThirdwebClient } from 'thirdweb';

let client: ThirdwebClient | undefined;

// Lazily constructed so importing this module during SSR/build (where
// NEXT_PUBLIC_THIRDWEB_CLIENT_ID may be unset) doesn't throw before any
// upload is actually attempted.
export function getThirdwebClient(): ThirdwebClient {
  if (!client) {
    client = createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
    });
  }
  return client;
}
