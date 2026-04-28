import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Producto',
  description: 'Pieza del atelier Nudo Studio.',
};

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
