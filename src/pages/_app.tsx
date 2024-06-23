import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import localFont from '@next/font/local';
import contract from '../utils/contract';
import Headhead from '@/components/Headhead';

import { reservoirChains } from '@reservoir0x/reservoir-sdk';
import { ReservoirKitProvider, darkTheme } from '@reservoir0x/reservoir-kit-ui';
import { WagmiProvider } from 'wagmi';
import { config } from '../../wagmiConfig';
import {
  RainbowKitProvider,
  // getDefaultConfig,
  // darkTheme as rainbowDarkTheme,
  // lightTheme as rainbowLightTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useEffect, useState } from 'react';

const inter = localFont({
  src: [
    {
      path: '../../public/assets/space_grotesk_light.otf',
      weight: '300',
      style: 'thin',
    },
    {
      path: '../../public/assets/space_grotesk_medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/space_grotesk_semibold.otf',
      weight: '700',
      style: 'bold',
    },
  ],
  variable: '--inter-font',
  display: 'swap',
  // src: '../public/assets/space_grotesk_medium.otf',
});

const theme = darkTheme({
  headlineFont: 'Sans Serif',
  // font: 'Serif',
  font: inter.style.fontFamily,
  primaryColor: '#323aa8',
  primaryHoverColor: '#252ea5',
});

const wagmiConfig = config;

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  //fetch collection tokens:
  const [allTokens, setAllTokens] = useState([]);

  // sorting tokens:
  const [sort, setSort] = useState('From');
  const [showMineIsChecked, setShowMineIsChecked] = useState(false);

  //filter tokens by content tag (searchbar):
  const [filter, setFilter] = useState([]);

  //fetching token data using API:
  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET',
        headers: { accept: '*/*', 'x-api-key': process.env.RESERVOIR_API_KEY },
      };

      try {
        const response = await fetch(
          `https://api-zora.reservoir.tools/tokens/v6?collection=${contract}&sortBy=updatedAt&limit=1000&includeAttributes=true`,
          options
        );
        const data = await response.json();
        setAllTokens(data.tokens);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Headhead />
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ReservoirKitProvider
            options={{
              // Reservoir API key which you can generate at https://reservoir.tools/
              // This is a protected key and displays as 'undefined' on the browser
              // DO NOT add NEXT_PUBLIC to the key or you'll risk leaking it on the browser
              apiKey: process.env.RESERVOIR_API_KEY,
              //CONFIGURABLE: Override any configuration available in RK: https://docs.reservoir.tools/docs/reservoirkit-ui#configuring-reservoirkit-ui
              // Note that you should at the very least configure the source with your own domain
              chains: [{ ...reservoirChains.zora, active: true }],
              // logLevel: 4,
              // source: source,
              normalizeRoyalties: true,
              //CONFIGURABLE: Set your marketplace fee and recipient, (fee is in BPS)
              // Note that this impacts orders created on your marketplace (offers/listings)
              // marketplaceFee: 250,
              // marketplaceFeeRecipient: "0xabc"
              disablePoweredByReservoir: true,
              bountyReferrer: '0xBFd118f0ff5d6f4D3Eb999eAF197Dbfcc421C5Ea',
            }}
            theme={theme}
          >
            <RainbowKitProvider modalSize='compact'>
              <main className={`${inter.variable} font-inter`}>
                <Layout
                  sort={sort}
                  setSort={setSort}
                  filter={filter}
                  setFilter={setFilter}
                  showMineIsChecked={showMineIsChecked}
                  setShowMineIsChecked={setShowMineIsChecked}
                  allTokens={allTokens}
                >
                  {/* <AnimatePresence mode='wait'> */}
                  <Component
                    allTokens={allTokens}
                    sort={sort}
                    filter={filter}
                    setFilter={setFilter}
                    showMineIsChecked={showMineIsChecked}
                    {...pageProps}
                  />
                  {/* </AnimatePresence> */}
                </Layout>
              </main>
            </RainbowKitProvider>
          </ReservoirKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
