// Nudo Studio — Home cards animations
// Shop cards (atelier): 3D flip lento con stagger.
// (El antiguo "highlight cycling" del services-bento se eliminó — la
//  sección ahora es un carrusel auto-scroll en CSS, sin JS necesario.)

(function () {
  function initShopFlip() {
    var cards = document.querySelectorAll('.shop-cards .shop-card');
    if (!cards.length) return;
    var STAGGER = 1500;       // ms entre cards
    var FLIP_HOLD = 2200;     // ms con la cara crema visible
    var CYCLE = 9000;         // ms entre flips de una misma card
    cards.forEach(function (card, i) {
      function flipOnce() {
        card.classList.add('is-flipped');
        setTimeout(function () { card.classList.remove('is-flipped'); }, FLIP_HOLD);
      }
      setTimeout(function () {
        flipOnce();
        setInterval(flipOnce, CYCLE);
      }, i * STAGGER);
    });
  }

  function init() {
    initShopFlip();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
