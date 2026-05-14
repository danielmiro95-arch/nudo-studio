// /api/orders/create · crea un pedido en la DB.
// Cuando hay integración Stripe real, esto se llamará desde el webhook
// stripe-webhook tras evento checkout.session.completed. Por ahora se
// llama desde el botón "Pagar" en /carrito como mock.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type IncomingItem = {
  slug?: string;
  name: string;
  meta?: string;
  priceCents: number;
  qty: number;
};

type Shipping = {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  cp?: string;
  pais?: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { items?: IncomingItem[]; shipping?: Shipping; shippingCents?: number; paymentMethod?: string };
  try { body = await req.json(); } catch { body = {}; }

  const items = Array.isArray(body.items) ? body.items.filter(it =>
    it && typeof it.name === 'string' && Number.isFinite(it.priceCents) && Number.isFinite(it.qty) && it.qty > 0
  ) : [];

  if (!items.length) {
    return NextResponse.json({ error: 'empty cart' }, { status: 400 });
  }

  const subtotal = items.reduce((s, it) => s + Math.floor(it.priceCents) * Math.floor(it.qty), 0);
  const shippingCents = Math.max(0, Math.floor(body.shippingCents ?? 600));
  const total = subtotal + shippingCents;
  const shipping = body.shipping ?? {};

  // Crear order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_cents: total,
      shipping_cents: shippingCents,
      currency: 'EUR',
      shipping_nombre:    shipping.nombre    ?? null,
      shipping_email:     shipping.email     ?? user.email ?? null,
      shipping_telefono:  shipping.telefono  ?? null,
      shipping_direccion: shipping.direccion ?? null,
      shipping_ciudad:    shipping.ciudad    ?? null,
      shipping_cp:        shipping.cp        ?? null,
      shipping_pais:      shipping.pais      ?? 'España',
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message || 'order create failed' }, { status: 500 });
  }

  // Insert order_items
  const itemRows = items.map(it => ({
    order_id: order.id,
    product_slug: it.slug ?? slugify(it.name),
    product_name: it.name.slice(0, 200),
    product_meta: it.meta?.slice(0, 200) ?? null,
    price_cents: Math.floor(it.priceCents),
    qty: Math.floor(it.qty),
  }));
  const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
  if (itemsErr) {
    // Rollback: borra el order si los items fallaron
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  // Vacía el carrito del user — el pedido ya está creado.
  await supabase.from('cart_items').delete().eq('user_id', user.id);

  return NextResponse.json({ orderId: order.id, total: total / 100 });
}

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}
