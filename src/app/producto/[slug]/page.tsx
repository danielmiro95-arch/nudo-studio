import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';
import { getProductBySlug, products } from '@/data/products';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

// Metadatos propios por producto: antes todas las fichas compartían
// título «Producto» y descripción genérica, sin canonical.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: 'Producto', description: 'Pieza del atelier Nudo Studio.', robots: { index: false } };
  }
  const url = `/producto/${product.slug}`;
  const image = product.images[0]?.replace(/\.jpg$/, '.webp');
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} — Nudo Studio`,
      description: product.shortDescription,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductoPage() {
  // Plantilla estática por ahora. La fase 3 (tienda) la convertirá
  // en dinámica leyendo de src/data/products.ts según [slug].
  const { body, styles } = await readLegacyPage('producto.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
