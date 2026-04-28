import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Lee un HTML legacy del directorio /legacy-pages y devuelve dos cosas:
 *  - body: el contenido entre <body>...</body>, sanitizado.
 *  - styles: el CSS inline que vivía en <style> dentro del <head>.
 *
 * El home (index.html) define la animación del hero en un <style> en el
 * head, así que no podemos descartarlo.
 *
 * NOTA: solo usar en Server Components (lee del filesystem). Es seguro
 * porque el contenido es estático y de confianza (escrito por nosotros).
 */
export interface LegacyPage {
  body: string;
  styles: string;
}

export async function readLegacyPage(filename: string): Promise<LegacyPage> {
  const filepath = path.join(process.cwd(), 'legacy-pages', filename);
  const raw = await fs.readFile(filepath, 'utf8');

  // Extract <head>...</head>
  const headMatch = raw.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  let styles = '';
  if (headMatch) {
    // Pull all <style>...</style> blocks
    const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let m;
    while ((m = re.exec(headMatch[1])) !== null) {
      styles += m[1] + '\n';
    }
  }

  // Extract <body>...</body>
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    throw new Error(`No <body> tag found in ${filename}`);
  }
  let body = bodyMatch[1];

  // Strip ALL <script> tags. The legacy HTML includes inline JS that
  // simulates the chat / form locally (that's the "demo" behaviour).
  // The real Next.js page loads /assets/chrome.js (in layout) and
  // /assets/forms.js or /assets/hero-revolut.js (per page) via the
  // <Script> component, so legacy <script> tags are noise here.
  // (Note: dangerouslySetInnerHTML doesn't execute script tags anyway,
  //  but stripping them keeps the HTML clean and avoids accidental
  //  re-introduction if we ever switch to a parser-based renderer.)
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Re-write asset paths: "assets/foo.jpg" -> "/assets/foo.jpg"
  body = body.replace(/(["'(])assets\//g, '$1/assets/');

  // Re-write internal HTML links to clean Next.js routes:
  //   "index.html" -> "/"
  //   "servicios.html"        -> "/servicios"
  //   "servicios.html#bodas"  -> "/servicios#bodas"
  body = body.replace(/(href|action)="([a-z][a-z0-9-]*)\.html(#[a-z0-9-]+)?"/gi, (_match, attr, page, hash = '') => {
    const route = page === 'index' ? '/' : `/${page}`;
    return `${attr}="${route}${hash}"`;
  });

  return { body, styles };
}

/**
 * Versión simplificada para retrocompat — devuelve sólo el body.
 * Útil para páginas que no tienen <style> propio en el head.
 */
export async function readLegacyBody(filename: string): Promise<string> {
  const { body } = await readLegacyPage(filename);
  return body;
}
