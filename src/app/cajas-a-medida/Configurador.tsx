'use client';

import { useMemo, useState } from 'react';
import { CINTAS, EXTRAS, MIN_PRESUPUESTO, PIEZAS, TAMANOS, TRAMOS } from '@/data/cajas';

const eur = (c: number) =>
  (c / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: c % 100 ? 2 : 0 });

const CSS = `
.cfg26{max-width:1360px;margin:0 auto;padding:0 40px 120px;color:#111}
.cfg26-head{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:56px;align-items:end;padding:56px 0 48px}
.cfg26-eyebrow{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#6B5E55}
.cfg26-head h1{margin:16px 0 0;font-family:var(--font-serif);font-weight:400;font-size:clamp(44px,6vw,84px);line-height:.98;letter-spacing:-.015em}
.cfg26-head p{margin:0;font-size:17px;line-height:1.6;color:#3D3530;max-width:46ch}
.cfg26-main{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(320px,1fr);gap:56px;align-items:start}
.cfg26-step{border-top:1px solid #E8DED4;padding:32px 0}
.cfg26-step h2{margin:0 0 6px;font-family:var(--font-serif);font-weight:400;font-size:32px}
.cfg26-step h2 small{font-family:Inter,system-ui,sans-serif;font-size:12px;letter-spacing:.2em;color:#8E4E5C;margin-right:12px;vertical-align:middle}
.cfg26-hint{margin:0 0 20px;font-size:14px;color:#6B5E55}
.cfg26-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.cfg26-opt{position:relative;display:flex;flex-direction:column;gap:4px;padding:16px 18px;border:1px solid #D9CCBF;border-radius:6px;background:transparent;font:inherit;text-align:left;color:#111;cursor:pointer;transition:border-color .2s,background .2s}
.cfg26-opt:hover{border-color:#111}
.cfg26-opt[aria-pressed=true],.cfg26-opt[aria-checked=true]{border-color:#111;background:#111;color:#FAF8F5}
.cfg26-opt[aria-pressed=true] .d,.cfg26-opt[aria-checked=true] .d{color:#D9CCBF}
.cfg26-opt:disabled{opacity:.4;cursor:not-allowed}
.cfg26-opt .n{font-size:15px;font-weight:500}
.cfg26-opt .d{font-size:13px;color:#6B5E55}
.cfg26-opt .p{font-size:14px;margin-top:6px}
.cfg26-chips{display:flex;flex-wrap:wrap;gap:8px}
.cfg26-chips button{min-height:44px;padding:0 18px;border-radius:999px;border:1px solid #D9CCBF;background:transparent;font:inherit;font-size:14px;color:#111;cursor:pointer}
.cfg26-chips button[aria-pressed=true]{background:#111;border-color:#111;color:#FAF8F5}
.cfg26-qty{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.cfg26-qty input{width:120px;height:52px;padding:0 16px;border:1px solid #D9CCBF;border-radius:999px;font:inherit;font-size:18px;text-align:center;background:transparent}
.cfg26-tramos{display:flex;gap:8px;flex-wrap:wrap}
.cfg26-tramos span{font-size:13px;padding:6px 12px;border-radius:999px;background:#F1EAE2;color:#3D3530}
.cfg26-tramos span.on{background:#8E4E5C;color:#FAF8F5}
.cfg26-sum{position:sticky;top:96px;border:1px solid #E8DED4;border-radius:6px;overflow:hidden;background:#FFFDFB}
.cfg26-sum img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#F1EAE2}
.cfg26-sum-in{padding:24px 26px 28px;display:flex;flex-direction:column;gap:14px}
.cfg26-sum h3{margin:0;font-family:var(--font-serif);font-weight:400;font-size:28px}
.cfg26-lines{list-style:none;margin:0;padding:0;font-size:14px;color:#3D3530}
.cfg26-lines li{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px dashed #E8DED4}
.cfg26-total{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.cfg26-total b{font-family:var(--font-serif);font-weight:400;font-size:40px}
.cfg26-unit{font-size:14px;color:#6B5E55}
.cfg26-save{font-size:14px;color:#8E4E5C}
.cfg26-btn{display:flex;align-items:center;justify-content:center;height:54px;border:0;border-radius:999px;background:#111;color:#FAF8F5;font:inherit;font-size:15px;font-weight:500;text-decoration:none;cursor:pointer}
.cfg26-btn:hover{background:#8E4E5C}
.cfg26-btn.alt{background:transparent;color:#111;border:1px solid #D9CCBF}
.cfg26-btn.alt:hover{border-color:#111;background:transparent}
.cfg26-note{margin:0;font-size:12px;line-height:1.5;color:#6B5E55}
.cfg26-ok{margin:0;font-size:14px}.cfg26-ok a{color:#8E4E5C}
.cfg26-how{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:96px;padding-top:48px;border-top:1px solid #E8DED4}
.cfg26-how b{display:block;font-family:var(--font-serif);font-weight:400;font-size:24px;margin:8px 0 6px}
.cfg26-how p{margin:0;font-size:14px;line-height:1.6;color:#3D3530}
.cfg26-how span{font-size:12px;letter-spacing:.2em;color:#8E4E5C}
@media (max-width:960px){
  .cfg26{padding:0 16px 140px}
  .cfg26-head,.cfg26-main{grid-template-columns:1fr;gap:24px}
  .cfg26-head{padding:32px 0 24px}
  .cfg26-sum{position:static}
  .cfg26-sum img{display:none}
  .cfg26-how{grid-template-columns:1fr 1fr}
}
`;

export default function Configurador() {
  const [tam, setTam] = useState(TAMANOS[1].id);
  const [piezas, setPiezas] = useState<string[]>(['vela', 'flor', 'dulce']);
  const [extras, setExtras] = useState<string[]>(['lacre']);
  const [cinta, setCinta] = useState(CINTAS[0]);
  const [qty, setQty] = useState(1);

  const size = TAMANOS.find((t) => t.id === tam)!;
  const lleno = piezas.length >= size.maxPiezas;

  const calc = useMemo(() => {
    const items = [size, ...PIEZAS.filter((p) => piezas.includes(p.id)), ...EXTRAS.filter((e) => extras.includes(e.id))];
    const unit = items.reduce((n, i) => n + i.cents, 0);
    const tramo = TRAMOS.find((t) => qty >= t.min);
    const pct = tramo?.pct ?? 0;
    const unitDto = Math.round((unit * (100 - pct)) / 100);
    return { items, unit, pct, unitDto, total: unitDto * qty, ahorro: (unit - unitDto) * qty };
  }, [size, piezas, extras, qty]);

  function setTamano(id: string) {
    const t = TAMANOS.find((x) => x.id === id)!;
    setTam(id);
    setPiezas((p) => p.slice(0, t.maxPiezas));
  }
  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const resumen = [
    `Caja ${size.nombre.toLowerCase()}`,
    ...PIEZAS.filter((p) => piezas.includes(p.id)).map((p) => p.nombre),
    ...EXTRAS.filter((e) => extras.includes(e.id)).map((e) => e.nombre),
    `Cinta ${cinta.toLowerCase()}`,
  ];
  const presupuesto = qty >= MIN_PRESUPUESTO;
  const msg = `Hola, me interesan ${qty} cajas a medida: ${resumen.join(', ')}. Precio orientativo: ${eur(calc.unitDto)}/caja (${eur(calc.total)} en total). ¿Me preparáis presupuesto?`;
  const contacto = `/contacto?msg=${encodeURIComponent(msg)}`;

  return (
    <main className="cfg26" id="contenido">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="cfg26-head">
        <div>
          <span className="cfg26-eyebrow">Atelier · Bodas, empresas y celebraciones</span>
          <h1>Diseña tu caja a medida.</h1>
        </div>
        <p>
          Elige el tamaño, lo que va dentro y cómo se cierra. Ves el precio al momento y, a partir de {MIN_PRESUPUESTO} cajas,
          aplicamos descuento por cantidad. La montamos a mano en Madrid.
        </p>
      </header>

      <div className="cfg26-main">
        <div>
          <section className="cfg26-step" aria-labelledby="s1">
            <h2 id="s1"><small>01</small>Tamaño</h2>
            <p className="cfg26-hint">El tamaño marca cuántas piezas caben.</p>
            <div className="cfg26-opts" role="radiogroup" aria-labelledby="s1">
              {TAMANOS.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={tam === t.id} className="cfg26-opt" onClick={() => setTamano(t.id)}>
                  <span className="n">{t.nombre}</span>
                  <span className="d">{t.detalle}</span>
                  <span className="p">{eur(t.cents)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="cfg26-step" aria-labelledby="s2">
            <h2 id="s2"><small>02</small>Contenido</h2>
            <p className="cfg26-hint" aria-live="polite">
              {piezas.length} de {size.maxPiezas} piezas{lleno ? ' · caja completa (elige un tamaño mayor para añadir más)' : ''}
            </p>
            <div className="cfg26-opts">
              {PIEZAS.map((p) => {
                const on = piezas.includes(p.id);
                return (
                  <button key={p.id} type="button" aria-pressed={on} disabled={!on && lleno} className="cfg26-opt" onClick={() => toggle(piezas, setPiezas, p.id)}>
                    <span className="n">{p.nombre}</span>
                    <span className="d">{p.detalle}</span>
                    <span className="p">+ {eur(p.cents)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="cfg26-step" aria-labelledby="s3">
            <h2 id="s3"><small>03</small>Personalización</h2>
            <p className="cfg26-hint">El detalle que hace que nadie la olvide.</p>
            <div className="cfg26-opts">
              {EXTRAS.map((e) => (
                <button key={e.id} type="button" aria-pressed={extras.includes(e.id)} className="cfg26-opt" onClick={() => toggle(extras, setExtras, e.id)}>
                  <span className="n">{e.nombre}</span>
                  <span className="d">{e.detalle}</span>
                  <span className="p">+ {eur(e.cents)}</span>
                </button>
              ))}
            </div>
            <p className="cfg26-hint" style={{ margin: '24px 0 12px' }}>Color de la cinta</p>
            <div className="cfg26-chips">
              {CINTAS.map((c) => (
                <button key={c} type="button" aria-pressed={cinta === c} onClick={() => setCinta(c)}>{c}</button>
              ))}
            </div>
          </section>

          <section className="cfg26-step" aria-labelledby="s4">
            <h2 id="s4"><small>04</small>Cantidad</h2>
            <p className="cfg26-hint">¿Para cuántos invitados o personas?</p>
            <div className="cfg26-qty">
              <label htmlFor="cfg-qty" className="sr-only" style={{ position: 'absolute', left: -9999 }}>Número de cajas</label>
              <input
                id="cfg-qty"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
              />
              <div className="cfg26-tramos">
                {[...TRAMOS].reverse().map((t) => (
                  <span key={t.min} className={calc.pct === t.pct ? 'on' : ''}>{t.min}+ · −{t.pct}%</span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="cfg26-sum" aria-label="Resumen de tu caja">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/producto-caja-regalo-800.webp" alt="Caja regalo hecha a mano" />
          <div className="cfg26-sum-in">
            <h3>Tu caja</h3>
            <ul className="cfg26-lines">
              {calc.items.map((i) => (
                <li key={i.id}><span>{i.nombre}</span><span>{eur(i.cents)}</span></li>
              ))}
              <li><span>Cinta {cinta.toLowerCase()}</span><span>Incluida</span></li>
            </ul>
            <div className="cfg26-total" aria-live="polite">
              <span className="cfg26-unit">
                {eur(calc.unitDto)} / caja × {qty}
              </span>
              <b>{eur(calc.total)}</b>
            </div>
            {calc.pct > 0 && <span className="cfg26-save">Ahorras {eur(calc.ahorro)} con el −{calc.pct}% por cantidad</span>}
            <a className="cfg26-btn" href={contacto}>{presupuesto ? 'Pedir presupuesto' : 'Pedir esta caja'}</a>
            <a className="cfg26-btn alt" href="https://wa.me/34624324882" target="_blank" rel="noopener">Consultar por WhatsApp</a>
            <p className="cfg26-note">
              {presupuesto
                ? `Para ${MIN_PRESUPUESTO} cajas o más te enviamos presupuesto cerrado, plazos y una muestra.`
                : 'Te escribimos para confirmar el contenido y el plazo, y te enviamos el enlace de pago.'}
            </p>
            <p className="cfg26-note">Precios orientativos con IVA. Confirmamos el importe final y la disponibilidad de cada pieza antes de preparar el pedido.</p>
          </div>
        </aside>
      </div>

      <section className="cfg26-how" aria-label="Cómo funciona">
        <div><span>01</span><b>Diseñas</b><p>Configuras la caja aquí o nos cuentas la idea.</p></div>
        <div><span>02</span><b>Confirmamos</b><p>Revisamos contenido, plazos y precio final contigo.</p></div>
        <div><span>03</span><b>Montamos</b><p>Cada caja se monta y se cierra a mano en el atelier.</p></div>
        <div><span>04</span><b>Entregamos</b><p>Envío a tu casa o directamente al lugar del evento.</p></div>
      </section>
    </main>
  );
}
