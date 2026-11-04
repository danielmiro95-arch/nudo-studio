import type { Metadata } from 'next';
import FormEmpresas from './FormEmpresas';

export const metadata: Metadata = {
  title: 'Regalos para empresas',
  description:
    'Regalos corporativos hechos a mano en Madrid: cestas de Navidad, bienvenida de empleados, regalos a clientes y eventos de empresa. Personalizados con vuestra marca y con descuento por volumen.',
  alternates: { canonical: '/empresas' },
  openGraph: { images: [{ url: '/assets/photo-regalos.webp', alt: 'Regalos corporativos hechos a mano' }] },
};

const CSS = `
.emp26{color:#111}
.emp26-wrap{max-width:1360px;margin:0 auto;padding:0 40px}
.emp26-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center;padding:56px 0 96px}
.emp26-eyebrow{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#6B5E55}
.emp26 h1{margin:16px 0 0;font-family:var(--font-serif);font-weight:400;font-size:clamp(46px,6vw,88px);line-height:.98;letter-spacing:-.015em}
.emp26-lead{margin:24px 0 0;font-size:18px;line-height:1.6;color:#3D3530;max-width:48ch}
.emp26-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.emp26-btn{display:inline-flex;align-items:center;height:54px;padding:0 28px;border-radius:999px;background:#111;color:#FAF8F5;text-decoration:none;font-size:15px;font-weight:500;border:1px solid #111}
.emp26-btn:hover{background:#8E4E5C;border-color:#8E4E5C}
.emp26-btn.alt{background:transparent;color:#111;border-color:#D9CCBF}
.emp26-btn.alt:hover{border-color:#111;background:transparent}
.emp26-hero img{width:100%;aspect-ratio:4/5;max-height:680px;object-fit:cover;border-radius:6px;display:block;background:#F1EAE2}
.emp26-sec{padding:96px 0;border-top:1px solid #E8DED4}
.emp26 h2{margin:0 0 40px;font-family:var(--font-serif);font-weight:400;font-size:clamp(34px,4vw,54px);line-height:1.05;max-width:20ch}
.emp26-uses{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.emp26-use{padding:28px;border:1px solid #E8DED4;border-radius:6px;display:flex;flex-direction:column;gap:10px}
.emp26-use small{font-size:12px;letter-spacing:.2em;color:#8E4E5C;text-transform:uppercase}
.emp26-use b{font-family:var(--font-serif);font-weight:400;font-size:26px;line-height:1.1}
.emp26-use p{margin:0;font-size:15px;line-height:1.6;color:#3D3530}
.emp26-why{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px}
.emp26-why b{display:block;font-size:17px;font-weight:500;margin-bottom:8px}
.emp26-why p{margin:0;font-size:15px;line-height:1.6;color:#3D3530}
.emp26-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;counter-reset:s}
.emp26-steps div{counter-increment:s}
.emp26-steps div::before{content:"0" counter(s);display:block;font-size:12px;letter-spacing:.2em;color:#8E4E5C;margin-bottom:10px}
.emp26-steps b{display:block;font-family:var(--font-serif);font-weight:400;font-size:24px;margin-bottom:6px}
.emp26-steps p{margin:0;font-size:14px;line-height:1.6;color:#3D3530}
.emp26-form-sec{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:56px}
.emp26-form-sec aside p{font-size:16px;line-height:1.6;color:#3D3530}
.emp26-form-sec aside a{color:#8E4E5C}
@media (max-width:960px){
  .emp26-wrap{padding:0 16px}
  .emp26-hero,.emp26-form-sec{grid-template-columns:1fr;gap:32px}
  .emp26-hero{padding:32px 0 64px}
  .emp26-hero img{aspect-ratio:4/3}
  .emp26-uses,.emp26-steps{grid-template-columns:1fr 1fr}
  .emp26-why{grid-template-columns:1fr;gap:24px}
  .emp26-sec{padding:64px 0}
}
@media (max-width:560px){.emp26-uses,.emp26-steps{grid-template-columns:1fr}}
`;

const USOS = [
  ['Navidad', 'Cestas y cajas de fin de año', 'Para equipos y clientes: piezas útiles de productores pequeños, envueltas a mano y con vuestra tarjeta.'],
  ['Onboarding', 'Bienvenida de empleados', 'Un primer día que se recuerda: caja de bienvenida con detalles de la casa y mensaje del equipo.'],
  ['Clientes', 'Agradecimiento y fidelización', 'Para cerrar un proyecto, celebrar un aniversario o decir gracias sin caer en el típico regalo promocional.'],
  ['Eventos', 'Welcome packs y detalles', 'Kits para convenciones, cenas de empresa o presentaciones, entregados en el lugar del evento.'],
];

export default function EmpresasPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div data-slot="header" />
      <main className="emp26" id="contenido">
        <div className="emp26-wrap">
          <section className="emp26-hero">
            <div>
              <span className="emp26-eyebrow">Regalos corporativos · Hechos a mano en Madrid</span>
              <h1>Regalos de empresa que no acaban en un cajón.</h1>
              <p className="emp26-lead">
                Diseñamos y montamos a mano regalos para vuestro equipo y vuestros clientes: Navidad, bienvenidas,
                agradecimientos y eventos. Personalizados con vuestra marca y con precio por volumen.
              </p>
              <div className="emp26-ctas">
                <a className="emp26-btn" href="#presupuesto">Pedir presupuesto</a>
                <a className="emp26-btn alt" href="/cajas-a-medida">Configurar una caja</a>
              </div>
            </div>
            <picture>
              <source type="image/avif" srcSet="/assets/photo-regalos-800.avif 800w, /assets/photo-regalos.avif 1600w" sizes="(max-width:960px) 100vw, 50vw" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/photo-regalos.webp" srcSet="/assets/photo-regalos-800.webp 800w, /assets/photo-regalos.webp 1600w" sizes="(max-width:960px) 100vw, 50vw" alt="Regalos envueltos a mano en el atelier" fetchPriority="high" />
            </picture>
          </section>

          <section className="emp26-sec">
            <h2>Para cada momento del año.</h2>
            <div className="emp26-uses">
              {USOS.map(([k, t, d]) => (
                <div className="emp26-use" key={k}>
                  <small>{k}</small>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="emp26-sec">
            <h2>Por qué con un atelier.</h2>
            <div className="emp26-why">
              <div><b>Con vuestra marca, sin logos gritones</b><p>Lacre con vuestras iniciales, tarjeta con el mensaje del equipo y colores de marca en cinta y papel.</p></div>
              <div><b>Piezas útiles y de calidad</b><p>Velas de cera natural, lino, flor preservada y producto de obradores pequeños. Nada de relleno.</p></div>
              <div><b>Un solo interlocutor</b><p>Os acompañamos desde la idea hasta la entrega, también a varias direcciones o al lugar del evento.</p></div>
              <div><b>Precio por volumen</b><p>Descuento a partir de 25 unidades y presupuesto cerrado antes de empezar.</p></div>
              <div><b>Muestra antes de producir</b><p>Para pedidos grandes preparamos una caja de muestra para que la veáis y la aprobéis.</p></div>
              <div><b>Factura de empresa</b><p>Presupuesto y factura a nombre de la empresa, con IVA desglosado.</p></div>
            </div>
          </section>

          <section className="emp26-sec">
            <h2>Así trabajamos.</h2>
            <div className="emp26-steps">
              <div><b>Brief</b><p>Nos contáis para quién es, cuántas unidades, presupuesto por persona y fecha.</p></div>
              <div><b>Propuesta</b><p>Os enviamos una o dos propuestas con contenido, presentación y precio cerrado.</p></div>
              <div><b>Muestra</b><p>Preparamos una caja de muestra y ajustamos lo que haga falta.</p></div>
              <div><b>Producción y entrega</b><p>Montamos cada caja a mano y la entregamos donde nos digáis.</p></div>
            </div>
          </section>

          <section className="emp26-sec emp26-form-sec" id="presupuesto">
            <aside>
              <h2>Pedid presupuesto.</h2>
              <p>Respondemos con una propuesta adaptada a vuestra cantidad y presupuesto por persona.</p>
              <p>
                Para Navidad, cuanto antes mejor: los pedidos grandes necesitan unas semanas de producción.
              </p>
              <p>
                ¿Prefieres hablar? Escríbenos por <a href="https://wa.me/34624324882?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20regalos%20de%20empresa." target="_blank" rel="noopener">WhatsApp</a>.
              </p>
            </aside>
            <FormEmpresas />
          </section>
        </div>
      </main>
      <div data-slot="footer" />
    </>
  );
}
