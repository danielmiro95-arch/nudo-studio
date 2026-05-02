import Script from 'next/script';
import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Galería de eventos producidos por Nudo Studio: bodas, comuniones, eventos corporativos y atelier. Madrid · La Habana.',
  alternates: { canonical: '/galeria' },
};

export default async function GaleriaPage() {
  const { body, styles } = await readLegacyPage('galeria.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/assets/gallery.js" strategy="afterInteractive" />
    </>
  );
}
