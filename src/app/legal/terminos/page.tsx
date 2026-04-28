import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Condiciones generales de contratación.',
};

export default function TerminosPage() {
  return (
    <>
      <p className="meta">Términos y condiciones</p>
      <h1>Términos y condiciones de venta</h1>
      <p>
        Estas condiciones regulan la contratación de productos del atelier de
        Nudo Studio a través del sitio web nudostudio.blog.
      </p>

      <h2>1. Vendedor</h2>
      <p>
        <span className="placeholder">[NOMBRE / RAZÓN SOCIAL]</span>, con NIF{' '}
        <span className="placeholder">[NIF/CIF]</span> y domicilio en{' '}
        <span className="placeholder">[DIRECCIÓN]</span>. Email: hola@nudostudio.blog.
      </p>

      <h2>2. Productos y precios</h2>
      <p>
        Las características y precios de los productos figuran en cada ficha. Los
        precios incluyen el IVA aplicable salvo indicación expresa en contrario.
        Los gastos de envío se calculan en el checkout en función del destino.
      </p>

      <h2>3. Proceso de compra</h2>
      <p>
        Para realizar una compra, añade los productos al carrito y completa el
        proceso de pago a través de Stripe. Recibirás un email de confirmación
        con los datos del pedido.
      </p>

      <h2>4. Pago</h2>
      <p>
        El pago se realiza íntegramente a través de la pasarela segura de Stripe.
        Aceptamos las tarjetas de débito y crédito habituales (Visa, Mastercard,
        American Express) y métodos locales según país.
      </p>

      <h2>5. Envío</h2>
      <p>
        Los plazos de preparación oscilan entre 3 y 10 días laborables, salvo
        indicación expresa en cada producto (las piezas personalizadas pueden
        requerir más tiempo). El plazo de transporte depende del destino.
      </p>

      <h2>6. Derecho de desistimiento</h2>
      <p>
        Tienes derecho a desistir del contrato en un plazo de 14 días naturales
        sin necesidad de justificación, conforme al artículo 102 del TRLGDCU.
      </p>
      <p>
        Para ejercer este derecho, escribe a hola@nudostudio.blog indicando tu
        decisión. Los gastos de devolución correrán a tu cargo salvo que el
        producto presente defectos. Reembolsaremos el importe en el plazo de 14
        días desde la recepción del producto en buen estado.
      </p>
      <p>
        <strong>Excepción:</strong> los productos personalizados (con monograma,
        nombre o configuración a medida) están excluidos del derecho de
        desistimiento, conforme al artículo 103.c del TRLGDCU.
      </p>

      <h2>7. Garantía</h2>
      <p>
        Todos los productos cuentan con la garantía legal de tres años para faltas
        de conformidad. Si recibes una pieza defectuosa, contáctanos en un plazo
        razonable y la repondremos o reembolsaremos.
      </p>

      <h2>8. Resolución de conflictos</h2>
      <p>
        En caso de controversia, puedes acudir a la plataforma europea de
        resolución de litigios en línea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
      </p>

      <p style={{ marginTop: 48, fontSize: 13, color: '#8a857d' }}>
        Última actualización: <span className="placeholder">[FECHA]</span>.
      </p>
    </>
  );
}
