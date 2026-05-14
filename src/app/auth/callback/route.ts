// Callback al que Supabase redirige tras click en magic link (email confirm,
// reset password, OAuth). Intercambia el code por una sesión cookie y redirige
// al destino indicado en ?next= (default: /).

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si algo falló, redirige a login con flag de error.
  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
