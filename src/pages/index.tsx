import Image from 'next/image';
import { Inter } from 'next/font/google';
import GraphWrapper from '../components/GraphWrapper';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main
      className={`bg-gray-600 flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      <GraphWrapper />
    </main>
  );
}
