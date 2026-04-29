// Nudo Studio — Hero Revolut scroll animation
// Intercepts wheel/touch while the hero is locked, drives heroRaw 0→1,
// then releases the page to scroll normally.

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 2.5); }

  const section = document.getElementById('section-hero');
  if (!section) { console.warn('hero-revolut: no #section-hero'); return; }
  window.__heroRevoluteLoaded = true;

  const sticky       = document.getElementById('heroSticky');
  const heroBg       = document.getElementById('heroBg');
  const heroMask     = document.getElementById('heroMask');
  const heroCardCopy = document.getElementById('heroCardCopy');
  const leftCard     = document.getElementById('leftCard');
  const rightCard    = document.getElementById('rightCard');
  const frontCopy    = document.getElementById('frontCopy');
  const heroEndTitle = document.getElementById('heroEndTitle');
  const heroCardRing = document.getElementById('heroCardRing');
  const maskImg      = heroMask ? heroMask.querySelector('img') : null;

  const CARD_W      = 290;
  const IMG_H       = 380;
  const CARD_W_BIG  = 590;
  const IMG_H_BIG   = 650;
  const SIDE_W      = 290;
  const SIDE_H      = 380;
  const GAP         = 24;
  const RADIUS      = 32;

  let heroRaw    = 0;
  let heroLocked = true;

  function update() {
    const W = sticky.offsetWidth  || window.innerWidth;
    const H = sticky.offsetHeight || window.innerHeight;
    const p = easeOut(heroRaw);

    if (heroBg) {
      const bgScale = lerp(1.085, 0.98, Math.min(1, p * 2));
      heroBg.style.transform = `scale(${bgScale.toFixed(3)}) translateY(${lerp(0, 80, Math.min(1, p * 3.5)).toFixed(1)}px)`;
    }

    const CARD_W_SMALL     = Math.round(CARD_W * 0.82);
    const IMG_H_CENTER_END = IMG_H;
    const cW = Math.round(lerp(CARD_W_BIG, CARD_W_SMALL, p));
    const cH = Math.round(lerp(IMG_H_BIG,  IMG_H_CENTER_END, p));

    const sideP = Math.max(0, (p - 0.5) / 0.5);

    const cL = Math.round((W - cW) / 2);
    // Anchor the card flush to the BOTTOM of the viewport so its lower edge
    // coincides with the background photo edge.
    const BOTTOM_MARGIN = lerp(-8, 140, p);
    const cT = H - cH - BOTTOM_MARGIN;

    const topR    = lerp(20, 32, p);
    const bottomR = lerp(0,  32, p);
    const radiusStr = `${topR}px ${topR}px ${bottomR}px ${bottomR}px`;

    if (heroMask) {
      heroMask.style.left         = `${cL}px`;
      heroMask.style.top          = `${cT}px`;
      heroMask.style.width        = `${cW}px`;
      heroMask.style.height       = `${cH}px`;
      heroMask.style.borderRadius = radiusStr;
      heroMask.style.border       = 'none';
      const dropShadow = p > 0.05
        ? `0 ${lerp(0, 40, p)}px ${lerp(0, 90, p)}px rgba(20,12,6,${lerp(0, 0.18, p)})`
        : '';
      heroMask.style.boxShadow = dropShadow
        ? `0 0 0 4px rgba(255,255,255,0.9), ${dropShadow}`
        : '0 0 0 4px rgba(255,255,255,0.9)';
    }

    if (maskImg) {
      // Tuned for a horizontal 3:2 beach ceremony photo with subject in middle.
      // Stronger initial zoom (2.2x) closes in on the couple at the arch,
      // then opens out to 1x revealing guests and the full scene.
      // yOff pushes the photo UP inside the card so the altar/couple is fully visible.
      const zoom = lerp(1.75, 1.90, p);
      const yOff = lerp(-46.25, -40, p);
      maskImg.style.transform = `scale(${zoom.toFixed(3)}) translateY(${yOff.toFixed(1)}%)`;
    }

    if (heroCardRing) {
      heroCardRing.style.left         = `${cL}px`;
      heroCardRing.style.top          = `${cT}px`;
      heroCardRing.style.width        = `${cW}px`;
      heroCardRing.style.height       = `${cH}px`;
      heroCardRing.style.borderRadius = radiusStr;
      const ringP = Math.min(1, p * 2.5);
      // Ring expands in white to match the new hero sticky background
      heroCardRing.style.boxShadow    = `0 0 0 ${Math.round(lerp(0, 2400, ringP))}px #fff`;
    }

    if (heroCardCopy) {
      heroCardCopy.style.left          = `${cL}px`;
      heroCardCopy.style.top           = `${cT}px`;
      heroCardCopy.style.width         = `${cW}px`;
      heroCardCopy.style.height        = `${cH}px`;
      heroCardCopy.style.borderRadius  = radiusStr;
      heroCardCopy.style.opacity       = String(Math.max(0, (p - 0.7) / 0.3));
      heroCardCopy.style.pointerEvents = p > 0.85 ? 'auto' : 'none';
    }

    if (frontCopy) {
      const op = Math.max(0, 1 - p * 2.2);
      frontCopy.style.opacity       = String(op);
      frontCopy.style.transform     = `translateY(${p * -50}px)`;
      frontCopy.style.pointerEvents = op < 0.05 ? 'none' : 'auto';
    }

    if (heroEndTitle) {
      const titleP = Math.max(0, (p - 0.6) / 0.4);
      heroEndTitle.style.opacity   = String(titleP);
      heroEndTitle.style.transform = `translateY(${lerp(-40, 0, titleP)}px)`;
    }

    const showSides = W >= 760;
    const sideW   = Math.round(lerp(CARD_W_BIG, SIDE_W * 0.82, sideP));
    const sideH   = Math.round(lerp(IMG_H_BIG,  SIDE_H * 0.82, sideP));
    // Keep side cards bottom-aligned with the center card
    const sideTop = cT + (cH - sideH);

    const sideStyle = (card, left, rotateStart) => {
      if (!showSides) { card.style.opacity = '0'; return; }
      card.style.width        = `${sideW}px`;
      card.style.height       = `${sideH}px`;
      card.style.overflow     = 'hidden';
      card.style.left         = `${left}px`;
      card.style.top          = `${sideTop}px`;
      card.style.opacity      = String(Math.max(0, Math.min(1, sideP * 2)));
      card.style.transform    = `rotate(${lerp(rotateStart, 0, sideP)}deg)`;
      card.style.borderRadius = `${RADIUS}px`;
    };

    if (leftCard)  sideStyle(leftCard,  cL - sideW - GAP, -5);
    if (rightCard) sideStyle(rightCard, cL + cW    + GAP,   5);
  }

  if (!prefersReducedMotion) {
    // Wheel: drive animation without scrolling the page until heroRaw === 1
    window.addEventListener('wheel', (e) => {
      if (!heroLocked) {
        // Allow re-locking when user scrolls back to the top
        if (window.scrollY === 0 && e.deltaY < 0 && heroRaw > 0) {
          heroRaw = Math.max(0, heroRaw + e.deltaY / 2800);
          if (heroRaw < 1) { heroLocked = true; e.preventDefault(); update(); }
        }
        return;
      }
      // Only intercept when section is at top of viewport
      const r = section.getBoundingClientRect();
      if (r.top > 0) return;
      e.preventDefault();
      heroRaw = Math.max(0, Math.min(1, heroRaw + e.deltaY / 2800));
      update();
      if (heroRaw >= 1) heroLocked = false;
    }, { passive: false });

    let touchY = 0;
    window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!heroLocked) return;
      const r = section.getBoundingClientRect();
      if (r.top > 0) return;
      e.preventDefault();
      const delta = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      heroRaw = Math.max(0, Math.min(1, heroRaw + delta / 1400));
      update();
      if (heroRaw >= 1) heroLocked = false;
    }, { passive: false });

    window.addEventListener('resize', update, { passive: true });
  }

  // Initial paint: wait until the layout has measured (img onload + 2 rAFs)
  function initialUpdate() {
    update();
    // Run again after layout settles to catch late image loads
    requestAnimationFrame(() => requestAnimationFrame(update));
  }
  if (document.readyState === 'complete') initialUpdate();
  else window.addEventListener('load', initialUpdate);
  window.__heroUpdate = update;
  window.__heroSetRaw = (v) => { heroRaw = v; update(); };
})();
