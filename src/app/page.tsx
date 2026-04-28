import Script from 'next/script';
import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Eventos & Regalos a mano',
  description:
    'Estudio de eventos íntimos y atelier de regalos a mano. Bodas, comuniones y celebraciones con dirección de diseño. Madrid · La Habana.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const { body, styles } = await readLegacyPage('index.html');
  return (
    <>
      {/* CSS inline del head legacy (animación del hero, etc.) */}
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      {/* Markup del body legacy. Es contenido nuestro, estático y confiable. */}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/assets/hero-revolut.js" strategy="afterInteractive" />
    </>
  );
}
