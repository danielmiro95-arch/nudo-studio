import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, products } from '@/data/products';
import AddToCart from './AddToCart';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

const webp = (src: string) => src.replace(/\.jpg$/, '.webp');
const base = (src: string) => src.replace(/\.(jpg|webp)$/, '');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: 'Producto', description: 'Pieza del atelier Nudo Studio.', robots: { index: false } };
  }
  const url = `/producto/${product.slug}`;
  const image = product.images[0] ? webp(product.images[0]) : undefined;
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} — Nudo Studio`,
      description: product.shortDescription,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

const CATEGORY: Record<string, string> = {
  caja: 'Cajas y regalos',
  vela: 'Velas',
  ramo: 'Flor preservada',
  papeleria: 'Papelería',
  decoracion: 'Mesa y decoración',
};

const OPTIONS: Record<string, { label: string; values: string[] }> = {
  'caja-antigua': { label: 'Personalización', values: ['Sin personalizar', 'Iniciales en lacre', 'Mensaje manuscrito'] },
  sellos: { label: 'Color del lacre', values: ['Granate', 'Crudo', 'Negro'] },
  'mantel-lino': { label: 'Mesa', values: ['6 comensales', '8 comensales', '10 comensales'] },
};

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 ? 2 : 0 });

const CSS = `
.pdp26{max-width:1360px;margin:0 auto;padding:0 40px;color:#111}
.pdp26-crumbs{display:flex;gap:8px;flex-wrap:wrap;padding:28px 0 8px;font-size:13px;color:#6B5E55}
.pdp26-crumbs a{color:#6B5E55;text-decoration:none}.pdp26-crumbs a:hover{color:#111}
.pdp26-main{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:64px;padding:24px 0 96px}
.pdp26-media img{width:100%;aspect-ratio:4/5;max-height:760px;object-fit:cover;border-radius:6px;background:#F1EAE2;display:block}
.pdp26-info{position:sticky;top:96px;align-self:start;display:flex;flex-direction:column;gap:22px}
.pdp26-eyebrow{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#6B5E55}
.pdp26-info h1{margin:0;font-family:var(--font-serif);font-weight:400;font-size:clamp(44px,5vw,68px);line-height:1;letter-spacing:-.015em}
.pdp26-price{font-size:24px}
.pdp26-lead{margin:0;font-size:17px;line-height:1.6;color:#3D3530}
.pdp26-desc{margin:0;font-size:15px;line-height:1.7;color:#3D3530}
.pdp26-buy{display:flex;flex-direction:column;gap:18px}
.pdp26-opts{border:0;margin:0;padding:0}
.pdp26-opts legend{font-size:13px;color:#3D3530;margin-bottom:10px}
.pdp26-opts div{display:flex;flex-wrap:wrap;gap:8px}
.pdp26-opts button{min-height:44px;padding:0 18px;border-radius:999px;border:1px solid #D9CCBF;background:transparent;font:inherit;font-size:14px;color:#111;cursor:pointer}
.pdp26-opts button[aria-pressed=true]{background:#111;color:#FAF8F5;border-color:#111}
.pdp26-row{display:flex;gap:12px;flex-wrap:wrap}
.pdp26-qty{display:flex;align-items:center;border:1px solid #D9CCBF;border-radius:999px}
.pdp26-qty button{width:48px;height:52px;border:0;background:transparent;font-size:20px;cursor:pointer;color:#111}
.pdp26-qty span{min-width:24px;text-align:center}
.pdp26-add{flex:1;min-width:220px;height:54px;border:0;border-radius:999px;background:#111;color:#FAF8F5;font:inherit;font-size:15px;font-weight:500;cursor:pointer}
.pdp26-add:hover{background:#8E4E5C}
.pdp26-added{margin:0;font-size:14px;color:#3D3530}.pdp26-added a{color:#8E4E5C}
.pdp26-meta{list-style:none;margin:0;padding:0;border-top:1px solid #E8DED4}
.pdp26-meta li{display:flex;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid #E8DED4;font-size:15px}
.pdp26-meta li span:last-child{color:#6B5E55;text-align:right}
.pdp26-meta a{color:#8E4E5C}
.pdp26-related{padding:0 0 120px}
.pdp26-related h2{margin:0 0 32px;font-family:var(--font-serif);font-weight:400;font-size:44px}
.pdp26-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.pdp26-grid a{text-decoration:none;color:#111;display:flex;flex-direction:column;gap:12px}
.pdp26-grid img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:6px;background:#F1EAE2;transition:transform .5s ease}
.pdp26-grid a:hover img{transform:scale(1.02)}
.pdp26-grid .row{display:flex;justify-content:space-between;gap:12px;font-size:15px}
@media (max-width:900px){
  .pdp26{padding:0 16px}
  .pdp26-main{grid-template-columns:1fr;gap:28px;padding-bottom:64px}
  .pdp26-info{position:static}
  .pdp26-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .pdp26-grid a:nth-child(3){display:none}
}
`;

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.slug !== product.slug && p.available)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 3);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div data-slot="header" />
      <main className="pdp26">
        <nav className="pdp26-crumbs" aria-label="Migas de pan">
          <a href="/">Inicio</a><span aria-hidden="true">/</span>
          <a href="/tienda">Tienda</a><span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <section className="pdp26-main">
          <div className="pdp26-media">
            {product.images[0] && (
              <picture style={{ viewTransitionName: 'producto-media', display: 'block' }}>
                <source
                  type="image/avif"
                  srcSet={`${base(product.images[0])}-800.avif 800w, ${base(product.images[0])}.avif 1600w`}
                  sizes="(max-width: 900px) 100vw, 55vw"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={webp(product.images[0])}
                  srcSet={`${base(product.images[0])}-800.webp 800w, ${webp(product.images[0])} 1600w`}
                  sizes="(max-width: 900px) 100vw, 55vw"
                  alt={product.name}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            )}
          </div>

          <div className="pdp26-info">
            <span className="pdp26-eyebrow">{CATEGORY[product.category] ?? 'Atelier'} · Hecho a mano en Madrid</span>
            <h1>{product.name}</h1>
            <div className="pdp26-price">{fmt(product.priceCents)}</div>
            <p className="pdp26-lead">{product.shortDescription}</p>
            <p className="pdp26-desc">{product.longDescription}</p>

            {product.available ? (
              <AddToCart
                slug={product.slug}
                name={product.name}
                priceCents={product.priceCents}
                options={OPTIONS[product.slug]}
              />
            ) : (
              <p className="pdp26-lead">Agotado por ahora. <a href="/contacto">Avísame cuando vuelva</a></p>
            )}

            <ul className="pdp26-meta">
              <li><span>Envío</span><span>Península 24/48 h</span></li>
              <li><span>Para eventos</span><span><a href="/contacto">Pedidos personalizados</a></span></li>
              {product.customizable && <li><span>Personalizable</span><span>Iniciales y mensaje</span></li>}
            </ul>
          </div>
        </section>

        {related.length > 0 && (
          <section className="pdp26-related">
            <h2>Combina con</h2>
            <div className="pdp26-grid">
              {related.map((p) => (
                <a key={p.slug} href={`/producto/${p.slug}`}>
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${base(p.images[0])}-800.webp`} alt={p.name} loading="lazy" decoding="async" />
                  )}
                  <span className="row"><span>{p.name}</span><span>{fmt(p.priceCents)}</span></span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
      <div data-slot="footer" />
    </>
  );
}
