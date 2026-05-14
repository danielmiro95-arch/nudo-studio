# Stack · plataformas y cuentas de Nudo Studio

Documento de referencia. Aquí está todo lo que hay que saber para no olvidarse
de qué cuenta es qué, para qué sirve, dónde están las claves y cuánto cuesta.

> Última actualización: 14 mayo 2026
> Dominio en producción: **https://nudostudio.blog**

---

## Resumen rápido

| Servicio       | Para qué                             | Plan       | Estado          | Cuenta del proyecto |
|----------------|--------------------------------------|------------|-----------------|---------------------|
| GitHub         | Código fuente del proyecto           | Free       | ✅ Activo       | `danielmiro95-arch` |
| Vercel         | Hosting + deploys + env vars         | Hobby/Free | ✅ Activo       | Vinculado a GitHub  |
| Supabase       | Auth + base de datos (Postgres)      | Free       | ✅ Activo       | Creada hoy          |
| Anthropic      | Asistente IA del sitio (Claude)      | Pay-as-you-go | 🟡 No configurado | Falta API key   |
| Resend         | Emails transaccionales               | Free 3k/mes | 🟡 No configurado | Falta API key   |
| Stripe         | Pagos de tienda                       | Pay-per-tx | 🟡 Gated         | Falta API key + activar `ENABLE_SHOP=true` |
| Google Fonts   | Tipografías (Inter, Cormorant, Mono) | Free       | ✅ Activo       | No requiere cuenta  |
| Cloudflare / Namecheap / GoDaddy | DNS del dominio nudostudio.blog | Depende | ✅ Activo (donde sea) | Donde lo compraste |

Leyenda · ✅ funcionando · 🟡 código listo pero falta dar de alta o pegar claves · ❌ roto.

---

## GitHub · código fuente

- **Para qué**: aloja el código del proyecto. Cada `git push origin main` dispara
  un deploy automático en Vercel.
- **Repo**: `danielmiro95-arch/nudo-studio` (ver `git remote -v` para confirmar).
- **Cuenta**: tu usuario `danielmiro95-arch`.
- **Coste**: 0 € (repos públicos o privados gratis con Free plan).
- **Notas**:
  - Branch principal: `main`. Lo que esté ahí se despliega.
  - `.env.local` está en `.gitignore` — las claves nunca llegan a GitHub.

---

## Vercel · hosting + deploys

- **Para qué**: aloja el sitio web Next.js, sirve los assets estáticos, ejecuta
  las API routes (`/api/*`) como serverless functions, y guarda las variables
  de entorno de producción.
- **URL de producción**: https://nudostudio.blog
- **Dashboard**: https://vercel.com/dashboard (entra con la misma cuenta que GitHub).
- **Coste**: Hobby plan **0 €** mientras el tráfico sea moderado.
- **Cómo se actualiza**: automático en cada push a `main` en GitHub.

### Env vars que tienes que tener en Vercel
Settings → Environment Variables. Las mismas que en `.env.local` (excepto que
las de Stripe/Resend/Anthropic ahora están con `REPLACE_ME` placeholder —
cuando configures cada servicio real, sustituye en ambos sitios):

| Name | Donde se usa |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Metadatos SEO + magic links de Supabase |
| `NEXT_PUBLIC_SITE_NAME` | Título de pestaña + metadatos |
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente Supabase (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase (publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente admin Supabase (server-only) |
| `ANTHROPIC_API_KEY` | `/api/asistente` — llama a Claude |
| `ANTHROPIC_MODEL` | Modelo a usar (default `claude-sonnet-4-6`) |
| `ASSISTANT_RATE_LIMIT_PER_DAY` | Tope diario de mensajes por IP (default 20) |
| `RESEND_API_KEY` | `/api/contact` — envía emails al estudio |
| `CONTACT_EMAIL_TO` | A dónde llegan los emails del form |
| `CONTACT_EMAIL_FROM` | From: del email (debe coincidir con dominio verificado en Resend) |
| `ENABLE_SHOP` | `false` por defecto. A `true` activa el checkout Stripe real. |
| `STRIPE_SECRET_KEY` | Stripe server key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client key |
| `STRIPE_WEBHOOK_SECRET` | Verifica firma de webhook Stripe |

---

## Supabase · auth + base de datos

- **Para qué**:
  - Auth (registro, login, reset contraseña por email).
  - Postgres DB para guardar perfiles, carritos persistentes, pedidos.
  - RLS (Row-Level Security) — cada usuario solo ve sus filas.
- **Dashboard**: https://supabase.com/dashboard → proyecto `nudo-studio`.
- **URL del proyecto**: `https://vztqkraueexukvwwjstf.supabase.co`
- **Coste**: Free 50.000 usuarios activos/mes + 500 MB DB + 3.000 emails de auth/mes.
- **Schema**: ver `supabase/schema.sql`. Tablas:
  - `profiles` (1:1 con `auth.users`)
  - `cart_items` (carrito persistente)
  - `orders` (pedidos completados)
  - `order_items` (items dentro de cada pedido)

### Dónde están las claves en el dashboard
Settings → API:
- **Project URL** → env `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key (`sb_publishable_...`) → env `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key (`sb_secret_...`) → env `SUPABASE_SERVICE_ROLE_KEY`

### Auth — settings importantes
Authentication → Providers → Email:
- **Confirm email**: si está activado, los usuarios reciben email de confirmación
  antes de poder loguearse. Recomendado **on** en producción real, **off** mientras
  testees.

### Si rotas las claves (security)
1. Supabase Dashboard → Settings → API → "Roll" en la key que quieras rotar.
2. Actualiza `.env.local` con la nueva.
3. Actualiza Vercel Settings → Environment Variables con la nueva.
4. Vercel auto-redeploy.

---

## Anthropic · asistente IA (Claude)

- **Para qué**: el chat flotante (FAB) y la página `/asistente`. La API route
  `/api/asistente` reenvía la conversación a Claude usando el SDK oficial.
- **Dashboard**: https://console.anthropic.com
- **Coste**: pay-as-you-go por tokens consumidos. Aprox 0,003 € por mensaje
  largo. Con un límite de 20 mensajes/IP/día (configurable en
  `ASSISTANT_RATE_LIMIT_PER_DAY`).
- **Estado actual**: 🟡 **`ANTHROPIC_API_KEY` está como `REPLACE_ME`**. El
  asistente da error 503 hasta que pegues una API key real.

### Cómo activarlo
1. Crea cuenta en https://console.anthropic.com.
2. Settings → API Keys → "Create Key" → copia (empieza por `sk-ant-`).
3. Pega en `.env.local` (line `ANTHROPIC_API_KEY=`) Y en Vercel env vars.
4. (Opcional) Añade crédito a tu cuenta — por defecto Anthropic da $5 free.

### Personalizar el carácter del asistente
Editar la constante `SYSTEM_PROMPT` en `src/app/api/asistente/route.ts`.

---

## Resend · emails transaccionales

- **Para qué**: enviar los emails del formulario de `/contacto` al estudio.
  `/api/contact` recibe el form y manda un email con los datos.
- **Dashboard**: https://resend.com
- **Coste**: Free 3.000 emails/mes + 100/día.
- **Estado actual**: 🟡 **`RESEND_API_KEY` está como `REPLACE_ME`**. El form
  del contacto guarda los datos pero no manda email hasta configurarlo.

### Cómo activarlo
1. Crea cuenta en https://resend.com.
2. Domains → "Add Domain" → `nudostudio.blog` → seguir instrucciones para
   añadir registros DNS (SPF, DKIM, DMARC) en tu registrar de dominio.
3. Una vez verificado, API Keys → "Create" → copia.
4. Pega en `.env.local` (`RESEND_API_KEY=`) y en Vercel env vars.
5. `CONTACT_EMAIL_FROM` debe usar el dominio verificado (ej. `web@nudostudio.blog`).
6. `CONTACT_EMAIL_TO` es a dónde llegan los mensajes (tu email personal).

---

## Stripe · pagos (gated)

- **Para qué**: cobrar pedidos de la tienda online. Métodos: tarjeta, Apple Pay,
  Google Pay, PayPal, Klarna (todos via Stripe).
- **Dashboard**: https://dashboard.stripe.com
- **Coste**: 1,4 % + 0,25 € por transacción europea. 0 € fijos al mes.
- **Estado actual**: 🟡 **Gated detrás de `ENABLE_SHOP=false`**. Las API keys
  están como `REPLACE_ME`. La UI del checkout y la lógica de pago están
  montadas pero al pulsar "Pagar" solo se crea un order con status `pending`
  en Supabase — **no se cobra dinero todavía**.

### Cómo activarlo
1. Crea cuenta en https://dashboard.stripe.com.
2. Activa el modo test mientras pruebas.
3. Developers → API Keys → copia "Publishable key" (`pk_test_…`) y "Secret key"
   (`sk_test_…`).
4. Pega en `.env.local` y Vercel:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
5. Crea un webhook: Developers → Webhooks → "Add endpoint" →
   URL `https://nudostudio.blog/api/stripe-webhook` → events
   `checkout.session.completed`, `payment_intent.succeeded`. Copia el signing
   secret → `STRIPE_WEBHOOK_SECRET`.
6. Activa los métodos de pago que quieras (Apple Pay, Klarna, etc.) en Settings
   → Payment methods. Algunos requieren validación adicional.
7. Cuando esté todo: cambia `ENABLE_SHOP=true` en Vercel + redeploy.
8. Paso a modo live solo cuando tengas todo testado y los métodos de pago
   aprobados.

---

## DNS del dominio · nudostudio.blog

- **Para qué**: traducir `nudostudio.blog` → IP de Vercel.
- **Dónde**: en el registrar donde compraste el `.blog` (Namecheap, GoDaddy,
  Cloudflare, etc.). No sé cuál usaste.
- **Estado actual**: ✅ Funciona — el sitio responde en `https://nudostudio.blog`.
- **Acción**: si quieres añadir email custom (`hola@nudostudio.blog`), necesitas
  configurar registros MX + SPF + DKIM + DMARC en el registrar. Resend tiene
  guía paso a paso.

---

## Servicios "invisibles" del proyecto

- **Google Fonts** — Inter, Cormorant Garamond, JetBrains Mono. CDN público,
  no requiere cuenta. Carga vía `<link>` en cada página.
- **Next.js / React 18** — el framework. Open source, sin cuenta.
- **TypeScript** — tipado. Sin cuenta.
- **Vercel CDN** — sirve los assets (`/public/assets/*`). Incluido en Vercel.
- **Supabase Storage** — disponible si algún día quieres subir fotos desde el
  cliente. No usado todavía. Free 1 GB.

---

## Herramientas locales (sólo en tu Mac)

- **Homebrew** — instalador de paquetes en macOS. `brew install …`.
- **cwebp** — encoder WebP (instalado vía Homebrew). Convierte JPG→WebP.
- **ffmpeg** — compresión de vídeo. Lo usamos para meter `eventos-nudo.mp4` de
  18 MB a 2 MB.
- **sips** — image processing nativo de macOS. JPG quality + resize. No
  soporta WebP en escritura — por eso necesitamos cwebp.
- **Node 18+** — runtime de JS. Necesario para `npm run dev` / `npm run build`.

---

## Mapa de dependencias

Para visualizar qué necesita qué:

```
Usuario visita nudostudio.blog
   │
   ├── Vercel CDN sirve HTML/CSS/JS/assets
   │
   ├── Páginas dinámicas (login, cuenta, pedidos)
   │      └── Vercel runs Next.js SSR
   │             └── consulta Supabase (auth + DB)
   │
   ├── Form de contacto (/contacto)
   │      └── POST /api/contact → Resend → tu email
   │
   ├── Chat asistente (FAB o /asistente)
   │      └── POST /api/asistente → Anthropic Claude → respuesta
   │
   ├── Tienda (/tienda)
   │      ├── Quick-add → /api/cart/update → Supabase
   │      └── Checkout → /api/orders/create → Supabase
   │           └── (cuando ENABLE_SHOP=true) → Stripe Checkout → webhook
   │
   └── GitHub (origin/main) → Vercel auto-deploy on push
```

---

## Cheatsheet de comandos

```bash
# Dev local
npm run dev                           # arranca en localhost (puerto auto)

# Build local (verifica TypeScript)
npm run build

# Deploy a producción
git push origin main                  # Vercel detecta el push y deploya

# Limpieza si algo se rompe en local
pkill -9 -f "next dev"; rm -rf .next; npm run dev

# Comprimir nuevas fotos
sips -s format jpeg -s formatOptions 80 -Z 1800 input.jpg --out output.jpg
cwebp -q 85 -m 6 output.jpg -o output.webp

# Comprimir vídeo
ffmpeg -i input.mp4 -c:v libx264 -crf 22 -vf "scale=-2:1080" -an \
       -movflags +faststart output.mp4
```

---

## Si pierdes el acceso a alguna cuenta

- **GitHub**: usa "Forgot password" en github.com. Si tenías 2FA, recupera con
  códigos de respaldo.
- **Vercel**: log-in usa el mismo provider que GitHub. Si pierdes GitHub,
  pierdes Vercel.
- **Supabase**: signup fue con email o GitHub. "Forgot password" en
  https://supabase.com/dashboard/sign-in.
- **Anthropic / Resend / Stripe**: cada uno por separado con email + password.
  Activa 2FA en todas.

---

## Pendientes de configurar

| # | Tarea | Bloquea |
|---|---|---|
| 1 | Cuenta Anthropic + API key | Asistente IA actualmente da error |
| 2 | Cuenta Resend + verificar dominio | Form de contacto no envía emails |
| 3 | Cuenta Stripe + activar métodos + ENABLE_SHOP=true | No se cobra en "Pagar" |
| 4 | (Opcional) Confirm email Supabase activado | Hoy registros entran sin verificar |
| 5 | (Opcional) Email custom `hola@nudostudio.blog` | Necesita MX records |
