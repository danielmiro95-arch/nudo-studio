import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '70vh', display: 'grid', placeItems: 'center',
      padding: '64px 24px', fontFamily: 'Inter, system-ui, sans-serif', color: '#0A0A0A',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p style={{ fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: '#8a857d', margin: '0 0 16px', fontFamily: 'JetBrains Mono, monospace' }}>404</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 600, letterSpacing: '-.03em', margin: '0 0 16px' }}>
          Esta página no existe.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, opacity: .7, margin: '0 0 32px' }}>
          Quizá la moviste o nunca llegó a publicarse. Vuelve al inicio o cuéntanos qué buscabas.
        </p>
        <Link href="/" style={{
          display: 'inline-block', padding: '14px 28px',
          background: '#0A0A0A', color: '#FAF6F2',
          borderRadius: 999, textDecoration: 'none',
          fontSize: 14, letterSpacing: '.04em',
        }}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
