import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fmt(cents: number) {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de pago',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/cuenta/pedidos');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_cents, currency, created_at, order_items(product_name, qty, price_cents)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="auth-page" style={{ maxWidth: 760 }}>
      <span className="eyebrow">Tu cuenta</span>
      <h1>Tus pedidos.</h1>

      <nav className="cuenta-nav">
        <Link href="/cuenta">Datos personales</Link>
        <Link href="/cuenta/pedidos" className="active">Mis pedidos</Link>
        <form action="/auth/logout" method="post" style={{ display: 'inline' }}>
          <button type="submit" className="cuenta-nav-btn">Cerrar sesión</button>
        </form>
      </nav>

      {(!orders || orders.length === 0) ? (
        <div className="pedidos-empty">
          <p>Aún no has hecho pedidos.</p>
          <Link href="/tienda" className="btn btn-primary btn-lg">Ir a la tienda</Link>
        </div>
      ) : (
        <ul className="pedidos-list">
          {orders.map((o) => (
            <li key={o.id} className="pedido-card">
              <div className="pedido-head">
                <div>
                  <div className="pedido-date">{fmtDate(o.created_at)}</div>
                  <div className="pedido-id">#{o.id.slice(0, 8)}</div>
                </div>
                <div className="pedido-status">
                  {STATUS_LABELS[o.status] || o.status}
                </div>
              </div>
              <ul className="pedido-items">
                {o.order_items?.map((it, i) => (
                  <li key={i}>
                    <span>{it.product_name} · {it.qty}u</span>
                    <span>{fmt(it.price_cents * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="pedido-total">
                <span>Total</span>
                <span>{fmt(o.total_cents)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
