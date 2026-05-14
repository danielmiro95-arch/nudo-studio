// /api/cart/sync · merge bidireccional entre carrito localStorage y DB.
//
// POST body: { items: [{ slug, name, meta, priceCents, qty }] }
// - Si user no logueado → 401
// - Upsert cada item con MAX(qty existente, qty nuevo) — no sumamos para
//   evitar sorpresas "el carro creció solo".
// - Devuelve el set merged final desde la DB.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ClientItem = {
  slug?: string;
  name: string;
  meta?: string;
  priceCents: number;
  qty: number;
};

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { items?: ClientItem[] };
  try { body = await req.json(); } catch { body = {}; }
  const localItems = Array.isArray(body.items) ? body.items : [];

  // Validación y normalización mínima
  const cleaned: ClientItem[] = localItems
    .filter(it => it && typeof it.name === 'string' && Number.isFinite(it.priceCents) && Number.isFinite(it.qty) && it.qty > 0)
    .map(it => ({
      slug: it.slug?.toString().trim() || slugify(it.name),
      name: it.name.toString().slice(0, 200),
      meta: it.meta?.toString().slice(0, 200) || undefined,
      priceCents: Math.max(0, Math.floor(it.priceCents)),
      qty: Math.max(1, Math.floor(it.qty)),
    }));

  // Lee lo que ya está en DB para hacer max(qty).
  const { data: existing } = await supabase
    .from('cart_items')
    .select('product_slug, qty')
    .eq('user_id', user.id);
  const dbByslug = new Map((existing ?? []).map(r => [r.product_slug, r.qty]));

  // Upserts en paralelo (con MAX(qty)).
  if (cleaned.length) {
    const rows = cleaned.map(it => ({
      user_id: user.id,
      product_slug: it.slug!,
      product_name: it.name,
      product_meta: it.meta ?? null,
      price_cents: it.priceCents,
      qty: Math.max(it.qty, dbByslug.get(it.slug!) ?? 0),
    }));
    const { error } = await supabase
      .from('cart_items')
      .upsert(rows, { onConflict: 'user_id,product_slug' });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Devuelve el merged set completo.
  const { data: merged } = await supabase
    .from('cart_items')
    .select('product_slug, product_name, product_meta, price_cents, qty')
    .eq('user_id', user.id)
    .order('added_at', { ascending: true });

  return NextResponse.json({
    items: (merged ?? []).map(r => ({
      slug: r.product_slug,
      name: r.product_name,
      meta: r.product_meta,
      priceCents: r.price_cents,
      price: r.price_cents / 100,
      qty: r.qty,
    })),
  });
}
