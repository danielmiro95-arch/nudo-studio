import type { Metadata } from 'next';
import Script from 'next/script';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Asistente IA — Nudo',
  description: 'Habla con Nudo, el asistente IA de Nudo Studio. Mood-boards, presupuestos y propuestas para tu evento al instante.',
  alternates: { canonical: '/asistente' },
};

export default async function AsistentePage() {
  const { body, styles } = await readLegacyPage('asistente.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/assets/forms.js" strategy="afterInteractive" />
    </>
  );
}
