// Nudo Studio — Tienda: filtros por categoría + 200 placeholders
//
// Inferimos la categoría de cada producto a partir de su .img-ph-label
// (texto descriptivo del producto). El usuario hace click en un
// .cat-pill y filtramos qué cards se muestran.
//
// Adicionalmente: inyectamos 200 placeholders beige tras los reales
// para previsualizar layout/scroll de catálogo grande. Marcados con
// .is-placeholder y data-placeholder="1" — los filtros los ignoran y
// solo aparecen en "Todo".

(function () {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  // ─── PLACEHOLDERS ────────────────────────────────────────────────────
  // Generador determinista: mismo precio cada recarga (usa el index).
  function placeholderPrice(i) {
    // 5–20 € en céntimos, con seed simple. Usamos un wave para que
    // los precios se sientan variados pero no aleatorios reales.
    const cents = 500 + ((i * 137) % 1500);
    const eur = Math.floor(cents / 100);
    const dec = String(cents % 100).padStart(2, '0');
    return dec === '00' ? `${eur} €` : `${eur},${dec} €`;
  }

  function placeholderPriceCents(i) {
    return 500 + ((i * 137) % 1500);
  }

  function buildPlaceholderCards(n) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const cents = placeholderPriceCents(i);
      const a = document.createElement('a');
      a.href = '/tienda';
      a.className = 'product-card is-placeholder';
      a.dataset.placeholder = '1';
      // Nombre único por index para que la cesta no colapse 200 cards
      // distintas en una sola línea al hacer quick-add.
      a.dataset.cartName  = `Producto #${i + 1}`;
      a.dataset.priceCents = String(cents);
      a.innerHTML = `
        <div class="img-ph"><span class="img-ph-label">Producto</span><span class="quick-add">+</span></div>
        <div class="name">Producto</div>
        <div class="price">${placeholderPrice(i)}</div>
      `;
      frag.appendChild(a);
    }
    return frag;
  }

  grid.appendChild(buildPlaceholderCards(200));

  // Después de inyectar: refrescamos la lista de items.
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
        const isPlaceholder = item.dataset.placeholder === '1';
        const cats = (item.dataset.categories || '').split('|').filter(Boolean);
        // Placeholders solo visibles en "Todo"; cualquier filtro los oculta.
        const visible = name === 'Todo'
          ? true
          : !isPlaceholder && cats.includes(name);
        item.style.display = visible ? '' : 'none';
      });
    });
  });

  // ─── ORDENAR ─────────────────────────────────────────────────────────
  // Parser robusto: "22 €" → 2200, "desde 48 €" → 4800, "12,50 €" → 1250.
  function parsePriceCents(str) {
    const m = String(str || '').match(/(\d+)(?:[.,](\d+))?/);
    if (!m) return Infinity;
    const eur = parseInt(m[1], 10);
    const dec = m[2] ? parseInt(m[2].padEnd(2, '0').slice(0, 2), 10) : 0;
    return eur * 100 + dec;
  }

  // Cachea precio + orden original (para "Destacados").
  items.forEach((item, i) => {
    item.dataset.originalIndex = String(i);
    const priceText = item.querySelector('.price')?.textContent || '';
    item.dataset.priceCents = String(parsePriceCents(priceText));
  });

  // ─── QUICK-ADD A LA CESTA ───────────────────────────────────────────
  // Click en el "+" de cada card: añade el producto a localStorage
  // "nudo_cart" e incrementa qty si ya existe. Bloquea la navegación
  // del <a> padre con preventDefault + stopPropagation.
  function readCart() {
    try {
      const arr = JSON.parse(localStorage.getItem('nudo_cart') || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function writeCart(items) {
    try { localStorage.setItem('nudo_cart', JSON.stringify(items)); } catch {}
  }
  function syncCartBadge() {
    const c = readCart();
    const count = c.reduce((n, it) => n + (it.qty || 1), 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = String(count);
      el.style.display = count === 0 ? 'none' : '';
    });
  }
  function showToast(message) {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:32px', 'transform:translateX(-50%) translateY(8px)',
      'z-index:9999', 'padding:14px 22px',
      'background:#0A0A0A', 'color:#FAF6F2', 'border-radius:999px',
      'font-family:Inter,system-ui,sans-serif', 'font-size:14px',
      'box-shadow:0 12px 32px rgba(0,0,0,.18)',
      'opacity:0', 'transition:opacity .2s ease, transform .3s cubic-bezier(.22,1,.36,1)',
      'pointer-events:none', 'max-width:90vw',
    ].join(';');
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 250);
    }, 2200);
  }

  function addToCart(card) {
    // Nombre del item: data-cart-name (placeholders) o .name (reales)
    const name = card.dataset.cartName
              || (card.querySelector('.name')?.textContent || 'Producto').trim();
    const meta = (card.querySelector('.meta')?.textContent || '').trim();
    // Precio: data-price-cents (placeholders) o parseado de .price
    let priceCents;
    if (card.dataset.priceCents) {
      priceCents = Number(card.dataset.priceCents);
    } else {
      const priceText = (card.querySelector('.price')?.textContent || '').trim();
      priceCents = parsePriceCents(priceText);
    }

    const cart = readCart();
    const existing = cart.find((it) => it.name === name);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        name,
        meta,
        priceCents,
        price: priceCents / 100,
        qty: 1,
      });
    }
    writeCart(cart);
    syncCartBadge();
    showToast(`Añadido a la cesta · ${name}`);
  }

  // Delegación: click en cualquier .quick-add dentro de la grid
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-add');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const card = btn.closest('.product-card');
    if (!card) return;
    addToCart(card);
  });

  const select = document.querySelector('.sort-select');
  if (select) {
    select.addEventListener('change', () => {
      const opt = select.value || select.options[select.selectedIndex].textContent;
      const lower = opt.toLowerCase();
      const sorted = items.slice();
      if (lower.includes('asc')) {
        sorted.sort((a, b) => Number(a.dataset.priceCents) - Number(b.dataset.priceCents));
      } else if (lower.includes('desc')) {
        sorted.sort((a, b) => Number(b.dataset.priceCents) - Number(a.dataset.priceCents));
      } else if (lower.includes('novedades')) {
        // Novedades = orden inverso al original (los últimos añadidos arriba).
        sorted.sort((a, b) => Number(b.dataset.originalIndex) - Number(a.dataset.originalIndex));
      } else {
        // Destacados / por defecto: orden original.
        sorted.sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));
      }
      // Re-append en el nuevo orden (mover preserva listeners).
      const frag = document.createDocumentFragment();
      sorted.forEach((it) => frag.appendChild(it));
      grid.appendChild(frag);
    });
  }
})();
