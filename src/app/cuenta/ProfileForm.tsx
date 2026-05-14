'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Profile = {
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  cp: string;
  pais: string;
};

export function ProfileForm({ initial }: { initial: Profile }) {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setData(d => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    setErrorMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus('error');
      setErrorMsg('Sesión perdida. Inicia sesión otra vez.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        nombre: data.nombre || null,
        apellidos: data.apellidos || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        ciudad: data.ciudad || null,
        cp: data.cp || null,
        pais: data.pais || null,
      })
      .eq('id', user.id);

    setSaving(false);
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('ok');
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} style={{ marginTop: 40 }}>
      <label className="auth-field">
        <span>Email</span>
        <input type="email" value={data.email} disabled />
        <small>El email no se puede cambiar desde aquí.</small>
      </label>

      <div className="grid-2">
        <label className="auth-field">
          <span>Nombre</span>
          <input type="text" value={data.nombre}
            onChange={e => set('nombre', e.target.value)} />
        </label>
        <label className="auth-field">
          <span>Apellidos</span>
          <input type="text" value={data.apellidos}
            onChange={e => set('apellidos', e.target.value)} />
        </label>
      </div>

      <label className="auth-field">
        <span>Teléfono</span>
        <input type="tel" value={data.telefono}
          onChange={e => set('telefono', e.target.value)} />
      </label>

      <label className="auth-field">
        <span>Dirección</span>
        <input type="text" value={data.direccion}
          placeholder="Calle, número, piso"
          onChange={e => set('direccion', e.target.value)} />
      </label>

      <div className="grid-3">
        <label className="auth-field">
          <span>Ciudad</span>
          <input type="text" value={data.ciudad}
            onChange={e => set('ciudad', e.target.value)} />
        </label>
        <label className="auth-field">
          <span>Código postal</span>
          <input type="text" value={data.cp}
            onChange={e => set('cp', e.target.value)} />
        </label>
        <label className="auth-field">
          <span>País</span>
          <select value={data.pais} onChange={e => set('pais', e.target.value)}>
            <option>España</option>
            <option>Portugal</option>
            <option>Francia</option>
            <option>Italia</option>
            <option>Otro</option>
          </select>
        </label>
      </div>

      {status === 'error' && <p className="auth-error">{errorMsg}</p>}
      {status === 'ok' && <p className="auth-ok">Guardado.</p>}

      <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
