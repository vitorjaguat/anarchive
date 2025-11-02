'use client';

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { useAccount } from 'wagmi';
import type { Token } from '../../types/tokens';

type AccountTokenSyncProps = {
  showMineIsChecked: boolean;
  allTokens: Token[];
  setUsersFrags: Dispatch<SetStateAction<Token[]>>;
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
        setUsersFrags((prevTokens) => {
          if (prevTokens.length === 0) {
            return prevTokens;
          }
          return [];
        });
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

          setUsersFrags((prevTokens) => {
            if (prevTokens.length === userTokens.length) {
              const same = prevTokens.every((prevToken, index) => {
                return (
                  prevToken.token.tokenId ===
                  userTokens[index]?.token.tokenId
                );
              });

              if (same) {
                return prevTokens;
              }
            }

            return userTokens;
          });
        }
      } catch (error) {
        console.error('Error fetching user tokens: ', error);
        if (!isCancelled) {
          setUsersFrags((prevTokens) => {
            if (prevTokens.length === 0) {
              return prevTokens;
            }
            return [];
          });
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
