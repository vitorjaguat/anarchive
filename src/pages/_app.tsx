import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import Headhead from '@/components/Headhead';
import localFont from 'next/font/local';
import dynamic from 'next/dynamic';
// import { reservoirChains } from '@reservoir0x/reservoir-sdk';
// import { ReservoirKitProvider, darkTheme } from '@reservoir0x/reservoir-kit-ui';

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

type OgMeta = {
  title: string;
  description: string;
  ogImage: string;
  canonicalUrl: string;
};

const DEFAULT_META: OgMeta = {
  title: 'The Anarchiving Game',
  description:
    "A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined.",
  ogImage: 'https://anarchiving.thesphere.as/meta/ogImage2025.jpg',
  canonicalUrl: '/',
};

type ExtendedAppProps = AppProps & {
  pageProps: AppProps['pageProps'] & { ogMeta?: OgMeta };
};

export default function App({ Component, pageProps }: ExtendedAppProps) {
  const { ogMeta, ...restPageProps } = pageProps;
  const meta = ogMeta ?? DEFAULT_META;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {!isClient && <Headhead {...meta} />}
      <main className={`${inter.variable} font-inter`}>
        <WalletProviders>
          <Component
            {...(restPageProps as typeof restPageProps)}
            ogMeta={meta}
          />
        </WalletProviders>
      </main>
    </>
  );
}
