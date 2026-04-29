/**
 * Catálogo de productos del atelier.
 *
 * Por ahora vive como módulo TypeScript: editable directamente, sin DB.
 * Cuando crezca, migrar a una DB (Sanity, Notion API, Postgres) sin
 * cambiar la interfaz `Product`.
 *
 * Cada producto tiene:
 *  - slug:        URL (/producto/{slug})
 *  - priceCents:  precio en céntimos para evitar floats (€1 = 100)
 *  - stripePriceId: rellénalo cuando crees el producto en Stripe (puede
 *                   quedar undefined hasta que actives la tienda)
 */

export interface Product {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  priceCents: number;
  currency: 'EUR';
  images: string[];
  available: boolean;
  category: 'caja' | 'vela' | 'ramo' | 'papeleria' | 'decoracion';
  /** Stripe Price ID (price_…). Vacío hasta que se cree en Stripe. */
  stripePriceId?: string;
  /** ¿Personalizable? Sirve para mostrar campos extra en producto. */
  customizable?: boolean;
}

export const products: Product[] = [
  {
    slug: 'caja-antigua',
    name: 'Caja Antigua',
    shortDescription: 'Cajita de regalo con sello de lacre y papelería personalizable.',
    longDescription:
      'Una pieza pensada como primer gesto: caja en cartón natural, papel seda, lacre con monograma y un manuscrito a tinta sobre papel hecho a mano. Personalizable con iniciales y mensaje breve.',
    priceCents: 2250,
    currency: 'EUR',
    images: ['/assets/producto-caja-regalo.jpg'],
    available: true,
    category: 'caja',
    customizable: true,
  },
  {
    slug: 'vela-velvet',
    name: 'Vela Velvet · No. 4',
    shortDescription: 'Vela de cera de soja con mecha de algodón.',
    longDescription:
      'Notas medias a higo y cedro. Colada en pequeño lote en el atelier de Madrid. Aproximadamente 40 horas de combustión.',
    priceCents: 1200,
    currency: 'EUR',
    images: ['/assets/producto-vela-ambar.jpg'],
    available: true,
    category: 'vela',
  },
  {
    slug: 'ramo-conservado',
    name: 'Ramo Conservado',
    shortDescription: 'Ramo de flores y vegetal preservado, hecho a mano.',
    longDescription:
      'Composición de flores y verde preservado que mantiene la frescura visual sin necesidad de agua. Pensada para durar meses como objeto decorativo o como regalo. Cada ramo es único.',
    priceCents: 3250,
    currency: 'EUR',
    images: ['/assets/producto-ramo-conservado.jpg'],
    available: true,
    category: 'ramo',
  },
  {
    slug: 'jarron-trinidad',
    name: 'Jarrón Trinidad',
    shortDescription: 'Jarrón cerámico torneado, acabado mate en tono crudo.',
    longDescription:
      'Pieza de cerámica torneada a mano con acabado mate en tono natural. Líneas suaves, base estable. Funciona tanto con un ramo suelto como vacío, en repisa o mesa.',
    priceCents: 4250,
    currency: 'EUR',
    images: ['/assets/producto-jarron-trinidad.jpg'],
    available: true,
    category: 'decoracion',
  },
  {
    slug: 'mantel-lino',
    name: 'Mantel de Lino',
    shortDescription: 'Mantel de lino lavado, color crudo.',
    longDescription:
      'Lino pesado en tono crudo natural, ideal para mesas largas. Lavable a 30°. Disponible en varios largos para mesas de 6, 8 y 10 comensales.',
    priceCents: 6000,
    currency: 'EUR',
    images: ['/assets/producto-mantel-lino.jpg'],
    available: true,
    category: 'decoracion',
  },
  {
    slug: 'servilleta-lino',
    name: 'Servilletas de Lino · Set de 6',
    shortDescription: 'Set de seis servilletas de lino lavado, tono crudo.',
    longDescription:
      'Seis servilletas de lino lavado en tono crudo natural. Lavables a 30°. Combinan tanto con mantelería rústica como con vajilla más formal.',
    priceCents: 3000,
    currency: 'EUR',
    images: ['/assets/producto-servilleta-lino.jpg'],
    available: true,
    category: 'decoracion',
  },
  {
    slug: 'sellos',
    name: 'Sellos de Lacre',
    shortDescription: 'Sellos de lacre con monograma personalizable.',
    longDescription:
      'Sellos de lacre con monograma a elegir. Disponibles en colores tradicionales (granate, crudo, negro). Pensados para sobres, cajas y papelería de evento.',
    priceCents: 900,
    currency: 'EUR',
    images: ['/assets/producto-sellos.jpg'],
    available: true,
    category: 'papeleria',
    customizable: true,
  },
  {
    slug: 'set-papel',
    name: 'Set de Papelería',
    shortDescription: 'Hojas y sobres en papel hecho a mano.',
    longDescription:
      'Set de papelería en papel hecho a mano, tono crudo, textura ligera. Pensado para escritura a mano o impresión bajo demanda en pequeño formato.',
    priceCents: 1400,
    currency: 'EUR',
    images: ['/assets/producto-set-papel.jpg'],
    available: true,
    category: 'papeleria',
  },
];

export function getProductBySlug(slug: string): Product | null {
  return products.find((p) => p.slug === slug) ?? null;
}

export function getAvailableProducts(): Product[] {
  return products.filter((p) => p.available);
}
