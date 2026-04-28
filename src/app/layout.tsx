import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Nudo Studio';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nudostudio.blog';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Eventos & Regalos a mano`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Estudio de eventos íntimos y atelier de regalos a mano. Bodas, comuniones y celebraciones con dirección de diseño. Madrid · La Habana.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: ['bodas', 'eventos', 'comuniones', 'regalos', 'wedding planner', 'Madrid', 'La Habana'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Eventos & Regalos a mano`,
    description:
      'Estudio de eventos íntimos y atelier de regalos a mano. Madrid · La Habana.',
    images: [
      {
        url: '/assets/photo-bodas.jpg',
        width: 1536,
        height: 1024,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Eventos & Regalos a mano`,
    description: 'Estudio de eventos íntimos y atelier de regalos a mano.',
    images: ['/assets/photo-bodas.jpg'],
  },
  icons: {
    icon: '/assets/logo-nudo-trim.png',
    shortcut: '/assets/logo-nudo-trim.png',
    apple: '/assets/logo-nudo-trim.png',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF6F2',
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
      </head>
      <body>
        {children}
        {/* chrome.js inyecta header / footer / FAB en cualquier página
            que tenga <div data-slot="header" /> etc. — patrón heredado
            del diseño original, lo mantenemos para no duplicar markup. */}
        <Script src="/assets/chrome.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
