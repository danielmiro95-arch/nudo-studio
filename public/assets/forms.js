/* ============================================
 * Nudo Studio — forms.js
 * Conecta el formulario de /contacto y el chat de /asistente
 * con los endpoints serverless /api/contact y /api/asistente.
 *
 * Se carga sólo en las páginas que lo necesitan (ver page.tsx).
 * No depende de React: el markup viene del HTML legacy.
 * ============================================ */

(function () {
  'use strict';

  // ─── Helpers ──────────────────────────────────────────────────────

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Toast simple, sin dependencias.
  function toast(message, kind) {
    kind = kind || 'info';
    var el = document.createElement('div');
    el.className = 'nudo-toast nudo-toast--' + kind;
    el.textContent = message;
    el.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:32px', 'transform:translateX(-50%)',
      'z-index:9999', 'padding:14px 22px',
      'background:' + (kind === 'error' ? '#3c1212' : kind === 'success' ? '#0A0A0A' : '#0A0A0A'),
      'color:#FAF6F2', 'border-radius:999px',
      'font-family:Inter,system-ui,sans-serif', 'font-size:14px',
      'box-shadow:0 12px 32px rgba(0,0,0,.18)',
      'opacity:0', 'transition:opacity .25s ease, transform .35s cubic-bezier(.22,1,.36,1)',
      'pointer-events:none', 'max-width:90vw',
    ].join(';');
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(-6px)';
    });
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 280);
    }, kind === 'error' ? 5000 : 3500);
  }

  // ─── 1. Formulario de contacto ──────────────────────────────────

  function wireContactForm() {
    var form = document.querySelector('form.contact-form');
    if (!form || form.dataset.nudoBound === '1') return;
    form.dataset.nudoBound = '1';

    // Limpia el `onsubmit` inline del HTML legacy
    form.removeAttribute('onsubmit');

    // Inyecta name= en los inputs si no los tienen (el HTML legacy no los pone)
    var fields = form.querySelectorAll('.field');
    var fieldsByOrder = ['nombre', 'email', 'fecha', 'invitados', 'mensaje'];
    fields.forEach(function (f, i) {
      var el = f.querySelector('input, textarea');
      if (el && !el.name) el.name = fieldsByOrder[i] || ('field_' + i);
    });

    // Honeypot (campo invisible, los bots lo rellenan)
    if (!form.querySelector('input[name="website"]')) {
      var hp = document.createElement('input');
      hp.type = 'text';
      hp.name = 'website';
      hp.tabIndex = -1;
      hp.autocomplete = 'off';
      hp.setAttribute('aria-hidden', 'true');
      hp.style.cssText = 'position:absolute;left:-9999px;opacity:0;pointer-events:none;height:0;width:0;';
      form.appendChild(hp);
    }

    // Lee el chip "tipo de evento" activo
    function getServicio() {
      var active = form.querySelector('.chip-toggle.active');
      return active ? active.textContent.trim() : '';
    }

    // Permite que sólo un chip esté activo (ya casi funciona pero por si acaso)
    form.querySelectorAll('.chip-toggle').forEach(function (chip) {
      chip.addEventListener('click', function () {
        form.querySelectorAll('.chip-toggle').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
      });
    });

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnText = submitBtn ? submitBtn.textContent : 'Enviar mensaje';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (submitBtn && submitBtn.disabled) return;

      var fd = new FormData(form);
      var payload = {
        nombre:   String(fd.get('nombre') || '').trim(),
        email:    String(fd.get('email') || '').trim(),
        fecha:    String(fd.get('fecha') || '').trim(),
        servicio: getServicio(),
        mensaje:  String(fd.get('mensaje') || '').trim(),
        telefono: '',
        website:  String(fd.get('website') || ''),
      };

      // El campo "invitados" enriquece el mensaje
      var invitados = String(fd.get('invitados') || '').trim();
      if (invitados) payload.mensaje = '[' + invitados + ' invitados]\n' + payload.mensaje;

      // Validación cliente mínima (la real está en servidor)
      if (payload.nombre.length < 2) { toast('Indica tu nombre.', 'error'); return; }
      if (!/^.+@.+\..+/.test(payload.email)) { toast('Email no válido.', 'error'); return; }
      if (payload.mensaje.length < 10) { toast('Cuéntanos un poco más en el mensaje.', 'error'); return; }

      // UI: estado enviando
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
        submitBtn.style.opacity = '0.7';
      }

      try {
        var res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        var data = null;
        try { data = await res.json(); } catch (_) { /* */ }

        if (res.ok && data && data.ok) {
          toast('Mensaje enviado. Te respondemos en menos de 24 h.', 'success');
          form.reset();
          // Re-marca el primer chip por defecto
          var firstChip = form.querySelector('.chip-toggle');
          form.querySelectorAll('.chip-toggle').forEach(function (c) { c.classList.remove('active'); });
          if (firstChip) firstChip.classList.add('active');
        } else {
          var msg = (data && data.error) || 'No hemos podido enviar el mensaje. Inténtalo en unos minutos.';
          toast(msg, 'error');
        }
      } catch (err) {
        console.error('contact submit failed', err);
        toast('Error de conexión. Inténtalo de nuevo.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          submitBtn.style.opacity = '1';
        }
      }
    });
  }

  // ─── 2. Chat del asistente IA ──────────────────────────────────

  function wireAssistantChat() {
    var input = document.getElementById('msg-input');
    var thread = document.getElementById('thread');
    if (!input || !thread || input.dataset.nudoBound === '1') return;
    input.dataset.nudoBound = '1';

    // Botón enviar y "Nueva conversación"
    var sendBtn = document.querySelector('.ai-send');
    var newBtn = Array.from(document.querySelectorAll('button.chip')).find(function (b) {
      return /nueva\s+conversaci/i.test(b.textContent || '');
    });

    // Estado: historial de mensajes que se envía a la API.
    // Empezamos vacío — el system prompt vive en el servidor.
    var history = [];

    // Renderiza una burbuja en el thread.
    function appendBubble(role, content, opts) {
      opts = opts || {};
      var div = document.createElement('div');
      div.className = role === 'user' ? 'bubble user' : 'bubble';
      if (opts.thinking) div.classList.add('thinking');
      // Mantenemos saltos de línea como párrafos
      var html = escapeHtml(content)
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br>');
      div.innerHTML = '<p>' + html + '</p>';
      thread.appendChild(div);
      // Scroll al final con suavidad
      thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
      return div;
    }

    function clearQuickReplies() {
      // Quita las quick-replies del HTML legacy (son del demo) la primera vez
      // que el usuario escribe — ya no tienen sentido en un chat real.
      thread.querySelectorAll('.quick-reply-row').forEach(function (row) { row.remove(); });
    }

    async function send(text) {
      text = (text || '').trim();
      if (!text || sendBtn && sendBtn.disabled) return;

      clearQuickReplies();

      // Pinta burbuja del usuario
      appendBubble('user', text);
      history.push({ role: 'user', content: text });
      input.value = '';

      // Burbuja "pensando"
      var thinking = appendBubble('assistant', '·  ·  ·', { thinking: true });
      if (sendBtn) sendBtn.disabled = true;
      input.disabled = true;

      try {
        var res = await fetch('/api/asistente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        var data = null;
        try { data = await res.json(); } catch (_) { /* */ }

        thinking.remove();

        if (res.ok && data && data.content) {
          appendBubble('assistant', data.content);
          history.push({ role: 'assistant', content: data.content });
        } else {
          var msg = (data && data.error) ||
            'No he podido responder. Inténtalo en unos minutos o escríbenos a hola@nudostudio.com.';
          appendBubble('assistant', msg);
          // No metemos errores en history para no contaminar el contexto
          if (res.status === 429) {
            input.disabled = true;
            if (sendBtn) sendBtn.disabled = true;
            return; // mantén bloqueado el resto del día
          }
        }
      } catch (err) {
        thinking.remove();
        console.error('assistant error', err);
        appendBubble('assistant', 'Parece que hay un problema de conexión. Inténtalo en unos segundos.');
      } finally {
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      }
    }

    // Eventos
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(input.value);
      }
    });
    if (sendBtn) sendBtn.addEventListener('click', function () { send(input.value); });

    // Presets del sidebar → meten texto y envían
    document.querySelectorAll('.preset').forEach(function (p) {
      p.addEventListener('click', function () {
        // El texto del preset es el contenido del botón menos el span.lbl
        var clone = p.cloneNode(true);
        var lbl = clone.querySelector('.lbl');
        if (lbl) lbl.remove();
        send(clone.textContent.trim());
      });
    });

    // Quick-replies de la conversación demo → también envían
    thread.addEventListener('click', function (e) {
      var qr = e.target.closest('.quick-reply');
      if (qr && thread.contains(qr)) {
        send(qr.textContent.replace(/[→\s]+$/, '').trim());
      }
    });

    // Nueva conversación
    if (newBtn) {
      newBtn.addEventListener('click', function () {
        history = [];
        // Vacía el thread y deja un saludo inicial
        thread.innerHTML = '';
        appendBubble('assistant',
          'Hola, soy Nudo. Cuéntame qué celebráis y empezamos a perfilar la idea — fecha, lugar aproximado, número de invitados o solo el ambiente que imagináis.');
      });
    }
  }

  // ─── Init ───────────────────────────────────────────────────────

  function init() {
    wireContactForm();
    wireAssistantChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
