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
    priceCents: 4500,
    currency: 'EUR',
    images: ['/assets/photo-regalos.jpg'],
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
    priceCents: 2400,
    currency: 'EUR',
    images: ['/assets/photo-detalle.jpg'],
    available: true,
    category: 'vela',
  },
  // Añade más productos aquí…
];

export function getProductBySlug(slug: string): Product | null {
  return products.find((p) => p.slug === slug) ?? null;
}

export function getAvailableProducts(): Product[] {
  return products.filter((p) => p.available);
}
