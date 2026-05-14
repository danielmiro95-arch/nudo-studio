// /api/newsletter/subscribe · añade un email a la audience de Resend.
// El form del footer (chrome.js newsletterForm) hace POST aquí.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  email: z.string().trim().email('Email no válido').max(200),
});

export async function POST(req: NextRequest) {
  // Rate limit: 3 envíos / 10 min por IP (evita spam de subs)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rl = rateLimit(`newsletter:${ip}`, { limit: 3, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Body inválido' }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
  }
  const { email } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.error('Faltan env vars: RESEND_API_KEY / RESEND_AUDIENCE_ID');
    return NextResponse.json({ error: 'Newsletter no configurado' }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
    });
    if (result.error) {
      // Si ya existe, no es un error real para el usuario.
      const msg = String(result.error.message || '').toLowerCase();
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        return NextResponse.json({ ok: true, already: true });
      }
      console.error('Resend audiences error:', result.error);
      return NextResponse.json({ error: 'No se pudo suscribir' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Newsletter subscribe failed:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
