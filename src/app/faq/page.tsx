import Script from 'next/script';
import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Preguntas frecuentes sobre los servicios y la tienda de Nudo Studio. Envíos, plazos, presupuestos.',
  alternates: { canonical: '/faq' },
};

// Extrae las parejas pregunta/respuesta del HTML legacy para generar
// el schema FAQPage. Al derivarse del propio contenido, no se
// desincroniza si se editan las preguntas.
function buildFaqJsonLd(body: string) {
  const items = [...body.matchAll(
    /<button class="q">(.*?)<span class="plus">[\s\S]*?<div class="a">([\s\S]*?)<\/div>/g
  )].map(([, q, a]) => ({
    '@type': 'Question',
    name: q.replace(/<[^>]+>/g, '').trim(),
    acceptedAnswer: {
      '@type': 'Answer',
      text: a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    },
  }));
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  };
}

export default async function FaqPage() {
  const { body, styles } = await readLegacyPage('faq.html');
  const faqLd = buildFaqJsonLd(body);
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/assets/faq.js" strategy="afterInteractive" />
    </>
  );
}
