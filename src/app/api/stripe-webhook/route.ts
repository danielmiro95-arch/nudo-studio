import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook de Stripe.
 *
 * Stripe nos llama aquí cada vez que pasa algo importante con un pago
 * (checkout completado, fallo, reembolso…). Nuestra responsabilidad:
 *  1. Verificar la firma para asegurar que la llamada es de Stripe.
 *  2. Reaccionar al evento (típicamente: enviar email de confirmación).
 *
 * Cómo activarlo:
 *  - Crea un endpoint en https://dashboard.stripe.com/webhooks apuntando
 *    a https://nudostudio.blog/api/stripe-webhook
 *  - Eventos a escuchar: checkout.session.completed
 *  - Copia el "Signing secret" → STRIPE_WEBHOOK_SECRET en Vercel
 */

export async function POST(req: NextRequest) {
  if (process.env.ENABLE_SHOP !== 'true') {
    return NextResponse.json({ error: 'Shop disabled' }, { status: 503 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  // Stripe necesita el body crudo para verificar la firma — NO usar req.json()
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Despacho del evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email ?? session.customer_email;
    const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
    const currency = (session.currency ?? 'eur').toUpperCase();

    // 1. Email al estudio
    const apiKey = process.env.RESEND_API_KEY;
    const studioEmail = process.env.CONTACT_EMAIL_TO;
    const fromEmail = process.env.CONTACT_EMAIL_FROM;

    if (apiKey && studioEmail && fromEmail) {
      const resend = new Resend(apiKey);
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [studioEmail],
          subject: `[Pedido confirmado] ${customerEmail ?? 'cliente'} · ${amount} ${currency}`,
          text: `Nuevo pedido pagado.\n\nCliente: ${customerEmail ?? '—'}\nTotal: ${amount} ${currency}\nSesión: ${session.id}\n\nRevisa los detalles en el dashboard de Stripe.`,
        });
        if (customerEmail) {
          await resend.emails.send({
            from: fromEmail,
            to: [customerEmail],
            subject: 'Hemos recibido tu pedido — Nudo Studio',
            text: `Gracias por tu pedido en Nudo Studio.\n\nTotal: ${amount} ${currency}\nReferencia: ${session.id}\n\nNos pondremos en contacto en las próximas 48h con los detalles del envío.\n\nCon cariño,\nNudo Studio.`,
          });
        }
      } catch (err) {
        console.error('Confirmation email failed:', err);
        // No devolvemos error a Stripe — el pago YA está hecho. Lo registramos y seguimos.
      }
    }
  }

  return NextResponse.json({ received: true });
}
