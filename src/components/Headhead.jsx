import Head from 'next/head';
import favicon from '../../public/meta/image1.png';
import ogimage from '../../public/meta/image2.png';

export default function Headhead() {
  return (
    <>
      <Head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width' />
        <link rel='icon' href={'/meta/image1.png'} />
        <title>The Anarchiving Game</title>
        <meta
          name='description'
          content="A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined."
        />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@thesphere_as' />
        <meta name='twitter:title' content='The Anarchiving Game' />
        <meta
          name='twitter:description'
          content="A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined,"
        />
        <meta name='twitter:image' content='/meta/image2.png' />
        <meta property='og:type' content='website' />
        <meta property='og:determiner' content='the' />
        <meta property='og:locale' content='en' />
        <meta property='og:title' content='The Anarchiving Game' />
        <meta
          property='og:description'
          content="A dynamic, participatory open canvas where community's memories and creativity are continuously interpreted and reimagined."
        />
        <meta property='og:image' content='/meta/image2.png' />
        <meta property='og:image:type' content='image/png' />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:image:alt' content='The Anarchiving Game' />
      </Head>
    </>
  );
}
