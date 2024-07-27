import Head from 'next/head';
// import favicon from '../../public/meta/image1.png';
// import ogimage from '../../public/meta/image2.png';

export default function Headhead({ ogImage, title, description }) {
  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width' />
        <link
          rel='icon'
          href='https://the-anarchive.vercel.app/meta/image1.png'
        />
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@thesphere_as' />
        <meta name='twitter:title' content={title} />
        <meta name='twitter:description' content={description} />
        <meta
          name='twitter:image'
          // content='https://the-anarchive.vercel.app/meta/image2.png'
          content={ogImage}
        />
        <meta property='og:type' content='website' />
        <meta property='og:determiner' content='the' />
        <meta property='og:locale' content='en' />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
        <meta
          property='og:image'
          // content='https://the-anarchive.vercel.app/meta/image2.png'
          content={ogImage}
        />
        <meta property='og:image:type' content='image/png' />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:image:alt' content={title} />
      </Head>
    </>
  );
}
