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

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
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
  `;
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
    lb.querySelector('.lb-img').src = src;
    lb.querySelector('.lb-img').alt = cap;
    lb.querySelector('.lb-caption').textContent = cap;
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

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    else if (e.key === 'ArrowLeft')  show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
