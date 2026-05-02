// Nudo Studio — chrome compartido (header + footer + FAB IA + cart badge)
// Inyectado en cada página vía data-attrs en <body>.

(function () {
  const NAV = [
    { href: "/",                 label: "Inicio" },
    { href: "/servicios",        label: "Servicios" },
    { href: "/galeria",          label: "Galería" },
    { href: "/tienda",           label: "Tienda" },
    { href: "/asistente",        label: "Asistente IA" },
    { href: "/sobre-nosotros",   label: "Estudio" },
    { href: "/contacto",         label: "Contacto" },
  ];

  // Pathname actual sin trailing slash (excepto en home). Lo usamos para
  // marcar el link activo del NAV — body.dataset.page sigue en formato
  // legacy ("X.html") y ya no encaja con las clean routes.
  function currentPath() {
    var p = (window.location.pathname || "/").replace(/\/+$/, "");
    return p || "/";
  }

  function renderHeader() {
    const onDark = document.body.dataset.headerOnDark === "true";
    const active = currentPath();

    const links = NAV.map(n => `
      <li><a href="${n.href}" class="${active === n.href ? 'active' : ''}">${n.label}</a></li>
    `).join("");

    return `
    <header class="site-header ${onDark ? 'on-dark' : ''}">
      <div class="container-wide">
        <nav class="nav">
          <a href="/" class="nav-brand">
            <span class="nav-brand-mark" aria-hidden="true">N</span>
            <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
          </a>
          <ul class="nav-links">${links}</ul>
          <div class="nav-cta">
            <a href="/contacto" class="btn btn-outline hide-on-mobile" style="${onDark ? 'border-color: rgba(255,255,255,0.25); color: inherit;' : ''}">Pedir presupuesto</a>
            <a href="/carrito" class="nav-cart" aria-label="Carrito">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7H8.5A2 2 0 0 1 6.5 18L5 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
              <span class="badge" data-cart-count>2</span>
            </a>
          </div>
        </nav>
      </div>
    </header>`;
  }

  function renderFooter() {
    return `
    <footer class="site-footer">
      <div class="container-wide">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="nav-brand" style="color: var(--ink-on-dark);">
              <span class="nav-brand-mark" aria-hidden="true" style="filter: invert(1);">N</span>
              <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
            </a>
            <p class="footer-tag">
              Decoración y producción de eventos íntimos en Madrid y La Habana. Regalos hechos a mano para los días que se recuerdan.
            </p>
          </div>
          <div class="footer-col">
            <h4>Estudio</h4>
            <ul>
              <li><a href="/sobre-nosotros">Sobre nosotros</a></li>
              <li><a href="/galeria">Portfolio</a></li>
              <li><a href="/blog">Diario</a></li>
              <li><a href="/testimonios">Testimonios</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Servicios</h4>
            <ul>
              <li><a href="/servicios#bodas">Bodas</a></li>
              <li><a href="/servicios#comuniones">Comuniones</a></li>
              <li><a href="/servicios#privados">Fiestas privadas</a></li>
              <li><a href="/servicios#corporativo">Corporativo</a></li>
              <li><a href="/servicios#showers">Baby & bridal</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Tienda</h4>
            <ul>
              <li><a href="/tienda">Catálogo</a></li>
              <li><a href="/tienda?cat=decoracion">Decoración</a></li>
              <li><a href="/tienda?cat=regalos">Regalos a mano</a></li>
              <li><a href="/carrito">Mi carrito</a></li>
              <li><a href="/faq">Envíos & devoluciones</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Nudo Studio · Madrid — La Habana</span>
          <div class="legal">
            <a href="/legal/aviso-legal">Aviso legal</a>
            <a href="/legal/privacidad">Privacidad</a>
            <a href="/legal/cookies">Cookies</a>
            <a href="/legal/terminos">Términos</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  function renderFab() {
    if (document.body.dataset.hideFab === "true") return "";
    // FAB sigue siendo <a href="/asistente"> para accesibilidad y para
    // que Cmd+Click abra la página completa. El click normal lo
    // intercepta initChatWidget() y abre el panel flotante.
    return `
      <a href="/asistente" class="ai-fab" id="aiFab" aria-label="Abrir chat con asistente IA">
        <span class="ai-fab-dot"></span>
        <span>Hola, soy Nudo · ¿hablamos?</span>
      </a>
      <div class="ai-chat-panel" id="aiChatPanel" hidden role="dialog" aria-label="Chat con asistente Nudo">
        <header class="ai-chat-header">
          <div class="ai-chat-title">
            <span class="ai-chat-pulse" aria-hidden="true"></span>
            <span>Nudo · Asistente</span>
          </div>
          <div class="ai-chat-actions">
            <button type="button" class="ai-chat-reset" id="aiChatReset" aria-label="Nueva conversación" title="Nueva conversación">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
            </button>
            <button type="button" class="ai-chat-close" id="aiChatClose" aria-label="Cerrar chat">×</button>
          </div>
        </header>
        <div class="ai-chat-thread" id="aiChatThread"></div>
        <form class="ai-chat-form" id="aiChatForm">
          <input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Cuéntame qué celebráis…" autocomplete="off" maxlength="1000">
          <button type="submit" class="ai-chat-send" id="aiChatSend" aria-label="Enviar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </button>
        </form>
      </div>
    `;
  }

  // ─── CHAT WIDGET ─────────────────────────────────────────────────────
  // Persistencia en localStorage("nudo_chat_history") como
  // [{role: "user"|"assistant", content: string}]. Reusa /api/asistente
  // (mismo formato que la página completa /asistente).
  const CHAT_KEY = "nudo_chat_history";
  const GREETING =
    "Hola, soy Nudo. Cuéntame qué celebráis y empezamos a perfilar la idea " +
    "— fecha, lugar aproximado, número de invitados o solo el ambiente que imagináis.";

  function readHistory() {
    try {
      const raw = localStorage.getItem(CHAT_KEY);
      const arr = raw ? JSON.parse(raw) : null;
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function writeHistory(items) {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(items)); } catch {}
  }
  function escapeChatHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function renderBubble(thread, role, content, opts) {
    opts = opts || {};
    const div = document.createElement("div");
    div.className = "ai-chat-bubble " + (role === "user" ? "user" : "assistant");
    if (opts.thinking) div.classList.add("thinking");
    const html = escapeChatHtml(content)
      .replace(/\n\n+/g, "</p><p>")
      .replace(/\n/g, "<br>");
    div.innerHTML = "<p>" + html + "</p>";
    thread.appendChild(div);
    thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
    return div;
  }
  function renderHistory(thread) {
    thread.innerHTML = "";
    const history = readHistory();
    if (!history.length) {
      renderBubble(thread, "assistant", GREETING);
    } else {
      history.forEach((m) => renderBubble(thread, m.role, m.content));
    }
  }

  function initChatWidget() {
    const fab    = document.getElementById("aiFab");
    const panel  = document.getElementById("aiChatPanel");
    const close  = document.getElementById("aiChatClose");
    const reset  = document.getElementById("aiChatReset");
    const thread = document.getElementById("aiChatThread");
    const form   = document.getElementById("aiChatForm");
    const input  = document.getElementById("aiChatInput");
    const send   = document.getElementById("aiChatSend");
    if (!fab || !panel) return;

    function openPanel() {
      panel.hidden = false;
      renderHistory(thread);
      setTimeout(() => input && input.focus(), 50);
    }
    function closePanel() { panel.hidden = true; }
    function togglePanel() { panel.hidden ? openPanel() : closePanel(); }

    // Click normal en FAB: abre panel. Modificadores (Cmd/Ctrl/Shift,
    // botón medio): deja al browser navegar a /asistente.
    fab.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      togglePanel();
    });
    close && close.addEventListener("click", closePanel);
    reset && reset.addEventListener("click", () => {
      writeHistory([]);
      renderHistory(thread);
      input && input.focus();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) closePanel();
    });

    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = (input.value || "").trim();
      if (!text || send.disabled) return;
      input.value = "";

      const history = readHistory();
      history.push({ role: "user", content: text });
      writeHistory(history);
      renderBubble(thread, "user", text);

      const thinking = renderBubble(thread, "assistant", "·  ·  ·", { thinking: true });
      send.disabled = true;
      input.disabled = true;

      try {
        const res = await fetch("/api/asistente", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        let data = null;
        try { data = await res.json(); } catch {}

        thinking.remove();

        if (res.ok && data && data.content) {
          renderBubble(thread, "assistant", data.content);
          history.push({ role: "assistant", content: data.content });
          writeHistory(history);
        } else {
          const msg = (data && data.error)
            || "No he podido responder. Inténtalo en unos minutos o escríbenos a hola@nudostudio.blog.";
          renderBubble(thread, "assistant", msg);
          if (res.status === 429) {
            input.disabled = true;
            send.disabled = true;
            return;
          }
        }
      } catch (err) {
        thinking.remove();
        renderBubble(thread, "assistant",
          "Parece que hay un problema de conexión. Inténtalo en unos segundos.");
      } finally {
        input.disabled = false;
        send.disabled = false;
        input.focus();
      }
    });
  }

  function init() {
    const headerSlot = document.querySelector("[data-slot='header']");
    if (headerSlot) headerSlot.outerHTML = renderHeader();
    const footerSlot = document.querySelector("[data-slot='footer']");
    if (footerSlot) footerSlot.outerHTML = renderFooter();
    const fabSlot = document.querySelector("[data-slot='fab']");
    if (fabSlot) fabSlot.outerHTML = renderFab();

    // Sync cart count from localStorage if available
    try {
      const c = JSON.parse(localStorage.getItem("nudo_cart") || "[]");
      const count = c.reduce((n, it) => n + (it.qty || 1), 0);
      document.querySelectorAll("[data-cart-count]").forEach(el => {
        el.textContent = count;
        if (count === 0) el.style.display = "none";
      });
    } catch (e) {}

    // Wire up el chat flotante (solo si la página tiene FAB).
    initChatWidget();
  }

  // chrome.js se carga vía Next.js <Script strategy="afterInteractive">,
  // que dispara DESPUÉS de DOMContentLoaded. Si esperamos al evento, nunca
  // llega y los slots quedan sin reemplazar. Comprobamos readyState.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
