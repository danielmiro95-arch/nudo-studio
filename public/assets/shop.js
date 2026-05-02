// Nudo Studio — Tienda: filtros por categoría
//
// Inferimos la categoría de cada producto a partir de su .img-ph-label
// (texto descriptivo del producto). El usuario hace click en un
// .cat-pill y filtramos qué cards se muestran.

(function () {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  const items   = Array.from(grid.querySelectorAll('.product-card'));
  const filters = Array.from(document.querySelectorAll('.cat-pill'));
  if (!filters.length) return;

  // Cada categoría con un patrón que matchea contra el label.
  // Algunos productos pueden caer en varias categorías (ej. "centro
  // de mesa" → Decoración + Floral) — guardamos array y matcheamos
  // si el filtro está en cualquiera.
  const CATEGORY_PATTERNS = {
    'Decoración':       /jarr|mantel|servillet|centro/i,
    'Regalos a mano':   /caja|welcome|pack/i,
    'Velas':            /vela/i,
    'Floral':           /ramo|centro/i,
    'Papelería':        /papel|sello|lacre/i,
  };

  items.forEach((item) => {
    const label = (item.querySelector('.img-ph-label')?.textContent || '').trim();
    const cats = [];
    for (const [cat, re] of Object.entries(CATEGORY_PATTERNS)) {
      if (re.test(label)) cats.push(cat);
    }
    item.dataset.categories = cats.join('|');
  });

  // El texto del filtro lleva contador entre paréntesis ("Velas (5)") —
  // lo strippeamos para comparar contra el nombre limpio.
  function filterName(text) {
    return text.replace(/\s*\(.*\)\s*$/, '').trim();
  }

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const name = filterName(btn.textContent);
      items.forEach((item) => {
        const cats = (item.dataset.categories || '').split('|').filter(Boolean);
        const visible = name === 'Todo' || cats.includes(name);
        item.style.display = visible ? '' : 'none';
      });
    });
  });
})();
