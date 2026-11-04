import type { Metadata } from 'next';

// /login es una página cliente: los metadatos van en su layout.
export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accede a tu cuenta de Nudo Studio para ver tus pedidos.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
