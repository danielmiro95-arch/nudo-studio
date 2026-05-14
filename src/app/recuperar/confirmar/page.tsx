'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ConfirmarPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) { setError('Mínimo 8 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push('/cuenta');
    router.refresh();
  }

  return (
    <main className="auth-page">
      <span className="eyebrow">Nueva contraseña</span>
      <h1>Crea tu nueva contraseña.</h1>
      <p className="lead">Una vez guardada, te llevamos a tu cuenta.</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>Nueva contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            required minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <small>Mínimo 8 caracteres.</small>
        </label>
        <label className="auth-field">
          <span>Confirma</span>
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
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>

      <div className="auth-helper">
        <Link href="/login">Volver al login</Link>
      </div>
    </main>
  );
}
