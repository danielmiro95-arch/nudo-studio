# Nudo Studio — Sitio web

Estudio de eventos íntimos y atelier de regalos a mano. **Madrid · La Habana**.

Stack: **Next.js 15 (App Router) + TypeScript** desplegado en **Vercel**. Email vía **Resend**, asistente IA vía **Anthropic Claude**, pagos vía **Stripe** (desactivados por defecto).

---

## Índice

1. [Estado actual](#estado-actual)
2. [Primera vez: setup local](#primera-vez-setup-local)
3. [Variables de entorno](#variables-de-entorno)
4. [Despliegue en Vercel](#despliegue-en-vercel)
5. [Configurar Resend (emails)](#configurar-resend-emails)
6. [Configurar el asistente IA](#configurar-el-asistente-ia)
7. [Activar la tienda real (Stripe)](#activar-la-tienda-real-stripe)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Trabajo pendiente](#trabajo-pendiente)

---

## Estado actual

### Funciona ya, sin tocar nada
- ✅ Las 12 páginas del sitio renderizan con el diseño Aura completo
- ✅ Hero animado tipo Revolut en el home
- ✅ Galería, servicios, sobre nosotros, blog, FAQ, testimonios
- ✅ Páginas legales (Aviso, Privacidad, Cookies, Términos) — con huecos para tus datos
- ✅ 404 personalizado, sitemap dinámico, robots.txt
- ✅ Redirecciones desde URLs antiguas (`bodas.html`, `eventos.html`, etc.)

### Funciona en cuanto pongas las claves
- 🟡 **Formulario de contacto** → necesita `RESEND_API_KEY` + dominio verificado en Resend
- 🟡 **Asistente IA** → necesita `ANTHROPIC_API_KEY`

### Listo pero desactivado a propósito
- ⏸️ **Tienda con pagos reales** → necesita `ENABLE_SHOP=true` + claves Stripe + alta de autónomo. Mientras esté apagada, el botón "Comprar" se convierte en "Consultar disponibilidad" y abre un email a tu bandeja.

---

## Primera vez: setup local

```bash
# 1. Instala dependencias (la primera vez tarda ~2 min)
npm install

# 2. Copia las variables de entorno
cp .env.example .env.local
# Edita .env.local con tus claves reales (al menos RESEND_API_KEY y ANTHROPIC_API_KEY)

# 3. Arranca el servidor de desarrollo
npm run dev
```

Abre <http://localhost:3000>. Cualquier cambio que hagas en `src/` se recarga al instante.

---

## Variables de entorno

Todas las claves van en `.env.local` (en local) y en **Vercel → Project → Settings → Environment Variables** (en producción).

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `RESEND_API_KEY` | Sí (formulario) | Empieza por `re_…`. Saca de [resend.com/api-keys](https://resend.com/api-keys) |
| `CONTACT_EMAIL_TO` | Sí | Tu email donde recibes los formularios. Ej: `hola@nudostudio.blog` |
| `CONTACT_EMAIL_FROM` | Sí | Remitente verificado. Ej: `"Nudo Studio <web@nudostudio.blog>"` |
| `ANTHROPIC_API_KEY` | Sí (asistente) | Empieza por `sk-ant-…`. Saca de [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `ANTHROPIC_MODEL` | No | Por defecto `claude-sonnet-4-6`. Cambia a `claude-haiku-4-5-20251001` si quieres ahorrar |
| `ASSISTANT_RATE_LIMIT_PER_DAY` | No | Mensajes/día por IP. Por defecto 20 |
| `ENABLE_SHOP` | No | `true` para activar pagos. Por defecto `false` |
| `STRIPE_SECRET_KEY` | Solo si tienda activa | Empieza por `sk_test_…` o `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Solo si tienda activa | Empieza por `pk_test_…` o `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | Solo si tienda activa | Empieza por `whsec_…` |
| `NEXT_PUBLIC_SITE_URL` | Sí en prod | `https://nudostudio.blog` |
| `NEXT_PUBLIC_SITE_NAME` | No | Por defecto "Nudo Studio" |

---

## Despliegue en Vercel

Esto es lo que hace que tu sitio esté online y se actualice cada vez que haces `git push`.

1. **Sube este código a un repo de GitHub** (puedes usar el actual `ai-nudo-studio` machacándolo, o uno nuevo `nudo-studio`).
2. Entra en [vercel.com](https://vercel.com) → "Add New Project" → conecta tu cuenta de GitHub → elige el repo.
3. Vercel detecta Next.js automáticamente. **No cambies nada del build**.
4. **Antes de "Deploy", añade las variables de entorno** (al menos `NEXT_PUBLIC_SITE_URL`). Las otras se pueden añadir después.
5. Pulsa "Deploy". En 60-90 segundos tu sitio estará en una URL del tipo `nudo-studio-xyz.vercel.app`.
6. **Conectar tu dominio:**
   - Vercel → Project → Settings → Domains → Add Domain → `nudostudio.blog`
   - Te dará 2 nameservers (algo como `ns1.vercel-dns.com`)
   - Entra en Porkbun → tu dominio → Authoritative Nameservers → pega los de Vercel
   - Espera 5-30 min a que propague. Vercel te avisará cuando esté listo y emitirá el certificado SSL automáticamente.

A partir de ese momento, cada `git push origin main` redespliega el sitio en ~60s.

---

## Configurar Resend (emails)

Resend envía los emails del formulario de contacto a tu bandeja.

1. Crea cuenta gratuita en [resend.com/signup](https://resend.com/signup).
2. **Verifica tu dominio:** Domains → Add Domain → `nudostudio.blog`.
3. Resend te dará 3 registros DNS (TXT y MX) para añadir.
4. Entra en Porkbun → DNS Records → añade los 3 registros tal cual.
5. Vuelve a Resend y pulsa "Verify". Tarda de 5 min a 1h.
6. Una vez verificado, ve a API Keys → Create API Key → cópiala (empieza por `re_…`).
7. **Añádela a Vercel:** Settings → Environment Variables → `RESEND_API_KEY` = `re_…`.
8. Añade también `CONTACT_EMAIL_TO` (tu email) y `CONTACT_EMAIL_FROM` (`"Nudo Studio <web@nudostudio.blog>"`).
9. Vercel → Deployments → Redeploy (las envs nuevas no se aplican hasta el siguiente deploy).

**Plan gratuito de Resend:** 3.000 emails/mes, 100/día. Más que de sobra.

---

## Configurar el asistente IA

El asistente conecta el chat de `/asistente` con Claude.

1. Crea cuenta en [console.anthropic.com](https://console.anthropic.com).
2. Ve a Plans & Billing → Add Credit → mete **5€** para empezar (con eso te da para varias miles de conversaciones).
3. Ve a API Keys → Create Key → cópiala (empieza por `sk-ant-…`).
4. **Añádela a Vercel:** `ANTHROPIC_API_KEY` = `sk-ant-…`.
5. Redeploy.

**Coste estimado por conversación de ~10 mensajes:** entre 0,01€ y 0,03€ con Sonnet 4.6, o ~0,003€ con Haiku 4.5.

**Protección anti-abuso:** el endpoint limita a 20 mensajes/IP/día por defecto (`ASSISTANT_RATE_LIMIT_PER_DAY`). Si quieres ser más restrictivo, baja a 10 o 5.

⚠️ **El asistente IA no recuerda conversaciones anteriores.** Cada vez que un usuario abre el chat empieza desde cero. Si en el futuro quieres que recuerde, hace falta añadir una base de datos.

---

## Activar la tienda real (Stripe)

**Requisito legal:** debes estar dado de alta como autónomo o tener empresa con CIF en regla. Si no, NO actives la tienda; vende por DM o email mientras te das de alta.

### 1. Stripe — cuenta y verificación

1. Crea cuenta en [stripe.com](https://stripe.com).
2. Completa el "Activate account": NIF/CIF, dirección, IBAN bancario, etc. Stripe puede tardar de 10 min a 2 días en aprobar.
3. Mientras espera la aprobación, trabaja en **modo test** (claves `sk_test_…` y `pk_test_…`).

### 2. Crear los productos en Stripe

Por cada producto del catálogo (`src/data/products.ts`):

1. Stripe Dashboard → Products → Add Product → mismo nombre y precio que en `products.ts`.
2. Copia el **Price ID** (`price_…`) y pégalo en `stripePriceId` del producto correspondiente.

### 3. Configurar el webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://nudostudio.blog/api/stripe-webhook`.
3. Events to send: marca `checkout.session.completed`.
4. Crea el endpoint y copia el **Signing secret** (empieza por `whsec_…`).

### 4. Variables en Vercel

Añade y redeploy:
```
ENABLE_SHOP=true
STRIPE_SECRET_KEY=sk_test_…  (o sk_live_… cuando estés listo)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…
```

### 5. Probar en modo test

Stripe te da números de tarjeta de prueba (`4242 4242 4242 4242`, fecha futura, CVC cualquiera). Haz una compra de prueba completa y verifica que:
- Stripe redirige al checkout
- El webhook llega (Stripe Dashboard → Webhooks → tu endpoint → Events)
- Te llegan los dos emails (al estudio y al cliente)

### 6. Pasar a vivo

Una vez Stripe te apruebe la cuenta, sustituye `sk_test_…` por `sk_live_…` y `pk_test_…` por `pk_live_…`. **Crea un nuevo webhook con la URL `live`** (Stripe distingue entre webhook de test y de live).

---

## Estructura del proyecto

```
nudo-studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Layout root con metadatos y fonts
│   │   ├── globals.css             ← Importa /public/assets/styles.css
│   │   ├── page.tsx                ← Home (con hero animado)
│   │   ├── not-found.tsx           ← 404
│   │   ├── robots.ts               ← /robots.txt dinámico
│   │   ├── sitemap.ts              ← /sitemap.xml dinámico
│   │   ├── servicios/page.tsx
│   │   ├── galeria/page.tsx
│   │   ├── tienda/page.tsx
│   │   ├── producto/[slug]/page.tsx
│   │   ├── carrito/page.tsx
│   │   ├── asistente/page.tsx
│   │   ├── sobre-nosotros/page.tsx
│   │   ├── contacto/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── testimonios/page.tsx
│   │   ├── legal/
│   │   │   ├── layout.tsx
│   │   │   ├── aviso-legal/page.tsx
│   │   │   ├── privacidad/page.tsx
│   │   │   ├── cookies/page.tsx
│   │   │   └── terminos/page.tsx
│   │   └── api/
│   │       ├── contact/route.ts        ← POST: enviar formulario
│   │       ├── asistente/route.ts      ← POST: chatear con Claude
│   │       ├── checkout/route.ts       ← POST: iniciar pago Stripe
│   │       └── stripe-webhook/route.ts ← Notificaciones de Stripe
│   ├── components/                  ← Por ahora vacío (se irán añadiendo)
│   ├── lib/
│   │   ├── legacy-html.ts           ← Lee HTMLs de /legacy-pages
│   │   └── rate-limit.ts            ← Rate limiter en memoria
│   └── data/
│       └── products.ts              ← Catálogo del atelier
│
├── legacy-pages/                    ← HTML del diseño Stitch (fuente de verdad del markup)
│   ├── index.html
│   ├── servicios.html
│   ├── galeria.html
│   ├── tienda.html
│   ├── producto.html
│   ├── carrito.html
│   ├── asistente.html
│   ├── sobre-nosotros.html
│   ├── contacto.html
│   ├── blog.html
│   ├── faq.html
│   └── testimonios.html
│
├── public/
│   └── assets/                      ← CSS, JS, imágenes
│       ├── styles.css
│       ├── chrome.js
│       ├── hero-revolut.js
│       ├── logo-*.png
│       └── photo-*.jpg
│
├── next.config.mjs
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md (este archivo)
```

### ¿Por qué `/legacy-pages/`?

Es una decisión deliberada para mantener el HTML del diseño Aura como única fuente de verdad y no tener que reescribir 12 archivos en JSX. La función `readLegacyBody()` en `src/lib/legacy-html.ts` lee el HTML, ajusta las rutas de assets y los enlaces internos, y lo inyecta en la página. Así puedes editar el HTML directamente cuando quieras retocar el diseño.

Cuando una página necesite **interactividad real** (carrito persistente, validación de formularios en cliente, etc.), se convertirá a JSX puro.

---

## Trabajo pendiente

### Crítico antes de pasar a producción
- [ ] Rellenar todos los `[PLACEHOLDER]` en las páginas legales con datos fiscales reales.
- [ ] Verificar el dominio en Resend.
- [ ] Conectar el formulario de `/contacto` con `/api/contact` (frontend JS).
- [ ] Conectar el chat de `/asistente` con `/api/asistente` (frontend JS).
- [ ] Banner de cookies (aunque ahora mismo no usamos analíticas, conviene tenerlo listo).

### Mejoras del diseño (cuando subas las fotos reales)
- [ ] Sustituir placeholders del atelier en `tienda.html` por fotos de producto reales.
- [ ] Sustituir avatares de testimonios.
- [ ] Foto del equipo en `sobre-nosotros.html`.
- [ ] Sustituir el logo placeholder por el logo final.

### Tienda
- [ ] Crear los productos en Stripe y rellenar `stripePriceId` en `src/data/products.ts`.
- [ ] Migrar `producto/[slug]` a una página dinámica que lea de `products.ts`.
- [ ] Carrito persistente con `localStorage`.

---

## Ayuda y soporte

Cualquier duda con este proyecto, abre un issue en el repo o contacta con el desarrollador.

© 2026 Nudo Studio · Madrid — La Habana
