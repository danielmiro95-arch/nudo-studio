import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Trae también el perfil (puede no existir aún si el trigger falló).
  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, apellidos')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      nombre: profile?.nombre ?? null,
      apellidos: profile?.apellidos ?? null,
    },
  });
}
