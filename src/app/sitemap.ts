import type { MetadataRoute } from 'next';
import { getAvailableProducts } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nudostudio.blog';
  const now = new Date();

  const staticRoutes = [
    '',
    '/servicios',
    '/galeria',
    '/tienda',
    '/sobre-nosotros',
    '/contacto',
    '/blog',
    '/faq',
    '/testimonios',
    '/asistente',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const productRoutes = getAvailableProducts().map((p) => ({
    url: `${base}/producto/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
