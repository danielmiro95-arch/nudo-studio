// Nudo Studio — botón "Instalar app" (PWA)
//
// Maneja dos paths:
//  • Chrome/Edge/Android: captura el evento `beforeinstallprompt` y lo
//    dispara con prompt() cuando el usuario clica el botón.
//  • iOS Safari: no soporta ese evento; mostramos un modal con las
//    instrucciones para "Compartir → Añadir a pantalla de inicio".
//
// El botón está en el footer (renderizado por chrome.js, oculto por
// defecto). Este script lo muestra solo si la app es instalable y NO
// está ya corriendo en modo standalone.

(function () {
  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
  // Detección iOS robusta · incluye iPadOS que desde 2019 reporta como
  // "Macintosh" en userAgent (rompe el regex tradicional). Usamos también
  // el touch support como pista de iPad.
  function isIOS() {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return true;
    // iPadOS 13+ reporta como Mac. Heurística: Mac con soporte táctil.
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
    return false;
  }
  function isSafari() {
    return /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|Chrome|Chromium/.test(navigator.userAgent);
  }
  function isMacDesktopSafari() {
    return /Macintosh/.test(navigator.userAgent) && isSafari() && !navigator.maxTouchPoints;
  }
  function getBtn() { return document.getElementById('pwaInstallBtn'); }

  function showButton() {
    const btn = getBtn();
    if (btn) btn.hidden = false;
  }
  function hideButton() {
    const btn = getBtn();
    if (btn) btn.hidden = true;
  }

  // Chrome/Edge/Android: el navegador determina elegibilidad y dispara
  // este evento. Lo capturamos para usarlo en el click del botón.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone()) showButton();
  });

  // Si la app se instaló (mientras la página está abierta), ocultar.
  window.addEventListener('appinstalled', () => {
    hideButton();
    deferredPrompt = null;
  });

  function showInstructionsModal(variant) {
    if (document.getElementById('pwaIosModal')) return;
    const steps = (() => {
      if (variant === 'ios') {
        return `
          <li>Pulsa el icono <strong>Compartir</strong>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="vertical-align: middle; margin: 0 2px;"><path d="M12 16V4M12 4l-4 4M12 4l4 4M5 12v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>
            en la barra de Safari.</li>
          <li>Desliza y elige <strong>"Añadir a pantalla de inicio"</strong>.</li>
          <li>Pulsa <strong>Añadir</strong> arriba a la derecha.</li>`;
      }
      if (variant === 'mac-safari') {
        return `
          <li>En la barra de menú de Safari → <strong>Archivo</strong>.</li>
          <li>Elige <strong>"Añadir al Dock…"</strong>.</li>
          <li>Confirma. Nudo aparecerá como app en tu Dock.</li>`;
      }
      // genérico
      return `
        <li>Abre el <strong>menú del navegador</strong> (los 3 puntos arriba derecha).</li>
        <li>Elige <strong>"Instalar app"</strong> o <strong>"Añadir a pantalla de inicio"</strong>.</li>
        <li>Confirma. El icono de Nudo aparecerá en tu dispositivo.</li>`;
    })();

    const m = document.createElement('div');
    m.id = 'pwaIosModal';
    m.className = 'pwa-ios-modal';
    m.innerHTML = `
      <div class="pwa-ios-content" role="dialog" aria-label="Instrucciones para instalar la app">
        <button class="pwa-ios-close" aria-label="Cerrar">×</button>
        <span class="eyebrow">Instalar app</span>
        <h3>Nudo en tu dispositivo.</h3>
        <ol>${steps}</ol>
        <p class="pwa-ios-foot">Una vez añadida, abre Nudo como una app más.</p>
      </div>
    `;
    document.body.appendChild(m);
    m.querySelector('.pwa-ios-close').addEventListener('click', () => m.remove());
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { m.remove(); document.removeEventListener('keydown', onEsc); }
    });
  }

  function init() {
    if (isStandalone()) return;
    const btn = getBtn();
    if (!btn) return;

    // SIEMPRE muestra el botón si NO estás en modo standalone.
    // Decidimos qué hacer al click según la plataforma:
    //  - deferredPrompt disponible → prompt nativo (Chrome/Edge/Android)
    //  - iOS / iPadOS → modal con instrucciones Safari iOS
    //  - macOS Safari → modal con "Archivo → Añadir al Dock"
    //  - resto → modal genérico
    showButton();

    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try {
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') hideButton();
        } catch {}
        deferredPrompt = null;
      } else if (isIOS()) {
        showInstructionsModal('ios');
      } else if (isMacDesktopSafari()) {
        showInstructionsModal('mac-safari');
      } else {
        showInstructionsModal('generic');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
