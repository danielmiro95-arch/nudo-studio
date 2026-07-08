import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Nudo Studio';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nudostudio.blog';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Bodas, eventos íntimos y regalos a mano en Madrid`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Estudio de eventos íntimos y atelier de regalos a mano. Bodas, comuniones y celebraciones con dirección de diseño. Madrid.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: ['bodas', 'eventos', 'comuniones', 'regalos', 'wedding planner', 'Madrid'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Bodas, eventos íntimos y regalos a mano en Madrid`,
    description:
      'Estudio de eventos íntimos y atelier de regalos a mano. Madrid.',
    images: [
      {
        url: '/assets/photo-principal.jpg',
        width: 1800,
        height: 1200,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Eventos & Regalos a mano`,
    description: 'Estudio de eventos íntimos y atelier de regalos a mano.',
    images: ['/assets/photo-principal.jpg'],
  },
  icons: {
    icon: [
      { url: '/assets/logo-trifolio.svg', type: 'image/svg+xml' },
      { url: '/assets/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/assets/favicon-32.png',
    apple: '/assets/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nudo Studio',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
};

const LOCAL_BUSINESS_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  description:
    'Estudio de eventos íntimos y atelier de regalos a mano. Bodas, comuniones y celebraciones con dirección de diseño.',
  url: SITE_URL,
  logo: `${SITE_URL}/assets/icon-512.png`,
  image: `${SITE_URL}/assets/photo-principal.jpg`,
  email: 'hola@nudostudio.blog',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Madrid',
    addressCountry: 'ES',
  },
  areaServed: 'Madrid',
  priceRange: '€€',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_LD) }}
        />
      </head>
      <body>
        {children}
        {/* chrome.js inyecta header / footer / FAB en cualquier página
            que tenga <div data-slot="header" /> etc. — patrón heredado
            del diseño original, lo mantenemos para no duplicar markup. */}
        <Script src="/assets/nudo-ai-orb.js" strategy="beforeInteractive" />
        <Script src="/assets/chrome.js" strategy="afterInteractive" />
        <Script src="/assets/pwa-install.js" strategy="afterInteractive" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
