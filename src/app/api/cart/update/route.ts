// /api/cart/update · acciones individuales (add/set/remove) sobre cart_items.
// POST body: { action: 'set'|'remove'|'clear', slug?, qty?, item? }
//   set:    upsert con qty exacta. Requiere slug y qty>0. Si item viene,
//           lo usa para name/meta/priceCents en caso de INSERT.
//   remove: borra esa fila. Requiere slug.
//   clear:  borra todo el carrito del user.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const action = body?.action;

  if (action === 'clear') {
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    return NextResponse.json({ ok: true });
  }

  if (action === 'remove') {
    const slug = body?.slug?.toString();
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    await supabase.from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_slug', slug);
    return NextResponse.json({ ok: true });
  }

  if (action === 'set') {
    const slug = body?.slug?.toString();
    const qty  = Math.floor(Number(body?.qty ?? 0));
    if (!slug)   return NextResponse.json({ error: 'slug required' }, { status: 400 });
    if (qty <= 0) {
      // qty 0 o negativa → equivalente a remove
      await supabase.from('cart_items')
        .delete().eq('user_id', user.id).eq('product_slug', slug);
      return NextResponse.json({ ok: true });
    }
    const item = body?.item ?? {};
    const row = {
      user_id: user.id,
      product_slug: slug,
      product_name: (item.name ?? slug).toString().slice(0, 200),
      product_meta: item.meta ? String(item.meta).slice(0, 200) : null,
      price_cents: Math.max(0, Math.floor(Number(item.priceCents ?? 0))),
      qty,
    };
    const { error } = await supabase
      .from('cart_items')
      .upsert(row, { onConflict: 'user_id,product_slug' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
