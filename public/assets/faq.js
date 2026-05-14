// Nudo Studio — FAQ accordion toggle
//
// El <script> inline del legacy faq.html se elimina por readLegacyPage,
// así que la lógica vive aquí y se carga vía <Script> en page.tsx.

(function () {
  function init() {
    const questions = document.querySelectorAll('.faq-list .q');
    if (!questions.length) return;
    questions.forEach((q) => {
      q.addEventListener('click', () => {
        const item = q.closest('.item');
        if (item) item.classList.toggle('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
