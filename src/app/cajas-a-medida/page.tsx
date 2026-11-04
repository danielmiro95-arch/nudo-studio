import type { Metadata } from 'next';
import Configurador from './Configurador';

export const metadata: Metadata = {
  title: 'Cajas a medida',
  description:
    'Diseña tu caja regalo hecha a mano: tamaño, contenido y personalización. Para bodas, empresas y celebraciones, con descuento por cantidad. Madrid.',
  alternates: { canonical: '/cajas-a-medida' },
  openGraph: { images: [{ url: '/assets/producto-caja-regalo.webp', alt: 'Caja regalo hecha a mano' }] },
};

export default function CajasPage() {
  return (
    <>
      <div data-slot="header" />
      <Configurador />
      <div data-slot="footer" />
    </>
  );
}
