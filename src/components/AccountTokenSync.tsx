'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { Token } from '../../types/tokens';

type AccountTokenSyncProps = {
  showMineIsChecked: boolean;
  allTokens: Token[];
  setUsersFrags: (tokens: Token[]) => void;
};

export default function AccountTokenSync({
  showMineIsChecked,
  allTokens,
  setUsersFrags,
}: AccountTokenSyncProps) {
  const account = useAccount();

  useEffect(() => {
    let isCancelled = false;

    const syncUserFragments = async () => {
      if (!showMineIsChecked || !account.address) {
        setUsersFrags([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/user-tokens?address=${account.address}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tokenIds: string[] = await response.json();

        if (!isCancelled) {
          const userTokens = allTokens.filter((token) =>
            tokenIds.includes(token.token.tokenId)
          );

          setUsersFrags(userTokens);
        }
      } catch (error) {
        console.error('Error fetching user tokens: ', error);
        if (!isCancelled) {
          setUsersFrags([]);
        }
      }
    };

    syncUserFragments();

    return () => {
      isCancelled = true;
    };
  }, [account.address, showMineIsChecked, allTokens, setUsersFrags]);

  return null;
}
