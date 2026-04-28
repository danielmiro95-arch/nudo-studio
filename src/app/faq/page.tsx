import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Preguntas frecuentes sobre los servicios y la tienda de Nudo Studio. Envíos, plazos, presupuestos.',
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const { body, styles } = await readLegacyPage('faq.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
