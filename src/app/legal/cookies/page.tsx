import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Información sobre el uso de cookies en este sitio.',
};

export default function CookiesPage() {
  return (
    <>
      <p className="meta">Cookies</p>
      <h1>Política de cookies</h1>
      <p>
        Este sitio utiliza el mínimo de cookies posible. A día de hoy:
      </p>
      <ul>
        <li>
          <strong>Cookies técnicas (estrictamente necesarias):</strong> imprescindibles para
          que el sitio funcione (mantener tu carrito, recordar idioma…). Están
          exentas del consentimiento previo.
        </li>
        <li>
          <strong>Cookies analíticas:</strong> actualmente <strong>no usamos</strong> servicios
          de analítica web. Si en el futuro los añadimos (p. ej. Plausible o
          Google Analytics), actualizaremos esta política y solicitaremos tu
          consentimiento previo a través del banner.
        </li>
        <li>
          <strong>Cookies de terceros:</strong> Stripe puede instalar cookies durante el
          proceso de pago para prevenir fraude, en la página de checkout
          alojada por ellos.
        </li>
      </ul>

      <h2>Cómo gestionarlas</h2>
      <p>
        Puedes configurar tu navegador para bloquear o eliminar las cookies en
        cualquier momento. Ten en cuenta que bloquear las cookies técnicas
        impedirá el correcto funcionamiento del sitio.
      </p>

      <p style={{ marginTop: 48, fontSize: 13, color: '#8a857d' }}>
        Última actualización: <span className="placeholder">[FECHA]</span>.
      </p>
    </>
  );
}
