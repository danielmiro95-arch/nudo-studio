/**
 * Configurador de cajas a medida — PRECIOS ORIENTATIVOS.
 * Editad aquí los importes (en céntimos) y los tramos de descuento:
 * la página /cajas-a-medida se recalcula sola.
 */
export type Opcion = { id: string; nombre: string; detalle: string; cents: number };

export const TAMANOS: (Opcion & { maxPiezas: number })[] = [
  { id: 'pequena', nombre: 'Pequeña', detalle: '15 × 15 cm · hasta 2 piezas', cents: 1200, maxPiezas: 2 },
  { id: 'mediana', nombre: 'Mediana', detalle: '22 × 22 cm · hasta 4 piezas', cents: 1800, maxPiezas: 4 },
  { id: 'grande', nombre: 'Grande', detalle: '30 × 25 cm · hasta 6 piezas', cents: 2600, maxPiezas: 6 },
];

export const PIEZAS: Opcion[] = [
  { id: 'vela', nombre: 'Vela de cera natural', detalle: 'Aroma a elegir', cents: 900 },
  { id: 'vela-mini', nombre: 'Vela mini', detalle: 'Tamaño viaje', cents: 500 },
  { id: 'flor', nombre: 'Ramillete preservado', detalle: 'Dura meses', cents: 800 },
  { id: 'dulce', nombre: 'Dulces artesanos', detalle: 'Obrador local', cents: 450 },
  { id: 'gourmet', nombre: 'Aceite o mermelada', detalle: 'Productor pequeño', cents: 650 },
  { id: 'jabon', nombre: 'Jabón artesanal', detalle: 'Con aceite de oliva', cents: 450 },
  { id: 'servilleta', nombre: 'Servilleta de lino', detalle: 'Bordado opcional', cents: 600 },
  { id: 'cava', nombre: 'Benjamín de cava', detalle: '20 cl', cents: 700 },
];

export const EXTRAS: Opcion[] = [
  { id: 'lacre', nombre: 'Lacre con iniciales', detalle: 'Sello hecho a mano', cents: 200 },
  { id: 'tarjeta', nombre: 'Tarjeta manuscrita', detalle: 'Caligrafía a mano', cents: 300 },
  { id: 'nombre', nombre: 'Etiqueta con nombre', detalle: 'Una por invitado', cents: 150 },
];

export const CINTAS = ['Crudo', 'Salvia', 'Granate', 'Negro'];

/** Descuento por cantidad (unidades mínimas → %). */
export const TRAMOS = [
  { min: 100, pct: 20 },
  { min: 50, pct: 15 },
  { min: 25, pct: 10 },
];

/** A partir de aquí se pide presupuesto en vez de comprar online. */
export const MIN_PRESUPUESTO = 25;
