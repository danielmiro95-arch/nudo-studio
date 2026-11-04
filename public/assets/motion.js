// Nudo Studio — movimiento global (bloque 2, 2026)
//  1. Transiciones entre páginas (View Transitions entre documentos) con
//     foto compartida tienda → ficha de producto.
//  2. Cursor «Ver» sobre fotos (solo ratón).
//  3. Scroll suave con Lenis (solo ratón y fuera de la portada, que ya
//     controla su propio scroll con la animación del hero).
// Todo se desactiva con prefers-reduced-motion.
(function () {
  if (window.__nudoMotion) return;
  window.__nudoMotion = true;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) return;

  var css = '' +
    // 1. Transiciones entre páginas: viven en styles.css (deben estar
    //    antes del primer pintado de la página nueva).
    // 2. Cursor.
    '.nudo-cursor{position:fixed;left:0;top:0;z-index:9999;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;' +
    'background:rgba(17,17,17,.88);color:#FAF8F5;display:flex;align-items:center;justify-content:center;' +
    'font:500 13px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;pointer-events:none;' +
    'transform:translate3d(-200px,-200px,0) scale(0);transition:transform .35s cubic-bezier(.22,1,.36,1),opacity .2s;' +
    'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}' +
    // 3. Lenis.
    'html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}' +
    '.lenis.lenis-stopped{overflow:hidden}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ── 1. Foto compartida: al pulsar un producto de la tienda, su foto
  // pasa a llamarse «producto-media», igual que la foto de la ficha.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="/producto/"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    if (e.target.closest('.quick-add')) return;
    var media = a.querySelector('.img-ph, img, picture');
    if (!media) return;
    document.querySelectorAll('[style*="producto-media"]').forEach(function (el) { el.style.viewTransitionName = ''; });
    media.style.viewTransitionName = 'producto-media';
  }, true);

  // ── 2. Cursor «Ver».
  if (fine) {
    var TARGETS = '.gi, .product-card, .pdp26-grid a, .sc-card, .service-card-scroll, .services a:has(img), a:has(> picture)';
    var c = document.createElement('div');
    c.className = 'nudo-cursor';
    c.setAttribute('aria-hidden', 'true');
    c.textContent = 'Ver';
    var x = -200, y = -200, on = false;
    function paint() { c.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + (on ? 1 : 0) + ')'; }
    document.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      var t = e.target.closest && e.target.closest(TARGETS);
      var next = !!t && !e.target.closest('button, .quick-add, input, select, textarea');
      if (next !== on) { on = next; }
      c.textContent = t && t.closest('.product-card, .pdp26-grid a') ? 'Ver pieza' : 'Ver';
      requestAnimationFrame(paint);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { on = false; paint(); });
    var mountC = function () { document.body.appendChild(c); };
    if (document.body) mountC(); else document.addEventListener('DOMContentLoaded', mountC);
  }

  // ── 3. Lenis (solo escritorio, nunca en la portada).
  var isHome = location.pathname === '/' || !!document.getElementById('heroSticky');
  if (fine && !isHome) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.async = true;
    s.onload = function () {
      if (!window.Lenis) return;
      var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      window.nudoLenis = lenis;
      var stopped = false;
      function raf(t) {
        // Si algo bloquea el scroll (visor de galería, menú, carrito), pausar.
        var locked = document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden';
        if (locked && !stopped) { lenis.stop(); stopped = true; }
        else if (!locked && stopped) { lenis.start(); stopped = false; }
        lenis.raf(t);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      // Anclas internas (#seccion) con el mismo suavizado.
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href').length < 2) return;
        var t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -90 });
      });
    };
    document.head.appendChild(s);
  }
})();
