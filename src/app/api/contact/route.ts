import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Schema de validación. Nunca confiamos en lo que llega del cliente.
const ContactSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre demasiado corto').max(120),
  email: z.string().trim().email('Email no válido').max(200),
  telefono: z.string().trim().max(40).optional().or(z.literal('')),
  servicio: z.string().trim().max(80).optional().or(z.literal('')),
  fecha: z.string().trim().max(40).optional().or(z.literal('')),
  mensaje: z.string().trim().min(10, 'Mensaje demasiado corto').max(5000),
  // Honeypot anti-bots: si viene relleno, descartamos silenciosamente.
  website: z.string().max(0).optional().or(z.literal('')),
});

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  // 1. Rate limit por IP: 5 envíos / 10 min
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? req.headers.get('x-real-ip')
          ?? 'unknown';
  const rl = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiados envíos. Espera unos minutos.' },
      { status: 429 }
    );
  }

  // 2. Parse y valida
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { nombre, email, telefono, servicio, fecha, mensaje, website } = parsed.data;

  // 3. Honeypot: si el bot rellenó "website", fingimos éxito sin enviar nada
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // 4. Comprueba envs
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  const from = process.env.CONTACT_EMAIL_FROM;
  if (!apiKey || !to || !from) {
    console.error('Faltan env vars: RESEND_API_KEY / CONTACT_EMAIL_TO / CONTACT_EMAIL_FROM');
    return NextResponse.json({ error: 'Servicio de email no configurado' }, { status: 503 });
  }

  // 5. Envía email
  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; padding: 24px; color: #0A0A0A;">
      <p style="font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: #8a857d; margin: 0 0 8px;">Nuevo formulario · Nudo Studio</p>
      <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -.02em; margin: 0 0 24px;">${escapeHtml(nombre)}</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #8a857d; font-size: 13px; width: 100px;">Email</td>     <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #0A0A0A;">${escapeHtml(email)}</a></td></tr>
        ${telefono ? `<tr><td style="padding: 8px 0; color: #8a857d; font-size: 13px;">Teléfono</td>  <td style="padding: 8px 0;">${escapeHtml(telefono)}</td></tr>` : ''}
        ${servicio ? `<tr><td style="padding: 8px 0; color: #8a857d; font-size: 13px;">Servicio</td>  <td style="padding: 8px 0;">${escapeHtml(servicio)}</td></tr>` : ''}
        ${fecha    ? `<tr><td style="padding: 8px 0; color: #8a857d; font-size: 13px;">Fecha</td>     <td style="padding: 8px 0;">${escapeHtml(fecha)}</td></tr>` : ''}
      </table>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: #8a857d; margin: 0 0 12px;">Mensaje</p>
      <p style="white-space: pre-wrap; line-height: 1.6; margin: 0;">${escapeHtml(mensaje)}</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `[Nudo Studio] ${servicio ? servicio + ' — ' : ''}${nombre}`,
      html,
    });
    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({ error: 'No se pudo enviar el email' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact email failed:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
