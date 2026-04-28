import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nudostudio.blog';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/legal/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
