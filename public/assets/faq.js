// Nudo Studio — FAQ: accordion toggle + filtros de categoría
//
// El <script> inline del legacy faq.html se elimina por readLegacyPage,
// así que la lógica vive aquí y se carga vía <Script> en page.tsx.

(function () {
  function init() {
    // ─── Accordion ──────────────────────────────────────────────────
    const questions = document.querySelectorAll('.faq-list .q');
    questions.forEach((q) => {
      // Estado inicial aria-expanded coherente con .open
      const item = q.closest('.item');
      q.setAttribute('aria-expanded', String(!!(item && item.classList.contains('open'))));
      q.addEventListener('click', () => {
        if (!item) return;
        item.classList.toggle('open');
        q.setAttribute('aria-expanded', String(item.classList.contains('open')));
      });
    });

    // ─── Filtros por categoría ─────────────────────────────────────
    const tabs  = document.querySelectorAll('.faq-cats a[data-cat]');
    const items = document.querySelectorAll('.faq-list .item');
    if (!tabs.length || !items.length) return;

    function applyFilter(cat) {
      items.forEach((item) => {
        const cats = (item.dataset.category || '').split('|').filter(Boolean);
        item.style.display = cats.includes(cat) ? '' : 'none';
      });
    }

    // Estado inicial aria-pressed coherente con .active
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.classList.contains('active'))));
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-pressed', 'true');
        applyFilter(tab.dataset.cat);
      });
    });

    // Estado inicial: aplica el filtro de la pestaña ya activa ("Eventos").
    const initialTab = document.querySelector('.faq-cats a.active');
    if (initialTab && initialTab.dataset.cat) applyFilter(initialTab.dataset.cat);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
