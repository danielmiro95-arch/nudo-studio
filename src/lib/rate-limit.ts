/**
 * Rate limiter en memoria por instancia.
 *
 * Limitaciones conocidas:
 *  - Vercel puede tener varias instancias frías; el límite es por instancia.
 *    Para un sitio de poco tráfico esto es más que suficiente y evita
 *    depender de Redis/Upstash desde el día uno.
 *  - Si en el futuro hay tráfico real, sustituir por Upstash Ratelimit
 *    (https://upstash.com/docs/redis/sdks/ratelimit-ts) sin cambiar la
 *    interfaz pública.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Limpieza perezosa para no comer memoria
function gc(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  gc(now);

  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    const next = { count: 1, resetAt: now + opts.windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: opts.limit - 1, resetAt: next.resetAt };
  }

  if (b.count >= opts.limit) {
    return { allowed: false, remaining: 0, resetAt: b.resetAt };
  }

  b.count += 1;
  return { allowed: true, remaining: opts.limit - b.count, resetAt: b.resetAt };
}
