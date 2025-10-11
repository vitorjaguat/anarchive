import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import localFont from '@next/font/local';

// import { reservoirChains } from '@reservoir0x/reservoir-sdk';
// import { ReservoirKitProvider, darkTheme } from '@reservoir0x/reservoir-kit-ui';
import dynamic from 'next/dynamic';
const WalletProviders = dynamic(() => import('@/components/WalletProviders'), {
  ssr: false,
});

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
});

// const theme = darkTheme({
//   font: inter.style.fontFamily,
//   primaryColor: '#323aa8',
//   primaryHoverColor: '#252ea5',
// });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* <Headhead /> */}
      <main className={`${inter.variable} font-inter`}>
        <WalletProviders>
          <Component {...pageProps} />
        </WalletProviders>
      </main>
    </>
  );
}
