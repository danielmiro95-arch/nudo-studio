'use client';

import { useState } from 'react';

const CSS = `
.femp{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.femp label{display:flex;flex-direction:column;gap:8px;font-size:13px;color:#3D3530}
.femp .full{grid-column:1/-1}
.femp input,.femp select,.femp textarea{font:inherit;font-size:16px;color:#111;padding:14px 16px;border:1px solid #D9CCBF;border-radius:6px;background:#FFFDFB}
.femp input:focus,.femp select:focus,.femp textarea:focus{outline:2px solid #8E4E5C;outline-offset:1px;border-color:transparent}
.femp textarea{min-height:130px;resize:vertical}
.femp-uses{display:flex;flex-wrap:wrap;gap:8px}
.femp-uses button{min-height:42px;padding:0 16px;border-radius:999px;border:1px solid #D9CCBF;background:transparent;font:inherit;font-size:14px;cursor:pointer;color:#111}
.femp-uses button[aria-pressed=true]{background:#111;color:#FAF8F5;border-color:#111}
.femp-send{height:54px;border:0;border-radius:999px;background:#111;color:#FAF8F5;font:inherit;font-size:15px;font-weight:500;cursor:pointer}
.femp-send:hover{background:#8E4E5C}.femp-send:disabled{opacity:.6;cursor:wait}
.femp-msg{margin:0;font-size:15px;line-height:1.6}
.femp-msg a{color:#8E4E5C}
.femp-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.femp-legal{margin:0;font-size:12px;color:#6B5E55}.femp-legal a{color:inherit}
@media (max-width:640px){.femp{grid-template-columns:1fr}}
`;

const USOS = ['Navidad', 'Bienvenida empleados', 'Clientes', 'Evento de empresa', 'Otro'];

export default function FormEmpresas() {
  const [usos, setUsos] = useState<string[]>(['Navidad']);
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) || '').trim();
    const mensaje = [
      `Empresa: ${g('empresa')}`,
      `Para: ${usos.join(', ') || '—'}`,
      `Unidades: ${g('unidades')}`,
      `Presupuesto por persona: ${g('presupuesto') || '—'}`,
      `Fecha de entrega: ${g('fecha') || '—'}`,
      '',
      g('mensaje') || '(sin comentarios)',
    ].join('\n');
    setState('sending');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: g('nombre'),
          email: g('email'),
          telefono: g('telefono'),
          servicio: 'Empresas',
          fecha: g('fecha'),
          mensaje,
          website: g('website'),
        }),
      });
      setState(r.ok ? 'ok' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'ok') {
    return (
      <div role="status">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <p className="femp-msg" style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1.15 }}>Gracias. Hemos recibido vuestra solicitud.</p>
        <p className="femp-msg" style={{ marginTop: 12, color: '#3D3530' }}>Os escribimos con una propuesta lo antes posible.</p>
      </div>
    );
  }

  return (
    <form className="femp" onSubmit={submit}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <label>Empresa<input name="empresa" required autoComplete="organization" /></label>
      <label>Nombre y apellidos<input name="nombre" required minLength={2} autoComplete="name" /></label>
      <label>Email de trabajo<input name="email" type="email" required autoComplete="email" /></label>
      <label>Teléfono (opcional)<input name="telefono" type="tel" autoComplete="tel" /></label>
      <div className="full" role="group" aria-label="Para qué es el regalo">
        <span style={{ display: 'block', fontSize: 13, color: '#3D3530', marginBottom: 8 }}>¿Para qué es?</span>
        <div className="femp-uses">
          {USOS.map((u) => (
            <button key={u} type="button" aria-pressed={usos.includes(u)} onClick={() => setUsos((l) => (l.includes(u) ? l.filter((x) => x !== u) : [...l, u]))}>{u}</button>
          ))}
        </div>
      </div>
      <label>Unidades aproximadas
        <select name="unidades" required defaultValue="">
          <option value="" disabled>Elige</option>
          <option>Menos de 25</option><option>25 – 50</option><option>50 – 100</option><option>100 – 250</option><option>Más de 250</option>
        </select>
      </label>
      <label>Presupuesto por persona
        <select name="presupuesto" defaultValue="">
          <option value="">Aún no lo sé</option>
          <option>Hasta 25 €</option><option>25 – 50 €</option><option>50 – 100 €</option><option>Más de 100 €</option>
        </select>
      </label>
      <label className="full">¿Para cuándo lo necesitáis?<input name="fecha" type="date" /></label>
      <label className="full">Cuéntanos más (opcional)<textarea name="mensaje" maxLength={4000} placeholder="Ideas, colores de marca, si hay que enviar a varias direcciones…" /></label>
      <label className="femp-hp" aria-hidden="true">No rellenar<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="femp-send full" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Pedir presupuesto'}</button>
      {state === 'error' && (
        <p className="femp-msg full" role="alert">
          No hemos podido enviarlo ahora mismo. Escríbenos a <a href="mailto:hola@nudostudio.blog">hola@nudostudio.blog</a> o por{' '}
          <a href="https://wa.me/34624324882" target="_blank" rel="noopener">WhatsApp</a>.
        </p>
      )}
      <p className="femp-legal full">Usamos estos datos solo para responder a tu solicitud. <a href="/legal/privacidad">Privacidad</a>.</p>
    </form>
  );
}
