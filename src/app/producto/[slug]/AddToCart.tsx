'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  slug: string;
  name: string;
  priceCents: number;
  options?: { label: string; values: string[] };
};

type CartItem = { slug?: string; name: string; meta?: string; priceCents?: number; price: number; qty: number };

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 ? 2 : 0 });

export default function AddToCart({ slug, name, priceCents, options }: Props) {
  const [qty, setQty] = useState(1);
  const [opt, setOpt] = useState(options?.values[0] ?? '');
  const [added, setAdded] = useState(false);
  const [sticky, setSticky] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);

  // Barra fija en móvil cuando el botón principal sale de pantalla.
  useEffect(() => {
    const el = addRef.current;
    if (!el) return;
    const onScroll = () => setSticky(el.getBoundingClientRect().bottom < 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function add() {
    let cart: CartItem[] = [];
    try {
      const raw = JSON.parse(localStorage.getItem('nudo_cart') || '[]');
      cart = Array.isArray(raw) ? raw : [];
    } catch {}
    const meta = opt ? `${options?.label}: ${opt}` : '';
    const existing = cart.find((it) => it.slug === slug && (it.meta || '') === meta);
    if (existing) existing.qty = (existing.qty || 1) + qty;
    else cart.push({ slug, name, meta, priceCents, price: priceCents / 100, qty });
    try { localStorage.setItem('nudo_cart', JSON.stringify(cart)); } catch {}
    const count = cart.reduce((n, it) => n + (it.qty || 1), 0);
    document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
      el.textContent = String(count);
      el.style.display = count === 0 ? 'none' : '';
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="pdp26-buy">
      {options && (
        <fieldset className="pdp26-opts">
          <legend>{options.label}</legend>
          <div>
            {options.values.map((v) => (
              <button key={v} type="button" aria-pressed={opt === v} onClick={() => setOpt(v)}>
                {v}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="pdp26-row">
        <div className="pdp26-qty">
          <button type="button" aria-label="Quitar uno" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span aria-live="polite">{qty}</span>
          <button type="button" aria-label="Añadir uno" onClick={() => setQty((q) => q + 1)}>+</button>
        </div>
        <button ref={addRef} type="button" className="pdp26-add" onClick={add}>
          {added ? 'Añadido ✓' : `Añadir al carrito · ${fmt(priceCents * qty)}`}
        </button>
      </div>
      <div className={`pdp26-sticky${sticky ? ' on' : ''}`} aria-hidden={!sticky}>
        <span className="n"><b>{name}</b>{fmt(priceCents * qty)}</span>
        <button type="button" tabIndex={sticky ? 0 : -1} onClick={add}>{added ? 'Añadido ✓' : 'Añadir'}</button>
      </div>
      {added && (
        <p className="pdp26-added" role="status">
          Añadido a tu carrito. <a href="/carrito">Ver carrito →</a>
        </p>
      )}
    </div>
  );
}
