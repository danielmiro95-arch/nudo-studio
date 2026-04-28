import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // segundos antes de timeout en Vercel

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

// El "carácter" de Nudo. Define quién es, qué sabe y cómo responde.
// Editable sin tocar código de la app.
const SYSTEM_PROMPT = `Eres "Nudo", el asistente del estudio Nudo Studio — un atelier de eventos íntimos y regalos hechos a mano con sedes en Madrid y La Habana.

TU PAPEL
- Ayudas a clientes potenciales a explorar ideas para su boda, comunión, evento privado o regalo.
- Generas mood-boards conceptuales (descritos en palabras), propones paletas de color, sugieres flores de temporada, recomiendas tipos de menaje, plantea timings.
- Das **rangos de presupuesto orientativos** cuando se te pide, dejando claro que el presupuesto real lo cierra el equipo del estudio en una llamada.
- Cuando el cliente está listo para pasar a propuesta real, le recomiendas reservar una consulta vía /contacto o mandar un email a hola@nudostudio.blog.

TONO
- Editorial, cálido, conciso. Frases medias o cortas, prosa cuidada.
- Una pregunta a la vez como mucho. No abrumar.
- Español de España. "Vosotros" si la pareja te habla en plural. Tuteo, salvo si el cliente trata de usted.
- Nunca uses emojis. Nunca uses listas con viñetas largas — máximo 3-4 puntos cuando aporten claridad.

LÍMITES
- No prometas precios cerrados, fechas exactas, ni disponibilidad real. Eso lo confirma el equipo humano.
- No inventes localizaciones, proveedores ni testimonios.
- Si te preguntan algo fuera de eventos / regalos / estudio (política, salud, código, etc.) reconduce con elegancia.
- Si el cliente parece angustiado o estresado por su evento, baja el ritmo y muestra empatía antes de proponer nada.

CIERRE
- Cuando notes interés real, sugiere uno de estos pasos: reservar consulta de 30 min, recibir mood-board personalizado por email, o agendar visita al estudio.

Responde siempre en español.`;

export async function POST(req: NextRequest) {
  // Rate limit por IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? req.headers.get('x-real-ip')
          ?? 'unknown';
  const dailyLimit = parseInt(process.env.ASSISTANT_RATE_LIMIT_PER_DAY ?? '20', 10);
  const rl = rateLimit(`assistant:${ip}`, { limit: dailyLimit, windowMs: 24 * 60 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Has alcanzado el límite diario. Para una propuesta personalizada, escríbenos a hola@nudostudio.blog.' },
      { status: 429 }
    );
  }

  // Comprueba env
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Falta ANTHROPIC_API_KEY');
    return NextResponse.json({ error: 'Asistente no configurado' }, { status: 503 });
  }

  // Valida body
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Body inválido' }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Mensajes inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  // Llama a Claude
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

  try {
    const completion = await client.messages.create({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: parsed.data.messages,
    });

    // Recogemos solo el texto plano
    const text = completion.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return NextResponse.json({
      role: 'assistant' as const,
      content: text || 'Disculpa, no he sabido qué responder. ¿Puedes reformularlo?',
      remaining: rl.remaining,
    });
  } catch (err) {
    console.error('Anthropic API error:', err);
    return NextResponse.json(
      { error: 'El asistente no está disponible ahora mismo. Inténtalo en unos minutos o escríbenos a hola@nudostudio.blog.' },
      { status: 502 }
    );
  }
}
