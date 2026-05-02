// Nudo Studio — Hero Revolut scroll animation (v2: single-image)
//
// CAMBIO ARQUITECTÓNICO v2:
//  - Antes había DOS imágenes (heroBg + heroMask) con transforms
//    independientes. La card era una imagen distinta superpuesta al
//    fondo, con su propio crop/zoom -> a p=0 los crops no coincidían
//    (visual "salto") y todo dependía del zoom del navegador.
//  - Ahora hay UNA SOLA imagen (#heroBg img). Anima de "encuadre
//    natural" (p=0) a "scale + translate" para que el sujeto termine
//    dentro del rect de la card (p=1). El "card" es solo un agujero
//    en el veil blanco que dibuja heroCardRing via box-shadow.
//  - Tamaños PROPORCIONALES al viewport (clamp con min/max). Ya no
//    depende del zoom del navegador.

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 2.5); }
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

  const section = document.getElementById('section-hero');
  if (!section) { console.warn('hero-revolut: no #section-hero'); return; }
  window.__heroRevoluteLoaded = true;

  const sticky       = document.getElementById('heroSticky');
  const heroBg       = document.getElementById('heroBg');
  const heroCardRing = document.getElementById('heroCardRing');
  const heroCardCopy = document.getElementById('heroCardCopy');
  const leftCard     = document.getElementById('leftCard');
  const rightCard    = document.getElementById('rightCard');
  const frontCopy    = document.getElementById('frontCopy');
  const heroEndTitle = document.getElementById('heroEndTitle');
  const heroBgImg    = heroBg ? heroBg.querySelector('img') : null;

  let heroRaw    = 0;
  let heroLocked = true;

  // ─── PAGE SCROLL LOCK ───────────────────────────────────────────────
  // Mientras heroLocked = true, bloqueamos el scroll real del body con
  // overflow:hidden. Sin scrollbar la barra no se puede arrastrar y el
  // teclado (arrows/PageDown/Space) tampoco mueve nada. Lo que llegue
  // por wheel/touch/keydown lo capturamos y lo dirigimos a heroRaw.
  function applyScrollLock() {
    if (document.body.dataset.heroScrollLocked === String(heroLocked)) return;
    document.body.dataset.heroScrollLocked = String(heroLocked);
    if (heroLocked) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }
  function setLocked(v) {
    heroLocked = v;
    applyScrollLock();
  }

  function update() {
    const W = sticky.offsetWidth  || window.innerWidth;
    const H = sticky.offsetHeight || window.innerHeight;
    const p = easeOut(heroRaw);

    // ─── TAMAÑOS PROPORCIONALES AL VIEWPORT ───────────────────────────
    // Card grande (p=0): ~42% del ancho, capada [320, 720]. Aspect 1.10.
    // Estos valores SON la fuente de verdad — ya no son px hardcoded.
    // -25% en CARD_W_BIG vs versión anterior (0.42→0.315). Card inicial
    // más compacta. CARD_W_SMALL (estado final) intacto.
    const CARD_W_BIG    = clamp(W * 0.315, 240, 540);
    const CARD_W_SMALL  = clamp(W * 0.20, 200, 280);
    const CARD_ASPECT   = 1.10;

    const cW = lerp(CARD_W_BIG, CARD_W_SMALL, p);
    const cH = cW * CARD_ASPECT;

    // Card sube al final (~16% del alto del viewport).
    const BOTTOM_MARGIN = lerp(-H * 0.005, H * 0.16, p);
    const cL = (W - cW) / 2;
    const cT = H - cH - BOTTOM_MARGIN;

    // Border radius proporcional con tope.
    const radiusBig = clamp(W * 0.018, 14, 32);
    const topR      = lerp(radiusBig * 0.6, radiusBig, p);
    const bottomR   = lerp(0, radiusBig, p);
    const radiusStr =
      `${topR.toFixed(1)}px ${topR.toFixed(1)}px ${bottomR.toFixed(1)}px ${bottomR.toFixed(1)}px`;

    // ─── ÚNICA IMAGEN DE FONDO (la "card" es un agujero sobre ella) ──
    // p=0: imagen en su encuadre natural (cover, sin transform).
    // p=1: scale + translate de modo que el centro de la imagen acabe
    //      dentro del rect de la card. Como solo hay una imagen, no
    //      hay disparidad entre lo que se ve fuera y dentro de la card.
    if (heroBgImg) {
      // Zoom moderado (1.0 → 1.20). Antes era 1.45 — demasiado, perdía
      // a la pareja del sujeto durante la transición.
      const bgScale  = lerp(1.0, 1.20, p);
      // Centro de la card en coords de viewport.
      const cardCY   = cT + cH / 2;
      // Translate Y para mover el centro de la imagen (que tras scale
      // desde origen "center" sigue en H/2) hasta cardCY.
      const targetTy = cardCY - H / 2;
      const bgTy     = lerp(0, targetTy, p);
      heroBgImg.style.transformOrigin = 'center center';
      heroBgImg.style.transform = `translate(0, ${bgTy.toFixed(1)}px) scale(${bgScale.toFixed(3)})`;
    }
    // Limpia transform residual del padre por si la versión anterior
    // lo dejó puesto (cache de browser durante deploy).
    if (heroBg) heroBg.style.transform = '';

    // ─── RING: agujero de la card + veil blanco + borde 4px interior ──
    if (heroCardRing) {
      heroCardRing.style.left         = `${cL.toFixed(1)}px`;
      heroCardRing.style.top          = `${cT.toFixed(1)}px`;
      heroCardRing.style.width        = `${cW.toFixed(1)}px`;
      heroCardRing.style.height       = `${cH.toFixed(1)}px`;
      heroCardRing.style.borderRadius = radiusStr;
      const ringP = Math.min(1, p * 2.5);
      const veil  = Math.round(lerp(0, Math.max(W, H) * 1.6, ringP));
      // inset: borde blanco de 4px JUSTO en el límite de la card.
      // outer: veil que crece desde 0 hasta cubrir el viewport.
      heroCardRing.style.boxShadow =
        `inset 0 0 0 4px rgba(255,255,255,0.92), 0 0 0 ${veil}px #fff`;
    }

    // ─── CARD COPY (texto sobre la card al final del scroll) ──────────
    if (heroCardCopy) {
      heroCardCopy.style.left          = `${cL.toFixed(1)}px`;
      heroCardCopy.style.top           = `${cT.toFixed(1)}px`;
      heroCardCopy.style.width         = `${cW.toFixed(1)}px`;
      heroCardCopy.style.height        = `${cH.toFixed(1)}px`;
      heroCardCopy.style.borderRadius  = radiusStr;
      heroCardCopy.style.opacity       = String(Math.max(0, (p - 0.7) / 0.3));
      heroCardCopy.style.pointerEvents = p > 0.85 ? 'auto' : 'none';
    }

    // ─── HERO COPY frontal (fade out al hacer scroll) ─────────────────
    if (frontCopy) {
      const op = Math.max(0, 1 - p * 2.2);
      frontCopy.style.opacity       = String(op);
      frontCopy.style.transform     = `translateY(${(p * -50).toFixed(1)}px)`;
      frontCopy.style.pointerEvents = op < 0.05 ? 'none' : 'auto';
    }

    // ─── TÍTULO FINAL (aparece al final de la animación) ──────────────
    if (heroEndTitle) {
      const titleP = Math.max(0, (p - 0.6) / 0.4);
      heroEndTitle.style.opacity   = String(titleP);
      heroEndTitle.style.transform = `translateY(${lerp(-40, 0, titleP).toFixed(1)}px)`;
    }

    // ─── SIDE CARDS (entran en la segunda mitad de la animación) ──────
    const sideP    = Math.max(0, (p - 0.5) / 0.5);
    const showSides = W >= 760;
    const sideW    = lerp(CARD_W_BIG, CARD_W_SMALL * 0.95, sideP);
    const sideH    = sideW * CARD_ASPECT;
    const sideTop  = cT + (cH - sideH);
    const SIDE_GAP = clamp(W * 0.018, 16, 28);

    function sideStyle(card, leftPx, rotateStart) {
      if (!showSides) { card.style.opacity = '0'; return; }
      card.style.width        = `${sideW.toFixed(1)}px`;
      card.style.height       = `${sideH.toFixed(1)}px`;
      card.style.overflow     = 'hidden';
      card.style.left         = `${leftPx.toFixed(1)}px`;
      card.style.top          = `${sideTop.toFixed(1)}px`;
      card.style.opacity      = String(Math.max(0, Math.min(1, sideP * 2)));
      card.style.transform    = `rotate(${lerp(rotateStart, 0, sideP).toFixed(2)}deg)`;
      card.style.borderRadius = `${radiusBig.toFixed(1)}px`;
    }

    if (leftCard)  sideStyle(leftCard,  cL - sideW - SIDE_GAP, -5);
    if (rightCard) sideStyle(rightCard, cL + cW    + SIDE_GAP,  5);
  }

  // ─── SCROLL HANDLERS ─────────────────────────────────────────────────
  // Mientras heroLocked: capturamos wheel/touch/keydown y los traducimos
  // en cambios de heroRaw, sin permitir scroll real. Al llegar a 1
  // liberamos el lock y el body vuelve a scrollear normalmente.
  if (!prefersReducedMotion) {
    // Estado inicial: bloqueado.
    applyScrollLock();

    window.addEventListener('wheel', (e) => {
      if (!heroLocked) {
        // Reentrar al lock si el usuario hace scroll-up justo en el top.
        if (window.scrollY === 0 && e.deltaY < 0 && heroRaw > 0) {
          heroRaw = Math.max(0, heroRaw + e.deltaY / 2800);
          if (heroRaw < 1) { setLocked(true); e.preventDefault(); update(); }
        }
        return;
      }
      e.preventDefault();
      heroRaw = Math.max(0, Math.min(1, heroRaw + e.deltaY / 2800));
      update();
      if (heroRaw >= 1) setLocked(false);
    }, { passive: false });

    let touchY = 0;
    window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!heroLocked) return;
      e.preventDefault();
      const delta = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      heroRaw = Math.max(0, Math.min(1, heroRaw + delta / 1400));
      update();
      if (heroRaw >= 1) setLocked(false);
    }, { passive: false });

    // Teclado: ↓, PageDown, Espacio, End avanzan; ↑, PageUp, Home retroceden.
    const ADVANCE = new Set(['ArrowDown', 'PageDown', ' ', 'Space', 'End']);
    const RETREAT = new Set(['ArrowUp',   'PageUp',   'Home']);
    window.addEventListener('keydown', (e) => {
      if (!heroLocked) return;
      if (ADVANCE.has(e.key) || ADVANCE.has(e.code)) {
        e.preventDefault();
        const step = (e.key === 'PageDown' || e.code === 'PageDown' || e.key === 'End') ? 0.4 : 0.12;
        heroRaw = Math.min(1, heroRaw + step);
        update();
        if (heroRaw >= 1) setLocked(false);
      } else if (RETREAT.has(e.key) || RETREAT.has(e.code)) {
        e.preventDefault();
        const step = (e.key === 'PageUp' || e.code === 'PageUp' || e.key === 'Home') ? 0.4 : 0.12;
        heroRaw = Math.max(0, heroRaw - step);
        update();
      }
    });

    window.addEventListener('resize', update, { passive: true });
  } else {
    // Reduced motion: liberamos el scroll del todo y mostramos el estado final.
    setLocked(false);
    heroRaw = 1;
  }

  function initialUpdate() {
    update();
    requestAnimationFrame(() => requestAnimationFrame(update));
  }
  if (document.readyState === 'complete') initialUpdate();
  else window.addEventListener('load', initialUpdate);
  window.__heroUpdate = update;
  window.__heroSetRaw = (v) => { heroRaw = v; update(); };
})();
