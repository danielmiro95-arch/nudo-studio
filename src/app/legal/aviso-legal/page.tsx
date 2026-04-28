import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso legal',
  description: 'Información legal sobre el titular del sitio web.',
};

export default function AvisoLegalPage() {
  return (
    <>
      <p className="meta">Aviso legal</p>
      <h1>Aviso legal</h1>
      <p>
        En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan
        a continuación los datos identificativos del titular de este sitio web.
      </p>

      <h2>1. Titularidad</h2>
      <ul>
        <li>Titular: <span className="placeholder">[NOMBRE COMPLETO o RAZÓN SOCIAL]</span></li>
        <li>NIF / CIF: <span className="placeholder">[NIF/CIF]</span></li>
        <li>Domicilio: <span className="placeholder">[DIRECCIÓN POSTAL COMPLETA]</span></li>
        <li>Email: <span className="placeholder">hola@nudostudio.blog</span></li>
        <li>Teléfono: <span className="placeholder">[TELÉFONO DE CONTACTO]</span></li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El sitio web nudostudio.blog tiene por objeto la difusión de información
        sobre los servicios de diseño y producción de eventos, así como la venta
        de productos del atelier propio.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso a este sitio implica la aceptación de las presentes condiciones.
        El usuario se compromete a hacer un uso adecuado de los contenidos y servicios
        ofrecidos, y a no emplearlos para incurrir en actividades ilícitas.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Todos los contenidos del sitio (textos, fotografías, diseños, logos, código)
        son propiedad de <span className="placeholder">[NOMBRE]</span> o de sus
        respectivos autores y se encuentran protegidos por la legislación vigente
        en materia de propiedad intelectual e industrial.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        El titular no se hace responsable de los daños o perjuicios que pudieran
        derivarse del uso de la información contenida en este sitio.
      </p>

      <h2>6. Legislación aplicable</h2>
      <p>
        Las presentes condiciones se rigen por la legislación española.
      </p>

      <p style={{ marginTop: 48, fontSize: 13, color: '#8a857d' }}>
        Última actualización: <span className="placeholder">[FECHA]</span>.
      </p>
    </>
  );
}
