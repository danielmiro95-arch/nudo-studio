import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { getProductBySlug } from '@/data/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CartItemSchema = z.object({
  slug: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(20),
});

const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(20),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(`checkout:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 });
  }

  // Valida body
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Body inválido' }, { status: 400 }); }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  // Resuelve productos del catálogo (NUNCA confiamos en precios del cliente)
  const items = parsed.data.items.map((it) => {
    const product = getProductBySlug(it.slug);
    if (!product || !product.available) {
      return null;
    }
    return { product, quantity: it.quantity };
  });

  if (items.some((i) => i === null)) {
    return NextResponse.json({ error: 'Algún producto no está disponible.' }, { status: 400 });
  }

  // ============================================
  // GATE: Tienda real desactivada por defecto.
  // ============================================
  // Mientras ENABLE_SHOP !== 'true' devolvemos un modo "consulta" en lugar
  // de cobrar. Así el carrito y el checkout funcionan visualmente pero
  // sin facturar nada. Cuando estés dado de alta como autónomo y tengas
  // Stripe verificado, pon ENABLE_SHOP=true en Vercel y rellena las
  // claves STRIPE_*; ese cambio activa el flujo real sin tocar código.

  const SHOP_ENABLED = process.env.ENABLE_SHOP === 'true';

  if (!SHOP_ENABLED) {
    return NextResponse.json({
      mode: 'enquiry',
      message:
        'El checkout aún no está activo. Cuéntanos qué pieza quieres y la preparamos a medida. Escríbenos a hola@nudostudio.blog.',
      // El frontend puede usar esto para abrir un mailto: prerellenado
      mailtoSubject: '[Atelier] Consulta de pedido',
      mailtoBody: items
        .filter((i): i is NonNullable<typeof i> => i !== null)
        .map((i) => `· ${i.product.name} × ${i.quantity}`)
        .join('\n'),
    });
  }

  // ============================================
  // STRIPE FLOW (activo solo cuando ENABLE_SHOP=true)
  // ============================================
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe no configurado.' }, { status: 503 });
  }

  // Importación lazy para que el bundle no incluya stripe cuando está apagado
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

  const lineItems = items
    .filter((i): i is NonNullable<typeof i> => i !== null)
    .map((i) => {
      // Si el producto tiene un Price ID de Stripe, lo usamos (recomendado).
      // Si no, creamos un line_item ad-hoc con price_data.
      if (i.product.stripePriceId) {
        return { price: i.product.stripePriceId, quantity: i.quantity };
      }
      return {
        price_data: {
          currency: i.product.currency.toLowerCase(),
          product_data: {
            name: i.product.name,
            description: i.product.shortDescription,
            images: i.product.images.map((u) => new URL(u, process.env.NEXT_PUBLIC_SITE_URL!).toString()),
          },
          unit_amount: i.product.priceCents,
        },
        quantity: i.quantity,
      };
    });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/carrito?status=success&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/carrito?status=cancelled`,
      customer_email: parsed.data.email,
      // Cobro de envío por separado — configurable en el dashboard de Stripe.
      shipping_address_collection: { allowed_countries: ['ES', 'PT', 'FR', 'IT', 'DE', 'GB'] },
      // Locale ES, pero Stripe lo ajusta según el navegador del cliente.
      locale: 'es',
    });

    return NextResponse.json({ mode: 'stripe', url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 502 });
  }
}
