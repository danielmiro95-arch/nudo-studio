// Nudo Studio — Galería: filtros por categoría + lightbox
//
// Los <script> inline en /legacy-pages/*.html se eliminan por
// readLegacyPage() (el rewriter strip-ea <script> tags), así que toda
// la lógica de cliente vive aquí y se carga vía <Script> en page.tsx.

(function () {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;
  const items   = Array.from(grid.querySelectorAll('.gi'));
  const filters = Array.from(document.querySelectorAll('.filters .filter'));

  // ─── FILTROS ─────────────────────────────────────────────────────────
  // Cada filtro mapea a una regex que matchea contra el texto de
  // .gi-meta de cada item. "Todo" (null) muestra todo.
  const CATEGORY_MAP = {
    'Todo':         null,
    'Bodas':        /boda/i,
    'Comuniones':   /comuni/i,
    'Privadas':     /privada|shower/i,
    'Corporativo':  /corporativo/i,
    'Atelier':      /atelier/i,
  };

  // Cachea la categoría de cada item desde su .gi-meta.
  items.forEach((item) => {
    const metaText = (item.querySelector('.gi-meta')?.textContent || '').trim();
    item.dataset.category = metaText;
  });

  // Estado inicial aria-pressed
  filters.forEach((b) => b.setAttribute('aria-pressed', String(b.classList.contains('active'))));
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const label = btn.textContent.trim();
      const re = CATEGORY_MAP[label];
      items.forEach((item) => {
        const visible = re == null || re.test(item.dataset.category || '');
        item.style.display = visible ? '' : 'none';
      });
    });
  });

  // ─── LIGHTBOX ────────────────────────────────────────────────────────
  // Inyectamos overlay full-screen una sola vez. Click en cualquier .gi
  // abre la imagen grande. Navegación con flechas o botones. ESC cierra.
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" aria-label="Cerrar lightbox">×</button>
    <button class="lb-prev"  aria-label="Imagen anterior">‹</button>
    <button class="lb-next"  aria-label="Imagen siguiente">›</button>
    <figure class="lb-figure">
      <img class="lb-img" alt="">
      <figcaption class="lb-caption"></figcaption>
    </figure>
    <div class="lb-count" aria-live="polite"></div>
  `;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Visor de la galería');
  // Estilos extra 2026: fundido entre fotos, contador y entrada suave.
  const lbStyle = document.createElement('style');
  lbStyle.textContent =
    '.lightbox .lb-img{transition:opacity .35s ease,transform .5s cubic-bezier(.22,1,.36,1)}' +
    '.lightbox .lb-img.lb-swap{opacity:0;transform:scale(.985)}' +
    '.lightbox.open .lb-figure{animation:lb-in .5s cubic-bezier(.22,1,.36,1)}' +
    '@keyframes lb-in{from{opacity:0;transform:scale(.96)}}' +
    '.lightbox .lb-count{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);color:rgba(250,248,245,.75);font:500 12px/1 Inter,system-ui,sans-serif;letter-spacing:.18em}' +
    '.lightbox button{min-width:44px;min-height:44px}' +
    '@media (prefers-reduced-motion: reduce){.lightbox .lb-img,.lightbox.open .lb-figure{transition:none;animation:none}}';
  document.head.appendChild(lbStyle);
  document.body.appendChild(lb);

  function getSrc(item) {
    const photo = item.style.getPropertyValue('--photo');
    const m = photo.match(/url\(['"]?([^'")]+)['"]?\)/);
    return m ? m[1] : null;
  }
  function getCaption(item) {
    const meta = (item.querySelector('.gi-meta')?.textContent || '').trim();
    const name = (item.querySelector('.gi-name')?.textContent || '').trim();
    if (meta && name) return `${meta} — ${name}`;
    return meta || name || '';
  }
  function visibleItems() {
    return items.filter((it) => it.style.display !== 'none');
  }

  let idx = 0;
  function show(i) {
    const list = visibleItems();
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    const item = list[idx];
    const src = getSrc(item);
    if (!src) return;
    const cap = getCaption(item);
    const img = lb.querySelector('.lb-img');
    const apply = () => {
      img.src = src;
      img.alt = cap;
      lb.querySelector('.lb-caption').textContent = cap;
      lb.querySelector('.lb-count').textContent = (idx + 1) + ' / ' + list.length;
      img.classList.remove('lb-swap');
    };
    if (lb.classList.contains('open') && img.getAttribute('src')) {
      img.classList.add('lb-swap');
      setTimeout(apply, 180);
    } else apply();
    // Precarga de las vecinas para que el cambio sea instantáneo.
    [idx - 1, idx + 1].forEach((j) => {
      const n = list[(j + list.length) % list.length];
      const s2 = n && getSrc(n);
      if (s2) { const pre = new Image(); pre.src = s2; }
    });
  }
  function open(i) {
    show(i);
    lb.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  items.forEach((item) => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      const i = visibleItems().indexOf(item);
      if (i >= 0) open(i);
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  // Gestos en móvil: deslizar para cambiar, hacia abajo para cerrar.
  let tx = 0, ty = 0;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
    else if (dy > 90) close();
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    else if (e.key === 'ArrowLeft')  show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
