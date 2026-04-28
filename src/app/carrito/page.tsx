import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Tu carrito de Nudo Studio. Atelier de regalos a mano y decoración.',
  alternates: { canonical: '/carrito' },
};

export default async function CarritoPage() {
  const { body, styles } = await readLegacyPage('carrito.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
