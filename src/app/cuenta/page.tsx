import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function CuentaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/cuenta');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <main className="auth-page" style={{ maxWidth: 640 }}>
      <span className="eyebrow">Tu cuenta</span>
      <h1>Hola{profile?.nombre ? `, ${profile.nombre}` : ''}.</h1>
      <p className="lead">
        Gestiona tus datos personales, dirección de envío y revisa tu historial
        de pedidos.
      </p>

      <nav className="cuenta-nav">
        <Link href="/cuenta" className="active">Datos personales</Link>
        <Link href="/cuenta/pedidos">Mis pedidos</Link>
        <form action="/auth/logout" method="post" style={{ display: 'inline' }}>
          <button type="submit" className="cuenta-nav-btn">Cerrar sesión</button>
        </form>
      </nav>

      <ProfileForm
        initial={{
          email: user.email ?? '',
          nombre: profile?.nombre ?? '',
          apellidos: profile?.apellidos ?? '',
          telefono: profile?.telefono ?? '',
          direccion: profile?.direccion ?? '',
          ciudad: profile?.ciudad ?? '',
          cp: profile?.cp ?? '',
          pais: profile?.pais ?? 'España',
        }}
      />
    </main>
  );
}
