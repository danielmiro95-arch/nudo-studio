// Cliente Supabase para Server Components y Route Handlers.
// Mantiene la sesión vía cookies (HttpOnly) de Next.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component context: no se pueden setear cookies aquí.
            // El middleware se encarga del refresh de sesión. OK ignorar.
          }
        },
      },
    },
  );
}
