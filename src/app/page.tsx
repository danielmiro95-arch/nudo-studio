import Script from 'next/script';
import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  // absolute: evita el template "%s — Nudo Studio" porque el título
  // ya incluye la marca al principio.
  title: { absolute: 'Nudo Studio — Bodas, eventos íntimos y regalos a mano en Madrid' },
  description:
    'Estudio de eventos íntimos y atelier de regalos a mano. Bodas, comuniones y celebraciones con dirección de diseño. Madrid.',
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
      <Script src="/assets/home-cards.js" strategy="afterInteractive" />
    </>
  );
}
