export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
.nf26{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#FAF8F5;color:#111}
.nf26-img{background:#F1EAE2 url(/assets/photo-detalle.webp) center/cover}
.nf26-txt{display:flex;flex-direction:column;justify-content:center;gap:22px;padding:64px clamp(24px,6vw,96px)}
.nf26-txt small{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#6B5E55}
.nf26-txt h1{margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:clamp(44px,6vw,80px);line-height:1}
.nf26-txt p{margin:0;max-width:44ch;font-size:17px;line-height:1.6;color:#3D3530}
.nf26-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
.nf26-links a{display:inline-flex;align-items:center;height:48px;padding:0 22px;border-radius:999px;border:1px solid #D9CCBF;color:#111;text-decoration:none;font-size:15px}
.nf26-links a:first-child{background:#111;border-color:#111;color:#FAF8F5}
@media (max-width:800px){.nf26{grid-template-columns:1fr}.nf26-img{min-height:38vh}}
` }} />
      <main className="nf26" id="contenido">
        <div className="nf26-img" role="img" aria-label="Detalle de papelería de Nudo Studio" />
        <div className="nf26-txt">
          <small>Error 404</small>
          <h1>Este hilo se ha soltado.</h1>
          <p>La página que buscas no existe o ha cambiado de sitio. Te dejamos algunos caminos para seguir.</p>
          <nav className="nf26-links" aria-label="Enlaces útiles">
            <a href="/">Volver al inicio</a>
            <a href="/servicios">Servicios</a>
            <a href="/tienda">Tienda</a>
            <a href="/contacto">Contacto</a>
          </nav>
        </div>
      </main>
    </>
  );
}
