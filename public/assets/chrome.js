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
            <span class="nav-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="100" cy="74" r="38"/>
                  <circle cx="73" cy="121" r="38"/>
                  <circle cx="127" cy="121" r="38"/>
                </g>
              </svg>
            </span>
            <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
          </a>
          <ul class="nav-links">${links}</ul>
          <div class="nav-cta">
            <a href="/contacto" class="btn btn-outline hide-on-mobile" style="${onDark ? 'border-color: rgba(255,255,255,0.25); color: inherit;' : ''}">Pedir consulta</a>
            <a href="#" class="nav-account hide-on-mobile" id="navAccount" hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
              <span id="navAccountLabel">Mi cuenta</span>
            </a>
            <a href="/carrito" class="nav-cart" aria-label="Carrito">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7H8.5A2 2 0 0 1 6.5 18L5 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
              <span class="badge" data-cart-count style="display:none">0</span>
            </a>
            <button class="nav-burger" id="navBurger" aria-label="Abrir menú" aria-expanded="false">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
    <div class="nav-drawer" id="navDrawer" hidden role="dialog" aria-label="Menú">
      <button class="nav-drawer-close" id="navDrawerClose" aria-label="Cerrar menú">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6l-12 12"/></svg>
      </button>
      <div class="nav-drawer-inner">
        <ul class="nav-drawer-links">${NAV.map(n => `
          <li><a href="${n.href}" class="${active === n.href ? 'active' : ''}">${n.label}</a></li>
        `).join("")}</ul>
        <div class="nav-drawer-cta">
          <a href="/contacto" class="btn btn-light btn-lg">Pedir consulta</a>
          <a href="/asistente" class="btn btn-outline-light btn-lg">Hablar con Nudo</a>
        </div>
      </div>
    </div>`;
  }

  // Consulta /api/auth/me, muestra "Mi cuenta" o "Iniciar sesión" y
  // si está logueado sincroniza el carrito con la DB (merge).
  async function initAccountLink() {
    const el     = document.getElementById('navAccount');
    const label  = document.getElementById('navAccountLabel');
    if (!el || !label) return;
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.user) {
        el.href = '/cuenta';
        label.textContent = data.user.nombre || (data.user.email || '').split('@')[0] || 'Mi cuenta';
        // Sync carrito local ↔ DB. Merge bidireccional (MAX qty).
        syncCartWithDB().catch(() => {});
      } else {
        el.href = '/login';
        label.textContent = 'Iniciar sesión';
      }
      el.hidden = false;
    } catch {
      // Sin red: ocultamos el botón. No es bloqueante.
    }
  }

  // Lleva el cart local a la DB y reemplaza local con el merged set.
  async function syncCartWithDB() {
    let local;
    try { local = JSON.parse(localStorage.getItem('nudo_cart') || '[]'); }
    catch { local = []; }
    // Normaliza al formato que espera el endpoint.
    const items = (Array.isArray(local) ? local : []).map((it) => ({
      slug: it.slug || null,
      name: it.name || 'Producto',
      meta: it.meta || '',
      priceCents: it.priceCents != null
        ? Number(it.priceCents)
        : Math.round(Number(it.price || 0) * 100),
      qty: Math.max(1, Math.floor(Number(it.qty || 1))),
    }));
    const res = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.items)) {
      localStorage.setItem('nudo_cart', JSON.stringify(data.items));
      // Refresca el badge del header.
      const count = data.items.reduce((n, it) => n + (it.qty || 1), 0);
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = String(count);
        el.style.display = count === 0 ? 'none' : '';
      });
    }
  }

  function initMobileNav() {
    const burger = document.getElementById('navBurger');
    const drawer = document.getElementById('navDrawer');
    const close  = document.getElementById('navDrawerClose');
    if (!burger || !drawer) return;

    function open()  {
      drawer.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function shut() {
      drawer.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', open);
    close && close.addEventListener('click', shut);
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', shut));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) shut();
    });
  }

  function renderFooter() {
    return `
    <footer class="site-footer">
      <div class="container-wide">
        <div class="footer-newsletter">
          <div>
            <h3>Reserva fecha para 2026</h3>
            <p>Recibe novedades del estudio, eventos próximos y disponibilidad antes de que se cierre el calendario.</p>
          </div>
          <form class="newsletter-form" id="newsletterForm" novalidate>
            <input type="email" name="email" placeholder="tu@email.com" required aria-label="Tu email">
            <button type="submit">Suscribirme</button>
          </form>
        </div>
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="nav-brand" style="color: var(--ink-on-dark);">
              <span class="nav-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="100" cy="74" r="38"/>
                    <circle cx="73" cy="121" r="38"/>
                    <circle cx="127" cy="121" r="38"/>
                  </g>
                </svg>
              </span>
              <span class="nav-brand-text">Nudo<span style="opacity:0.55"> Studio</span></span>
            </a>
            <p class="footer-tag">
              Decoración y producción de eventos íntimos en Madrid. Regalos hechos a mano para los días que se recuerdan.
            </p>
          </div>
          <div class="footer-col">
            <h3 class="footer-col-title">Estudio</h3>
            <ul>
              <li><a href="/sobre-nosotros">Sobre nosotros</a></li>
              <li><a href="/galeria">Portfolio</a></li>
              <li><a href="/blog">Diario</a></li>
              <li><a href="/testimonios">Testimonios</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3 class="footer-col-title">Servicios</h3>
            <ul>
              <li><a href="/servicios#bodas">Bodas</a></li>
              <li><a href="/servicios#comuniones">Comuniones</a></li>
              <li><a href="/servicios#privados">Fiestas privadas</a></li>
              <li><a href="/servicios#corporativo">Corporativo</a></li>
              <li><a href="/servicios#showers">Baby & bridal</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3 class="footer-col-title">Tienda</h3>
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
          <span>© 2026 Nudo Studio · Madrid</span>
          <div class="legal">
            <a href="/legal/aviso-legal">Aviso legal</a>
            <a href="/legal/privacidad">Privacidad</a>
            <a href="/legal/cookies">Cookies</a>
            <a href="/legal/terminos">Términos</a>
            <button type="button" class="pwa-install-btn" id="pwaInstallBtn" hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"/></svg>
              Instalar app
            </button>
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
        <span class="ai-fab-dot"><nudo-ai-orb id="fab-orb" variant="orbe" state="idle" size="28"></nudo-ai-orb></span>
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

    // ── Orbe IA del FAB: control de estados conversacionales ──
    const fabOrb = document.getElementById("fab-orb");
    let orbResetTimer = null;
    function setFabOrb(state) {
      if (fabOrb) fabOrb.setAttribute("state", state);
    }
    function fabOrbReplyCycle() {
      if (orbResetTimer) clearTimeout(orbResetTimer);
      setFabOrb("reply");
      orbResetTimer = setTimeout(() => {
        setFabOrb("done");
        orbResetTimer = setTimeout(() => {
          setFabOrb("idle");
          orbResetTimer = null;
        }, 1400);
      }, 900);
    }

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

    input.addEventListener("input", () => {
      if (orbResetTimer) return;
      setFabOrb(input.value.trim() ? "listen" : "idle");
    });

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
      setFabOrb("think");

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
          fabOrbReplyCycle();
        } else {
          const msg = (data && data.error)
            || "No he podido responder. Inténtalo en unos minutos o escríbenos a hola@nudostudio.blog.";
          renderBubble(thread, "assistant", msg);
          setFabOrb("idle");
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
        setFabOrb("idle");
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
    // Wire up el menú hamburguesa móvil.
    initMobileNav();

    // Wire up "Mi cuenta" / "Iniciar sesión" en el header.
    initAccountLink();

    // Wire up el form del newsletter del footer.
    const nlForm = document.getElementById("newsletterForm");
    if (nlForm) {
      nlForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = nlForm.querySelector("input[name='email']");
        const btn = nlForm.querySelector("button[type='submit']");
        const email = (input?.value || "").trim();
        if (!email || !/^.+@.+\..+/.test(email)) {
          input?.focus();
          return;
        }
        const originalText = btn ? btn.textContent : "Suscribirme";
        if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }

        try {
          const res = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            nlForm.reset();
            // Feedback inline en vez de alert intrusivo
            if (btn) btn.textContent = data.already ? "Ya suscrito ✓" : "¡Gracias! ✓";
            setTimeout(() => {
              if (btn) { btn.textContent = originalText; btn.disabled = false; }
            }, 2500);
          } else {
            alert(data.error || "No se pudo procesar tu suscripción. Inténtalo en unos minutos.");
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
          }
        } catch (err) {
          alert("Error de conexión. Inténtalo en unos segundos.");
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
        }
      });
    }
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
