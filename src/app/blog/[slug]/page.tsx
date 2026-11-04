import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost, posts } from '@/data/posts';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Diario', robots: { index: false } };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      images: [{ url: `${post.image}.webp`, alt: post.imageAlt }],
    },
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const CSS = `
.art26{max-width:1360px;margin:0 auto;padding:0 40px;color:#111}
.art26-head{max-width:860px;margin:0 auto;padding:56px 0 40px;text-align:center}
.art26-meta{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#6B5E55}
.art26-head h1{margin:20px 0 0;font-family:var(--font-serif);font-weight:400;font-size:clamp(38px,5vw,64px);line-height:1.04;letter-spacing:-.015em}
.art26-lead{margin:22px auto 0;max-width:60ch;font-size:18px;line-height:1.6;color:#3D3530}
.art26-cover img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;display:block;background:#F1EAE2}
.art26-body{max-width:680px;margin:0 auto;padding:56px 0 40px;font-size:18px;line-height:1.75;color:#2A2420}
.art26-body p{margin:0 0 1.3em}
.art26-body h2{margin:1.8em 0 .6em;font-family:var(--font-serif);font-weight:400;font-size:32px;line-height:1.15;color:#111}
.art26-cta{max-width:680px;margin:0 auto 96px;padding:36px;border:1px solid #E8DED4;border-radius:6px;display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between}
.art26-cta p{margin:0;font-family:var(--font-serif);font-size:26px;line-height:1.2}
.art26-cta a{display:inline-flex;align-items:center;height:50px;padding:0 26px;border-radius:999px;background:#111;color:#FAF8F5;text-decoration:none;font-size:15px}
.art26-cta a:hover{background:#8E4E5C}
.art26-more{padding:0 0 120px}
.art26-more h2{margin:0 0 28px;font-family:var(--font-serif);font-weight:400;font-size:40px}
.art26-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.art26-grid a{color:#111;text-decoration:none;display:flex;flex-direction:column;gap:10px}
.art26-grid img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:6px;background:#F1EAE2}
.art26-grid span{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#6B5E55}
.art26-grid b{font-family:var(--font-serif);font-weight:400;font-size:22px;line-height:1.2}
@media (max-width:900px){
  .art26{padding:0 16px}.art26-head{padding:32px 0 28px}
  .art26-body{padding-top:36px;font-size:17px}
  .art26-grid{grid-template-columns:1fr}
  .art26-cta{padding:24px}
}
`;

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nudostudio.blog';
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: `${SITE}${post.image}.webp`,
    author: { '@type': 'Organization', name: 'Nudo Studio', url: SITE },
    publisher: { '@type': 'Organization', name: 'Nudo Studio', logo: { '@type': 'ImageObject', url: `${SITE}/assets/icon-512.png` } },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div data-slot="header" />
      <main className="art26" id="contenido">
        <header className="art26-head">
          <div className="art26-meta">
            <a href="/blog" style={{ color: 'inherit' }}>Diario</a> · {post.category} · {post.minutes} min · <time dateTime={post.date}>{fmtDate(post.date)}</time>
          </div>
          <h1>{post.title}</h1>
          <p className="art26-lead">{post.excerpt}</p>
        </header>

        <picture className="art26-cover">
          <source type="image/avif" srcSet={`${post.image}-800.avif 800w, ${post.image}.avif 1600w`} sizes="(max-width:900px) 100vw, 1280px" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${post.image}.webp`} srcSet={`${post.image}-800.webp 800w, ${post.image}.webp 1600w`} sizes="(max-width:900px) 100vw, 1280px" alt={post.imageAlt} fetchPriority="high" />
        </picture>

        <article className="art26-body">
          {post.body.map((b, i) =>
            b.startsWith('## ') ? <h2 key={i}>{b.slice(3)}</h2> : <p key={i}>{b}</p>,
          )}
        </article>

        <aside className="art26-cta">
          <p>¿Lo diseñamos para vosotros?</p>
          <a href="/contacto">Pedir propuesta</a>
        </aside>

        <section className="art26-more">
          <h2>Seguir leyendo</h2>
          <div className="art26-grid">
            {more.map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${p.image}-800.webp`} alt="" loading="lazy" />
                <span>{p.category} · {p.minutes} min</span>
                <b>{p.title}</b>
              </a>
            ))}
          </div>
        </section>
      </main>
      <div data-slot="footer" />
    </>
  );
}
