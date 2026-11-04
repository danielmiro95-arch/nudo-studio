// Nudo Studio — revelados al hacer scroll (2026)
// - Imágenes: cortinilla de abajo arriba (clip-path) + leve zoom-out.
// - Titulares h2: suben palabra a palabra desde una máscara.
// Sin librerías: IntersectionObserver + CSS. Respeta prefers-reduced-motion.
(function () {
  if (window.__nudoReveal) return;
  window.__nudoReveal = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var css = [
    '.rv-img{clip-path:inset(100% 0 0 0);transform:scale(1.08);transition:clip-path 1.1s cubic-bezier(.77,0,.18,1),transform 1.4s cubic-bezier(.22,1,.36,1);will-change:clip-path,transform}',
    '.rv-img.rv-in{clip-path:inset(0 0 0 0);transform:none}',
    '.rv-w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}',
    '.rv-w>span{display:inline-block;transform:translateY(105%);transition:transform .9s cubic-bezier(.22,1,.36,1)}',
    '.rv-h.rv-in .rv-w>span{transform:none}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var SKIP = '#section-hero, header, footer, nav, [data-slot="header"], [data-slot="footer"], .nav-drawer, .drawer, .ai-fab, .ai-panel, .marquee, .nudo-wa, dialog';

  // OJO: no usamos IntersectionObserver porque Chrome tiene en cuenta el
  // clip-path del propio elemento (oculto = área 0) y nunca lo detecta.
  // Comprobamos la posición real con getBoundingClientRect en cada frame
  // de scroll.
  var pending = [];
  var ticking = false;
  function check() {
    ticking = false;
    var vh = window.innerHeight;
    pending = pending.filter(function (el) {
      if (!el.isConnected) return false;
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return true; // oculto (filtros)
      if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add('rv-in'); return false; }
      return true;
    });
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  var io = { observe: function (el) { pending.push(el); queue(); } };

  function splitHeading(h) {
    var delay = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'rv-w';
            var i = document.createElement('span'); i.textContent = p;
            i.style.transitionDelay = (delay * 0.06).toFixed(2) + 's';
            delay++;
            w.appendChild(i); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    })(h);
  }

  function scan(root) {
    (root || document).querySelectorAll('img, .gi.has-photo').forEach(function (el) {
      if (el.dataset.rv || el.closest(SKIP)) return;
      if (el.tagName === 'IMG' && (el.width && el.width < 120)) return; // iconos/logos
      el.dataset.rv = '1';
      el.classList.add('rv-img');
      io.observe(el);
    });
    (root || document).querySelectorAll('h2').forEach(function (h) {
      if (h.dataset.rv || h.closest(SKIP)) return;
      h.dataset.rv = '1';
      h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
      splitHeading(h);
      h.classList.add('rv-h');
      io.observe(h);
    });
  }

  function start() {
    scan();
    // Contenido que se pinta después (tienda, carrusel, cabecera).
    var t;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(scan, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
