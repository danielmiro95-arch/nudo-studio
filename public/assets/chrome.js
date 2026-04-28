// Nudo Studio — chrome compartido (header + footer + FAB IA + cart badge)
// Inyectado en cada página vía data-attrs en <body>.

(function () {
  const NAV = [
    { href: "index.html",        label: "Inicio" },
    { href: "servicios.html",    label: "Servicios" },
    { href: "galeria.html",      label: "Galería" },
    { href: "tienda.html",       label: "Tienda" },
    { href: "asistente.html",    label: "Asistente IA" },
    { href: "sobre-nosotros.html", label: "Estudio" },
    { href: "contacto.html",     label: "Contacto" },
  ];

  function renderHeader() {
    const onDark = document.body.dataset.headerOnDark === "true";
    const active = document.body.dataset.page || "";

    const links = NAV.map(n => `
      <li><a href="${n.href}" class="${active === n.href ? 'active' : ''}">${n.label}</a></li>
    `).join("");

    return `
    <header class="site-header ${onDark ? 'on-dark' : ''}">
      <div class="container-wide">
        <nav class="nav">
          <a href="index.html" class="nav-brand">
            <span class="nav-brand-mark" aria-hidden="true">N</span>
            <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
          </a>
          <ul class="nav-links">${links}</ul>
          <div class="nav-cta">
            <a href="contacto.html" class="btn btn-outline hide-on-mobile" style="${onDark ? 'border-color: rgba(255,255,255,0.25); color: inherit;' : ''}">Pedir presupuesto</a>
            <a href="carrito.html" class="nav-cart" aria-label="Carrito">
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
            <a href="index.html" class="nav-brand" style="color: var(--ink-on-dark);">
              <span class="nav-brand-mark" aria-hidden="true" style="filter: invert(1);">N</span>
              <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
            </a>
            <p class="footer-tag">
              Decoración y producción de eventos íntimos en Madrid y La Habana. Regalos hechos a mano para los días que se recuerdan.
            </p>
            <div style="display:flex; gap:10px; margin-top:24px;">
              <a class="chip" href="#" style="background: rgba(255,255,255,0.06); color: var(--ink-on-dark); border-color: rgba(255,255,255,0.1);">Instagram</a>
              <a class="chip" href="#" style="background: rgba(255,255,255,0.06); color: var(--ink-on-dark); border-color: rgba(255,255,255,0.1);">Pinterest</a>
              <a class="chip" href="#" style="background: rgba(255,255,255,0.06); color: var(--ink-on-dark); border-color: rgba(255,255,255,0.1);">TikTok</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Estudio</h4>
            <ul>
              <li><a href="sobre-nosotros.html">Sobre nosotros</a></li>
              <li><a href="galeria.html">Portfolio</a></li>
              <li><a href="blog.html">Diario</a></li>
              <li><a href="testimonios.html">Testimonios</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Servicios</h4>
            <ul>
              <li><a href="servicios.html#bodas">Bodas</a></li>
              <li><a href="servicios.html#comuniones">Comuniones</a></li>
              <li><a href="servicios.html#privados">Fiestas privadas</a></li>
              <li><a href="servicios.html#corporativo">Corporativo</a></li>
              <li><a href="servicios.html#showers">Baby & bridal</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Tienda</h4>
            <ul>
              <li><a href="tienda.html">Catálogo</a></li>
              <li><a href="tienda.html?cat=decoracion">Decoración</a></li>
              <li><a href="tienda.html?cat=regalos">Regalos a mano</a></li>
              <li><a href="carrito.html">Mi carrito</a></li>
              <li><a href="faq.html">Envíos & devoluciones</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Nudo Studio · Madrid — La Habana</span>
          <div class="legal">
            <a href="#">Aviso legal</a>
            <a href="#">Privacidad</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  function renderFab() {
    if (document.body.dataset.hideFab === "true") return "";
    return `
      <a href="asistente.html" class="ai-fab" aria-label="Abrir asistente IA">
        <span class="ai-fab-dot"></span>
        <span>Hola, soy Nudo · ¿hablamos?</span>
      </a>
    `;
  }

  document.addEventListener("DOMContentLoaded", function () {
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
  });
})();
