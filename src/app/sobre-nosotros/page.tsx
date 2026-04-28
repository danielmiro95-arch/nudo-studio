import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'El estudio',
  description: 'El estudio detrás de Nudo: equipo, filosofía y sedes en Madrid y La Habana. Diseño íntimo, producción cercana.',
  alternates: { canonical: '/sobre-nosotros' },
};

export default async function SobreNosotrosPage() {
  const { body, styles } = await readLegacyPage('sobre-nosotros.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
