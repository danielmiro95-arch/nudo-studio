import type { Metadata } from 'next';
import { readLegacyPage } from '@/lib/legacy-html';

export const metadata: Metadata = {
  title: 'Diario',
  description: 'Diario editorial de Nudo Studio: ideas, paletas, paso a paso y reportajes de eventos producidos.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const { body, styles } = await readLegacyPage('blog.html');
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
