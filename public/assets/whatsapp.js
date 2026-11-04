// Nudo Studio — botón de WhatsApp con mensaje según la página.
(function () {
  if (window.__nudoWa) return;
  window.__nudoWa = true;
  var NUMBER = '34624324882'; // +34 624 32 48 82 (el de contacto)

  function message() {
    var p = location.pathname;
    var h1 = (document.querySelector('h1') || {}).textContent || '';
    h1 = h1.replace(/\s+/g, ' ').trim();
    if (p.indexOf('/producto/') === 0 && h1) return 'Hola, tengo una pregunta sobre «' + h1 + '».';
    if (p.indexOf('/tienda') === 0 || p.indexOf('/carrito') === 0) return 'Hola, tengo una pregunta sobre la tienda.';
    if (p.indexOf('/servicios') === 0) {
      var hash = (location.hash || '').replace('#', '');
      var map = { bodas: 'mi boda', comuniones: 'una comunión', privados: 'un evento privado' };
      return 'Hola, me gustaría información para ' + (map[hash] || 'un evento') + '.';
    }
    if (p.indexOf('/galeria') === 0) return 'Hola, he visto vuestra galería y me gustaría información para mi evento.';
    return 'Hola, me gustaría información para mi evento.';
  }

  var css = '.nudo-wa{position:fixed;left:16px;bottom:16px;z-index:45;width:54px;height:54px;border-radius:50%;background:#111;color:#FAF8F5;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(17,17,17,.18);transition:transform .3s cubic-bezier(.22,1,.36,1),background .3s}' +
    '.nudo-wa:hover{transform:translateY(-2px) scale(1.04);background:#1f7a4d}' +
    '.nudo-wa:focus-visible{outline:2px solid #8E4E5C;outline-offset:3px}' +
    '@media (max-width:700px){.nudo-wa{width:50px;height:50px;left:14px;bottom:14px}body:has(.mobile-cta-26) .nudo-wa{bottom:88px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var a = document.createElement('a');
  a.className = 'nudo-wa';
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Escríbenos por WhatsApp');
  a.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';
  function refresh() { a.href = 'https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(message()); }
  a.addEventListener('mouseenter', refresh);
  a.addEventListener('focus', refresh);
  a.addEventListener('touchstart', refresh, { passive: true });
  refresh();

  function mount() { if (!document.body.contains(a)) document.body.appendChild(a); refresh(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  // Navegación del App Router: refrescar el mensaje al cambiar de ruta.
  var last = location.href;
  setInterval(function () { if (location.href !== last) { last = location.href; mount(); } }, 800);
})();
