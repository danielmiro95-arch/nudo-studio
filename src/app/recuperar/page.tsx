'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/recuperar/confirmar`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="auth-page">
        <span className="eyebrow">Recuperar contraseña</span>
        <h1>Email enviado.</h1>
        <p className="lead">
          Si <strong>{email}</strong> tiene cuenta en Nudo, recibirás un enlace
          en unos segundos. Pincha en el enlace para establecer una contraseña
          nueva.
        </p>
        <div className="auth-helper">
          <Link href="/login">Volver al login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <span className="eyebrow">Recuperar contraseña</span>
      <h1>Te mandamos un enlace.</h1>
      <p className="lead">Introduce tu email y te enviamos un enlace para crear una contraseña nueva.</p>

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
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <div className="auth-helper">
        <Link href="/login">Volver al login</Link>
      </div>
    </main>
  );
}
