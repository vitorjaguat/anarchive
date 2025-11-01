import Head from 'next/head';

export default function Headhead({
  ogImage,
  title,
  description,
  canonicalUrl,
}) {
  const baseUrl = 'https://anarchiving.thesphere.as';
  // const baseUrl = 'http://localhost:3003'; // Use localhost for local development
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;

  // Ensure OG image is an absolute URL
  const fullOgImage = ogImage?.startsWith('http')
    ? ogImage
    : ogImage
    ? `${baseUrl}${ogImage}`
    : `${baseUrl}/meta/ogImage2025.jpg`;

  return (
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width' />

      {/* Add canonical URL */}
      <link rel='canonical' href={fullCanonicalUrl} />

      {/* Add custom domain verification for Google Search Console verify property */}
      <meta
        name='google-site-verification'
        content='E-rfv8y0H2rARZRDdhSs4yLkXMv4Bzxa69GBcc2oH_4'
      />

      <link rel='icon' href={`${baseUrl}/meta/favicon20253.png`} />
      <title>{title}</title>
      <meta name='description' content={description} />

      {/* Update all URLs to use custom domain */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@thesphere_as' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={fullOgImage} />

      <meta property='og:type' content='website' />
      <meta property='og:url' content={fullCanonicalUrl} />
      <meta property='og:determiner' content='the' />
      <meta property='og:locale' content='en' />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={fullOgImage} />
      <meta property='og:image:type' content='image/png' />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content={title} />
    </Head>
  );
}
