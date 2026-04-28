import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Nuestros servicios',
  description: 'Servicios de Nudo Studio: bodas, comuniones, fiestas privadas, eventos corporativos, baby & bridal showers y coordinación. Madrid · La Habana.',
  alternates: { canonical: '/servicios' },
};

export default async function ServiciosPage() {
  const { body, styles } = await readLegacyPage('servicios.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
