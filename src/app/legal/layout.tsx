import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: true, follow: false },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(24px, 6vw, 80px)' }}>
      <div data-slot="header" style={{ marginBottom: 48 }} />
      <article className="legal-content">{children}</article>
      <div data-slot="footer" style={{ marginTop: 80 }} />
      <style>{`
        .legal-content { font-family: 'Inter', system-ui, sans-serif; color: #0A0A0A; line-height: 1.65; }
        .legal-content h1 { font-size: clamp(28px, 4vw, 40px); font-weight: 600; letter-spacing: -.02em; margin: 0 0 8px; }
        .legal-content h2 { font-size: 18px; font-weight: 600; margin: 40px 0 12px; }
        .legal-content p, .legal-content li { font-size: 15px; }
        .legal-content ul { padding-left: 20px; }
        .legal-content .meta { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #8a857d; margin: 0 0 24px; }
        .legal-content .placeholder { background: #FFF7E5; padding: 2px 6px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
      `}</style>
    </main>
  );
}
