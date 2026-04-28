import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Atelier — Tienda',
  description: 'Catálogo del atelier Nudo Studio: cajas regalo, velas, ramos preservados, papelería y decoración hecha a mano. Envíos a península y Cuba.',
  alternates: { canonical: '/tienda' },
};

export default async function TiendaPage() {
  const { body, styles } = await readLegacyPage('tienda.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
