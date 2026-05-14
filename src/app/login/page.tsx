'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/cuenta';
  const initialError = params.get('error') === 'auth_callback'
    ? 'El enlace no es válido o ha caducado. Inténtalo de nuevo.'
    : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(traducirError(error.message));
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="auth-page">
      <span className="eyebrow">Acceso</span>
      <h1>Iniciar sesión</h1>
      <p className="lead">Para tu carrito, tus pedidos y futuros eventos.</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        <label className="auth-field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="auth-helper">
        <Link href="/recuperar">¿Olvidaste tu contraseña?</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/registro">Crear cuenta</Link>
      </div>
    </main>
  );
}

function traducirError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Email o contraseña incorrectos.';
  if (/email not confirmed/i.test(msg)) return 'Confirma tu email antes de iniciar sesión.';
  if (/too many requests/i.test(msg)) return 'Demasiados intentos. Espera un minuto.';
  return msg;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
