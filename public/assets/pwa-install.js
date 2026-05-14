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
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  function isSafariOnIOS() {
    return isIOS() && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
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

  function showIOSModal() {
    if (document.getElementById('pwaIosModal')) return;
    const m = document.createElement('div');
    m.id = 'pwaIosModal';
    m.className = 'pwa-ios-modal';
    m.innerHTML = `
      <div class="pwa-ios-content" role="dialog" aria-label="Instrucciones para instalar la app">
        <button class="pwa-ios-close" aria-label="Cerrar">×</button>
        <span class="eyebrow">Instalar app</span>
        <h3>Nudo en tu pantalla de inicio.</h3>
        <ol>
          <li>Pulsa el icono <strong>Compartir</strong>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="vertical-align: middle; margin: 0 2px;"><path d="M12 16V4M12 4l-4 4M12 4l4 4M5 12v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>
            en la barra de Safari.
          </li>
          <li>Desliza y elige <strong>"Añadir a pantalla de inicio"</strong>.</li>
          <li>Pulsa <strong>Añadir</strong> arriba a la derecha.</li>
        </ol>
        <p class="pwa-ios-foot">Una vez añadida, abre Nudo desde tu home como una app más.</p>
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

    // iOS no dispara `beforeinstallprompt` pero sí es instalable.
    // Mostramos el botón y al click abrimos instrucciones.
    if (isSafariOnIOS()) showButton();

    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try {
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') hideButton();
        } catch {}
        deferredPrompt = null;
      } else if (isSafariOnIOS()) {
        showIOSModal();
      } else {
        // Fallback genérico (otros navegadores móviles)
        showIOSModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
