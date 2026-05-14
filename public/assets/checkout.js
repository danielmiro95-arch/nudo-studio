// Nudo Studio — Checkout 3 pasos (cosmético)
//
// Flow:
//   01 Cesta  → 02 Datos  → 03 Pago
//
// Cesta: lee localStorage("nudo_cart") como [{name, meta, price, qty}].
// Si no hay nada: muestra estado vacío + CTA a /tienda.
// Cualquier acción de pago al final: alerta "implementación pendiente"
// — la integración real con Stripe Payment Element queda para cuando
//   estén las API keys + métodos activados en Stripe Dashboard.

(function () {
  const STEPS = ['cart', 'data', 'pay'];
  const tabs  = Array.from(document.querySelectorAll('.step-tabs .step-tab'));
  const sections = Array.from(document.querySelectorAll('.checkout-step'));
  if (!tabs.length || !sections.length) return;

  let currentStep = 'cart';

  // ─── NAVEGACIÓN ──────────────────────────────────────────────────────
  function setStep(name) {
    if (!STEPS.includes(name)) return;
    currentStep = name;
    const idx = STEPS.indexOf(name);
    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === idx);
      t.classList.toggle('is-complete', i < idx);
    });
    sections.forEach((s) => {
      const isActive = s.dataset.step === name;
      s.hidden = !isActive;
      s.classList.toggle('is-active', isActive);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Click en pestaña: solo permite ir a un paso anterior o ya completado.
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.step;
      const targetIdx = STEPS.indexOf(target);
      const currentIdx = STEPS.indexOf(currentStep);
      if (targetIdx <= currentIdx) setStep(target);
    });
  });

  // Botones [data-action="next"] / [data-action="back"] dentro de cada paso.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = STEPS.indexOf(currentStep);
    if (action === 'next' && idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    if (action === 'back' && idx > 0)                setStep(STEPS[idx - 1]);
  });

  // Form submit (paso 2): validación nativa + avanza al paso 3.
  const dataForm = document.getElementById('data-form');
  if (dataForm) {
    dataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Validación HTML5 mínima
      if (!dataForm.checkValidity()) {
        dataForm.reportValidity();
        return;
      }
      // En cosmético no persistimos los datos. Cuando integremos Stripe
      // los pasaríamos al PaymentIntent en metadata.
      setStep('pay');
    });
  }

  // ─── PASO 1: CESTA ──────────────────────────────────────────────────
  function readCart() {
    try {
      const raw = localStorage.getItem('nudo_cart');
      const arr = raw ? JSON.parse(raw) : null;
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  function writeCart(items) {
    try { localStorage.setItem('nudo_cart', JSON.stringify(items)); }
    catch {}
  }
  function fmt(cents) {
    const eur = Math.floor(cents / 100);
    const dec = String(cents % 100).padStart(2, '0');
    return `${eur},${dec} €`;
  }

  const SHIPPING_CENTS = 600;

  function renderCart() {
    const cart      = readCart();
    const list      = document.getElementById('cart-list');
    const empty     = document.getElementById('cart-empty');
    const totals    = document.getElementById('cart-totals-block');
    const subEl     = document.getElementById('sub-amount');
    const totalEl   = document.getElementById('total-amount');
    const payAmount = document.getElementById('pay-amount');

    if (!list || !empty || !totals) return;

    if (!cart.length) {
      list.innerHTML = '';
      empty.hidden  = false;
      totals.hidden = true;
      if (payAmount) payAmount.textContent = '0 €';
      // Si está vacía no permitimos avanzar.
      return;
    }

    empty.hidden  = true;
    totals.hidden = false;

    list.innerHTML = cart.map((it, i) => {
      // priceCents puede venir o no. Si viene en `price` como número
      // (legacy "48"), lo convertimos a céntimos.
      const cents = it.priceCents != null
        ? Number(it.priceCents)
        : Math.round(Number(it.price) * 100);
      const lineTotal = cents * (it.qty || 1);
      return `
        <div class="cart-line" data-idx="${i}">
          <div class="img-ph"></div>
          <div>
            <div class="name">${escapeHtml(it.name || 'Producto')}</div>
            <div class="meta">${escapeHtml(it.meta || '')}</div>
            <button class="remove" data-remove="${i}">Eliminar</button>
          </div>
          <div class="qty">
            <button data-qty-dec="${i}" aria-label="Restar">−</button>
            <span>${it.qty || 1}</span>
            <button data-qty-inc="${i}" aria-label="Sumar">+</button>
          </div>
          <div class="price-col">${fmt(lineTotal)}</div>
        </div>
      `;
    }).join('');

    const sub   = cart.reduce((s, it) => {
      const cents = it.priceCents != null
        ? Number(it.priceCents)
        : Math.round(Number(it.price) * 100);
      return s + cents * (it.qty || 1);
    }, 0);
    const total = sub + SHIPPING_CENTS;

    if (subEl)     subEl.textContent     = fmt(sub);
    if (totalEl)   totalEl.textContent   = fmt(total);
    if (payAmount) payAmount.textContent = fmt(total);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Empuja una acción al servidor (silencioso si 401 — usuario anónimo).
  function pushToServer(body) {
    fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  }

  // Delegación de eventos en el cart-list para qty +/- y eliminar.
  document.addEventListener('click', (e) => {
    const cart = readCart();
    const inc = e.target.closest('[data-qty-inc]');
    const dec = e.target.closest('[data-qty-dec]');
    const rem = e.target.closest('[data-remove]');
    if (inc) {
      const i = Number(inc.dataset.qtyInc);
      if (cart[i]) {
        cart[i].qty = (cart[i].qty || 1) + 1;
        writeCart(cart); renderCart(); syncCartBadge();
        pushToServer({ action: 'set', slug: cart[i].slug, qty: cart[i].qty, item: cart[i] });
      }
    } else if (dec) {
      const i = Number(dec.dataset.qtyDec);
      if (cart[i]) {
        const slug = cart[i].slug;
        cart[i].qty = (cart[i].qty || 1) - 1;
        if (cart[i].qty <= 0) {
          cart.splice(i, 1);
          if (slug) pushToServer({ action: 'remove', slug });
        } else {
          pushToServer({ action: 'set', slug, qty: cart[i].qty, item: cart[i] });
        }
        writeCart(cart); renderCart(); syncCartBadge();
      }
    } else if (rem) {
      const i = Number(rem.dataset.remove);
      const slug = cart[i]?.slug;
      cart.splice(i, 1);
      writeCart(cart); renderCart(); syncCartBadge();
      if (slug) pushToServer({ action: 'remove', slug });
    }
  });

  // Sincroniza el badge del carrito en el header (chrome.js lo lee al
  // cargar pero no se actualiza solo después).
  function syncCartBadge() {
    const c = readCart();
    const count = c.reduce((n, it) => n + (it.qty || 1), 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = String(count);
      el.style.display = count === 0 ? 'none' : '';
    });
  }

  // ─── PASO 3: SELECCIÓN DE PAGO ──────────────────────────────────────
  document.querySelectorAll('.pay-opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.pay-opt').forEach((o) => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Botón "Pagar".
  // - Si NO está logueado: redirige a /login?next=/carrito (no se puede
  //   crear order sin user). Una vez logueado vuelve y reintenta.
  // - Si SÍ está logueado: POST /api/orders/create con el cart + datos del
  //   form de envío + total. La integración real con Stripe Payment Element
  //   sigue pendiente — por ahora el order queda con status='pending'.
  const payBtn = document.getElementById('pay-button');
  if (payBtn) {
    payBtn.addEventListener('click', async () => {
      // Comprueba sesión.
      let user = null;
      try {
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
        const me = await meRes.json();
        user = me?.user || null;
      } catch {}

      if (!user) {
        if (confirm('Necesitas iniciar sesión para completar el pedido. ¿Vamos a /login?')) {
          window.location.href = '/login?next=/carrito';
        }
        return;
      }

      // Recoge datos del form del paso 2.
      const form = document.getElementById('data-form');
      const fd   = form ? new FormData(form) : new FormData();
      const shipping = {
        nombre:    String(fd.get('nombre')    || '').trim(),
        email:     String(fd.get('email')     || '').trim() || user.email,
        telefono:  String(fd.get('telefono')  || '').trim(),
        direccion: String(fd.get('direccion') || '').trim(),
        ciudad:    String(fd.get('ciudad')    || '').trim(),
        cp:        String(fd.get('cp')        || '').trim(),
        pais:      String(fd.get('pais')      || 'España').trim(),
      };

      const cart = readCart();
      if (!cart.length) {
        alert('Tu cesta está vacía.');
        return;
      }
      const items = cart.map((it) => ({
        slug: it.slug || null,
        name: it.name,
        meta: it.meta || '',
        priceCents: it.priceCents != null
          ? Number(it.priceCents)
          : Math.round(Number(it.price || 0) * 100),
        qty: Math.max(1, Math.floor(Number(it.qty || 1))),
      }));

      payBtn.disabled = true;
      const originalText = payBtn.innerHTML;
      payBtn.textContent = 'Procesando…';

      try {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, shipping, shippingCents: SHIPPING_CENTS }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(`No se pudo crear el pedido: ${data?.error || res.statusText}`);
          payBtn.disabled = false;
          payBtn.innerHTML = originalText;
          return;
        }
        // Vacía el cart local (el endpoint ya lo vació en DB).
        writeCart([]);
        syncCartBadge();
        // Redirect a la página de pedidos.
        alert(`Pedido #${String(data.orderId).slice(0, 8)} creado. Status: pendiente de pago.\n\nLa integración real con Stripe sigue pendiente — pero el pedido queda registrado en tu cuenta.`);
        window.location.href = '/cuenta/pedidos';
      } catch (err) {
        alert('Error de conexión. Inténtalo en unos segundos.');
        payBtn.disabled = false;
        payBtn.innerHTML = originalText;
      }
    });
  }

  // ─── INIT ──────────────────────────────────────────────────────────
  renderCart();
})();
