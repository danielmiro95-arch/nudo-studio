import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Testimonios',
  description: 'Lo que dicen nuestros clientes — testimonios reales de bodas, comuniones y celebraciones producidas por Nudo Studio.',
  alternates: { canonical: '/testimonios' },
};

export default async function TestimoniosPage() {
  const { body, styles } = await readLegacyPage('testimonios.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
