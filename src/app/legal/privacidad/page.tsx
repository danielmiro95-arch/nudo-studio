import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo tratamos tus datos personales.',
};

export default function PrivacidadPage() {
  return (
    <>
      <p className="meta">Privacidad</p>
      <h1>Política de privacidad</h1>
      <p>
        En Nudo Studio respetamos tu privacidad. Esta política explica qué datos
        personales recopilamos, con qué finalidad, durante cuánto tiempo y qué
        derechos tienes en virtud del Reglamento (UE) 2016/679 (RGPD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>Identidad: <span className="placeholder">[NOMBRE / RAZÓN SOCIAL]</span></li>
        <li>NIF / CIF: <span className="placeholder">[NIF/CIF]</span></li>
        <li>Dirección: <span className="placeholder">[DIRECCIÓN POSTAL]</span></li>
        <li>Email: hola@nudostudio.blog</li>
      </ul>

      <h2>2. Datos que recopilamos</h2>
      <p>Solo recopilamos los datos que tú nos das voluntariamente:</p>
      <ul>
        <li><strong>Formulario de contacto:</strong> nombre, email, teléfono (opcional), servicio de interés, fecha aproximada y mensaje.</li>
        <li><strong>Tienda:</strong> dirección de envío, email y datos de facturación necesarios para gestionar el pedido. El pago se procesa íntegramente a través de Stripe; nosotros no almacenamos datos bancarios.</li>
        <li><strong>Asistente IA:</strong> los mensajes que envías al asistente se procesan a través de la API de Anthropic. No los almacenamos en nuestra base de datos. Anthropic conserva los datos según su propia política.</li>
      </ul>

      <h2>3. Finalidad y base legal</h2>
      <ul>
        <li>Atender tu consulta — base legal: consentimiento.</li>
        <li>Gestionar pedidos del atelier — base legal: ejecución de contrato.</li>
        <li>Cumplir obligaciones fiscales y contables — base legal: obligación legal.</li>
      </ul>

      <h2>4. Encargados del tratamiento</h2>
      <p>
        Compartimos datos estrictamente necesarios con terceros que nos prestan
        servicios:
      </p>
      <ul>
        <li>Resend Inc. (envío de emails transaccionales)</li>
        <li>Anthropic, PBC (asistente IA)</li>
        <li>Stripe Payments Europe Ltd. (pasarela de pago)</li>
        <li>Vercel Inc. (hosting)</li>
      </ul>

      <h2>5. Plazo de conservación</h2>
      <p>
        Conservamos tus datos durante el tiempo necesario para la finalidad para
        la que se recogieron y, en su caso, durante los plazos legales aplicables
        (mercantil y fiscal).
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer en cualquier momento tus derechos de acceso, rectificación,
        supresión, oposición, limitación y portabilidad escribiendo a
        hola@nudostudio.blog. Si crees que hemos infringido la normativa, puedes
        presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos</a>.
      </p>

      <p style={{ marginTop: 48, fontSize: 13, color: '#8a857d' }}>
        Última actualización: <span className="placeholder">[FECHA]</span>.
      </p>
    </>
  );
}
