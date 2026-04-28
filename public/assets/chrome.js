// Nudo Studio — chrome compartido (header + footer + FAB IA + cart badge)
// Inyectado en cada página vía data-attrs en <body>.

(function () {
  const NAV = [
    { href: "/",                 label: "Inicio" },
    { href: "/servicios",        label: "Servicios" },
    { href: "/galeria",          label: "Galería" },
    { href: "/tienda",           label: "Tienda" },
    { href: "/asistente",        label: "Asistente IA" },
    { href: "/sobre-nosotros",   label: "Estudio" },
    { href: "/contacto",         label: "Contacto" },
  ];

  // Pathname actual sin trailing slash (excepto en home). Lo usamos para
  // marcar el link activo del NAV — body.dataset.page sigue en formato
  // legacy ("X.html") y ya no encaja con las clean routes.
  function currentPath() {
    var p = (window.location.pathname || "/").replace(/\/+$/, "");
    return p || "/";
  }

  function renderHeader() {
    const onDark = document.body.dataset.headerOnDark === "true";
    const active = currentPath();

    const links = NAV.map(n => `
      <li><a href="${n.href}" class="${active === n.href ? 'active' : ''}">${n.label}</a></li>
    `).join("");

    return `
    <header class="site-header ${onDark ? 'on-dark' : ''}">
      <div class="container-wide">
        <nav class="nav">
          <a href="/" class="nav-brand">
            <span class="nav-brand-mark" aria-hidden="true">N</span>
            <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
          </a>
          <ul class="nav-links">${links}</ul>
          <div class="nav-cta">
            <a href="/contacto" class="btn btn-outline hide-on-mobile" style="${onDark ? 'border-color: rgba(255,255,255,0.25); color: inherit;' : ''}">Pedir presupuesto</a>
            <a href="/carrito" class="nav-cart" aria-label="Carrito">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7H8.5A2 2 0 0 1 6.5 18L5 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
              <span class="badge" data-cart-count>2</span>
            </a>
          </div>
        </nav>
      </div>
    </header>`;
  }

  function renderFooter() {
    return `
    <footer class="site-footer">
      <div class="container-wide">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="nav-brand" style="color: var(--ink-on-dark);">
              <span class="nav-brand-mark" aria-hidden="true" style="filter: invert(1);">N</span>
              <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
            </a>
            <p class="footer-tag">
              Decoración y producción de eventos íntimos en Madrid y La Habana. Regalos hechos a mano para los días que se recuerdan.
            </p>
          </div>
          <div class="footer-col">
            <h4>Estudio</h4>
            <ul>
              <li><a href="/sobre-nosotros">Sobre nosotros</a></li>
              <li><a href="/galeria">Portfolio</a></li>
              <li><a href="/blog">Diario</a></li>
              <li><a href="/testimonios">Testimonios</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Servicios</h4>
            <ul>
              <li><a href="/servicios#bodas">Bodas</a></li>
              <li><a href="/servicios#comuniones">Comuniones</a></li>
              <li><a href="/servicios#privados">Fiestas privadas</a></li>
              <li><a href="/servicios#corporativo">Corporativo</a></li>
              <li><a href="/servicios#showers">Baby & bridal</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Tienda</h4>
            <ul>
              <li><a href="/tienda">Catálogo</a></li>
              <li><a href="/tienda?cat=decoracion">Decoración</a></li>
              <li><a href="/tienda?cat=regalos">Regalos a mano</a></li>
              <li><a href="/carrito">Mi carrito</a></li>
              <li><a href="/faq">Envíos & devoluciones</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Nudo Studio · Madrid — La Habana</span>
          <div class="legal">
            <a href="/legal/aviso-legal">Aviso legal</a>
            <a href="/legal/privacidad">Privacidad</a>
            <a href="/legal/cookies">Cookies</a>
            <a href="/legal/terminos">Términos</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  function renderFab() {
    if (document.body.dataset.hideFab === "true") return "";
    return `
      <a href="/asistente" class="ai-fab" aria-label="Abrir asistente IA">
        <span class="ai-fab-dot"></span>
        <span>Hola, soy Nudo · ¿hablamos?</span>
      </a>
    `;
  }

  function init() {
    const headerSlot = document.querySelector("[data-slot='header']");
    if (headerSlot) headerSlot.outerHTML = renderHeader();
    const footerSlot = document.querySelector("[data-slot='footer']");
    if (footerSlot) footerSlot.outerHTML = renderFooter();
    const fabSlot = document.querySelector("[data-slot='fab']");
    if (fabSlot) fabSlot.outerHTML = renderFab();

    // Sync cart count from localStorage if available
    try {
      const c = JSON.parse(localStorage.getItem("nudo_cart") || "[]");
      const count = c.reduce((n, it) => n + (it.qty || 1), 0);
      document.querySelectorAll("[data-cart-count]").forEach(el => {
        el.textContent = count;
        if (count === 0) el.style.display = "none";
      });
    } catch (e) {}
  }

  // chrome.js se carga vía Next.js <Script strategy="afterInteractive">,
  // que dispara DESPUÉS de DOMContentLoaded. Si esperamos al evento, nunca
  // llega y los slots quedan sin reemplazar. Comprobamos readyState.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
