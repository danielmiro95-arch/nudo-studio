// Nudo Studio — FAQ: accordion toggle + filtros de categoría
//
// El <script> inline del legacy faq.html se elimina por readLegacyPage,
// así que la lógica vive aquí y se carga vía <Script> en page.tsx.

(function () {
  function init() {
    // ─── Accordion ──────────────────────────────────────────────────
    const questions = document.querySelectorAll('.faq-list .q');
    questions.forEach((q) => {
      q.addEventListener('click', () => {
        const item = q.closest('.item');
        if (item) item.classList.toggle('open');
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

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
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
