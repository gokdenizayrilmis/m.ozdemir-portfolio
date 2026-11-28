import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://drmustafaozdemir.com'
  ).replace(/\/$/, '');

  // Prevent search engines from indexing temporary staging / *.vercel.app URLs
  if (!allowIndexing) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
