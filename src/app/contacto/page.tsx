import type { Metadata } from 'next';
import Script from 'next/script';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con Nudo Studio para tu boda, comunión, evento o regalo personalizado. Madrid · La Habana.',
  alternates: { canonical: '/contacto' },
};

export default async function ContactoPage() {
  const { body, styles } = await readLegacyPage('contacto.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/assets/forms.js" strategy="afterInteractive" />
    </>
  );
}
