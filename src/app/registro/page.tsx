'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/cuenta`,
      },
    });
    setLoading(false);

    if (error) {
      setError(traducirError(error.message));
      return;
    }

    // Si Supabase tiene "Confirm email" desactivado, hay sesión inmediata.
    // Si está activado, hay que esperar al email.
    if (data.session) {
      router.push('/cuenta');
      router.refresh();
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <main className="auth-page">
        <span className="eyebrow">Cuenta creada</span>
        <h1>Confirma tu email.</h1>
        <p className="lead">
          Te hemos enviado un enlace a <strong>{email}</strong>. Pincha en el
          enlace para activar tu cuenta y poder iniciar sesión.
        </p>
        <div className="auth-helper">
          <Link href="/login">Ya he confirmado · Iniciar sesión</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <span className="eyebrow">Crear cuenta</span>
      <h1>Regístrate.</h1>
      <p className="lead">Carrito guardado, historial de pedidos y comunicación más directa con el estudio.</p>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <small>Mínimo 8 caracteres.</small>
        </label>
        <label className="auth-field">
          <span>Confirma la contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <div className="auth-helper">
        <Link href="/login">¿Ya tienes cuenta? · Inicia sesión</Link>
      </div>
    </main>
  );
}

function traducirError(msg: string): string {
  if (/already registered|already exists/i.test(msg)) return 'Ese email ya tiene cuenta. ¿Querías iniciar sesión?';
  if (/password.*weak/i.test(msg)) return 'Contraseña demasiado débil.';
  if (/invalid email/i.test(msg)) return 'Email no válido.';
  return msg;
}
