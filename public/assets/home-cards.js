// Nudo Studio — Home cards animations
// 1. Services bento: highlight rotativo (cycle entre cards cada N seg).
// 2. Shop cards (atelier): 3D flip lento con stagger.

(function () {
  function initBentoHighlight() {
    var cards = document.querySelectorAll('.services-bento .sb');
    if (!cards.length) return;
    var idx = 0;
    function tick() {
      cards.forEach(function (c) { c.classList.remove('is-featured'); });
      cards[idx].classList.add('is-featured');
      idx = (idx + 1) % cards.length;
    }
    tick();
    setInterval(tick, 5000);
  }

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
    initBentoHighlight();
    initShopFlip();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
