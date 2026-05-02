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

  // Delegación de eventos en el cart-list para qty +/- y eliminar.
  document.addEventListener('click', (e) => {
    const cart = readCart();
    const inc = e.target.closest('[data-qty-inc]');
    const dec = e.target.closest('[data-qty-dec]');
    const rem = e.target.closest('[data-remove]');
    if (inc) {
      const i = Number(inc.dataset.qtyInc);
      if (cart[i]) { cart[i].qty = (cart[i].qty || 1) + 1; writeCart(cart); renderCart(); syncCartBadge(); }
    } else if (dec) {
      const i = Number(dec.dataset.qtyDec);
      if (cart[i]) {
        cart[i].qty = (cart[i].qty || 1) - 1;
        if (cart[i].qty <= 0) cart.splice(i, 1);
        writeCart(cart); renderCart(); syncCartBadge();
      }
    } else if (rem) {
      const i = Number(rem.dataset.remove);
      cart.splice(i, 1);
      writeCart(cart); renderCart(); syncCartBadge();
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

  // Botón "Pagar" — cosmético por ahora. Stripe Payment Element pendiente
  // de tu config (D2 del plan: requiere API keys + métodos activados).
  const payBtn = document.getElementById('pay-button');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      const method = document.querySelector('input[name="pay"]:checked')?.value || 'visa';
      const total  = document.getElementById('pay-amount')?.textContent || '';
      alert(
        `Pago simulado · método: ${method} · total: ${total}\n\n` +
        `La integración real con Stripe Payment Element está pendiente ` +
        `de tus credenciales (cuenta + métodos activados en el dashboard).`
      );
    });
  }

  // ─── INIT ──────────────────────────────────────────────────────────
  renderCart();
})();
