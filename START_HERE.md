# 👋 Despliegue paso a paso — Nudo Studio

Hola Daniel. Esta guía está adaptada a tu estado actual:

- ✅ Dominio comprado: **nudostudio.blog** (Porkbun)
- ✅ Cuenta de Vercel creada (`danielmiro95-8882s-projects`)
- ⚠️ API key de Resend **comprometida** — hay que regenerarla (paso 0)
- ⏳ Pendiente: cuenta de Anthropic, verificar dominio en Resend

Sigue los pasos **en orden**. Cada paso depende del anterior.

---

## 🔴 Paso 0 · Borrar la API key comprometida (2 min)

La clave que pegaste en el chat (`re_PXLRu5FD…`) hay que considerarla pública. Cualquiera que la viera podría enviar emails desde tu dominio cuando lo verifiques.

1. Entra en https://resend.com/api-keys
2. Localiza la clave que termina en `…ywywM` y pulsa el icono de la papelera 🗑
3. Confirma "Delete API Key"

Esa clave ya no existe. Crearemos otra en el paso 4.

---

## Paso 1 · Probar el sitio en local (10 min)

Esto es opcional pero recomendado para que veas que todo funciona antes de subirlo.

```bash
# 1. Comprueba que tienes Node 20+
node --version       # debe decir v20.x.x o superior

# 2. En la carpeta del proyecto
npm install          # tarda 1-2 min la primera vez

# 3. Crea tu fichero local de variables (no se sube a GitHub)
cp .env.example .env.local

# 4. Arranca
npm run dev
```

Abre http://localhost:3000. Verás el sitio funcionando. El formulario y el asistente devolverán "no configurado" porque aún no hay claves — eso es correcto.

`Ctrl+C` para parar.

---

## Paso 2 · Subir el código a GitHub (10 min)

Tu repo actual `ai-nudo-studio` tiene la versión vieja (HTML estático). Hay dos formas:

### Opción A · Reemplazar el repo actual (más limpio)

```bash
# Desde la carpeta de este proyecto:
cd /ruta/donde/extrajiste/el/zip/

git init
git add -A
git commit -m "Migración a Next.js — sitio dinámico con backend"
git branch -M main
git remote add origin https://github.com/danielmiro95-arch/ai-nudo-studio.git
git push -f origin main
```

> ⚠️ El `-f` borra el historial anterior del repo. Si quieres conservarlo, usa la opción B.

### Opción B · Crear un repo nuevo

1. En GitHub: New Repository → nombre `nudo-studio` (sin "ai-") → Create.
2. Sigue los comandos de A pero con la URL del repo nuevo.

---

## Paso 3 · Crear cuenta de Anthropic (10 min)

Necesario para el asistente IA.

1. Entra en https://console.anthropic.com
2. Sign Up con email.
3. Plans & Billing → Add Credit → mete **5€** (sobra para meses).
4. API Keys → Create Key → ponle nombre "nudostudio".
5. **Cópiala y guárdala** en un sitio seguro (gestor de contraseñas, archivo .txt local). Empieza por `sk-ant-…`.

> 🚨 **No me la pegues a mí.** Solo la pegarás en Vercel en el paso 5.

---

## Paso 4 · Generar nueva API key de Resend (5 min)

1. Entra en https://resend.com/api-keys
2. "Create API Key" → ponle nombre "nudostudio-prod" → Permission: "Sending access" → "Full access" del dominio cuando lo tengas, o "All domains" por ahora.
3. **Cópiala** (empieza por `re_…`). Guárdala en sitio seguro.
4. **No me la pegues.**

---

## Paso 5 · Conectar el repo a Vercel (10 min)

1. Entra en https://vercel.com/danielmiro95-8882s-projects
2. "Add New..." → "Project" → busca el repo `ai-nudo-studio` (o el nuevo `nudo-studio` si elegiste opción B) → "Import".
3. **No toques** "Framework Preset" ni "Build Command" — Vercel detecta Next.js solo.
4. Expande "**Environment Variables**" y añade EXACTAMENTE estas (copia y pega los nombres):

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | la clave nueva de Resend (paso 4) |
   | `CONTACT_EMAIL_TO` | `hola@nudostudio.blog` |
   | `CONTACT_EMAIL_FROM` | `Nudo Studio <web@nudostudio.blog>` |
   | `ANTHROPIC_API_KEY` | la clave de Anthropic (paso 3) |
   | `ANTHROPIC_MODEL` | `claude-sonnet-4-6` |
   | `NEXT_PUBLIC_SITE_URL` | `https://nudostudio.blog` |
   | `NEXT_PUBLIC_SITE_NAME` | `Nudo Studio` |
   | `ENABLE_SHOP` | `false` |

   > 💡 **Las claves van a parar a un almacén cifrado de Vercel**. No quedan visibles en GitHub ni en logs.

5. Pulsa "**Deploy**". 60-90 segundos.

Cuando termine: Vercel te da una URL del tipo `ai-nudo-studio-xxx.vercel.app`. **Ábrela** — el sitio ya está online ahí. Pero el formulario y el asistente seguirán sin funcionar hasta que verifiquemos el dominio (paso siguiente).

---

## Paso 6 · Conectar nudostudio.blog a Vercel (15-30 min)

1. En Vercel → tu proyecto → **Settings** → **Domains**.
2. Add: `nudostudio.blog` → "Add".
3. Vercel te muestra una de dos opciones:
   - **Opción recomendada (cambiar nameservers):** te da 2 nameservers como `ns1.vercel-dns.com` y `ns2.vercel-dns.com`.
   - **Opción alternativa (registros A/CNAME):** te da unos registros DNS para añadir.

   **Elige la primera** (cambiar nameservers) si Porkbun te lo permite, es más sencillo.

4. **En Porkbun:**
   - Entra en https://porkbun.com/account/domains
   - Click en `nudostudio.blog` → "Authoritative Nameservers" → "Change"
   - Borra los nameservers actuales (algo como `curitiba.ns.porkbun.com`)
   - Pega los 2 de Vercel
   - Save.

5. Vuelve a Vercel → Settings → Domains. La verificación tarda **5 min - 2 h** en propagarse. Cuando termine, verás un check verde y un candado SSL.

6. **Añade también `www.nudostudio.blog`** en Vercel (Add Domain → te ofrece redireccionarlo automáticamente al sin-www).

Ahora `https://nudostudio.blog` carga el sitio. 🎉

---

## Paso 7 · Verificar el dominio en Resend (15 min + propagación)

Sin esto, los emails del formulario **no se envían**.

1. https://resend.com/domains → "Add Domain" → escribe `nudostudio.blog` → región `eu-west-1` (Europa) → Add.
2. Resend te da **3 registros DNS** que añadir: 1 TXT (SPF) + 2 TXT (DKIM).

3. **PROBLEMA:** acabas de cambiar los nameservers a Vercel en el paso anterior. Eso significa que **los DNS los gestiona ahora Vercel**, no Porkbun. Los registros DNS de Resend se añaden en Vercel:

   - Vercel → tu proyecto → **Settings** → **Domains** → click en `nudostudio.blog` → scroll abajo a "DNS Records" → "Add Record".
   - Por cada uno de los 3 registros que te dio Resend:
     - **Type:** TXT
     - **Name:** lo que diga Resend (ej: `send`, `resend._domainkey`, `@`)
     - **Value:** lo que diga Resend
     - TTL: deja el por defecto.

4. Vuelve a Resend y pulsa "**Verify Domain**". Tarda 5 min - 1 h.

5. Cuando esté verificado: ✅ verde. Ya puedes enviar emails desde `@nudostudio.blog`.

---

## Paso 8 · Probar formulario y asistente (5 min)

1. Ve a https://nudostudio.blog/contacto
2. Rellena con un email real tuyo, mensaje "prueba" → Enviar.
3. Te debe llegar el email a `hola@nudostudio.blog` (configura un forward en Porkbun → Email Forwarding si aún no tienes la bandeja real).

4. Ve a https://nudostudio.blog/asistente
5. Escribe: "Hola, queremos una boda íntima en Madrid en septiembre 2026"
6. Claude debe responder en 5-10 segundos.

**Si algo falla:**

| Síntoma | Causa probable | Solución |
|---|---|---|
| "Servicio de email no configurado" | falta `RESEND_API_KEY` o env mal escrito | revisa Vercel → Settings → Environment Variables y redeploy |
| Email se envía pero no llega | dominio no verificado en Resend | repite paso 7 |
| Email se envía pero `from:` rechazado | el dominio en `CONTACT_EMAIL_FROM` no coincide con el verificado | usa `web@nudostudio.blog`, no `web@otro-dominio.com` |
| Asistente devuelve 503 | falta `ANTHROPIC_API_KEY` | añadir y redeploy |
| Asistente devuelve 502 | saldo agotado en Anthropic | añadir más crédito en console.anthropic.com |
| Errores 500 misteriosos | mira logs en Vercel → Deployments → última → Functions |

---

## Paso 9 · Crear el email del estudio (10 min)

Para recibir los formularios necesitas que `hola@nudostudio.blog` exista. Tres opciones:

### A · Email forwarding gratis (más fácil)

Porkbun ofrece forwarding gratis: `hola@nudostudio.blog` → `tu-email-personal@gmail.com`.

1. Porkbun → tu dominio → "Email Forwarding" → Add.
2. From: `hola` → To: tu email personal.

⚠️ Si activaste los nameservers de Vercel en el paso 6, esto **no funciona** desde Porkbun. Tendrás que añadir los registros MX en Vercel manualmente, o usar la opción B.

### B · Google Workspace (~6€/mes)

Email profesional `hola@nudostudio.blog`, calendario, drive, etc. La forma "seria" si esto va a ser tu negocio.

### C · Zoho Mail (gratis para 1 dominio)

https://www.zoho.com/mail/ — alternativa gratis a Workspace, suficiente.

---

## Paso 10 · Rellenar páginas legales (15 min)

Imprescindible antes de empezar a vender, **muy recomendado** aunque solo tengas formulario.

Edita estos archivos sustituyendo los `[PLACEHOLDER]`:
- `src/app/legal/aviso-legal/page.tsx` → datos fiscales
- `src/app/legal/privacidad/page.tsx` → datos del responsable RGPD
- `src/app/legal/terminos/page.tsx` → tus condiciones de venta
- `src/app/legal/cookies/page.tsx` → fecha de actualización

Una vez editados:
```bash
git add -A
git commit -m "Páginas legales — datos del titular"
git push
```

Vercel redespliega solo en 60s.

---

## Después: cuándo me vuelves a llamar

Vuelve a una conversación nueva conmigo cuando:

- 🟢 **Todo el deploy ha ido bien** — quieres pasar a la fase de tienda real (Stripe).
- 🟡 **Algo concreto falla** — copia y pega el error exacto + qué paso estabas dando.
- 🔵 **Quieres cambiar contenido** del sitio (textos, fotos, secciones nuevas).

**Importante para la próxima vez:** referencia este chat o di "estoy con el proyecto Nudo Studio Next.js". No me pegues claves nunca más 🙏

---

## Resumen visual del flujo

```
┌─────────────┐
│ 0. Borrar   │  Resend dashboard → eliminar key vieja
│    key      │
└──────┬──────┘
       │
┌──────▼──────┐
│ 1. Probar   │  npm install && npm run dev
│    local    │
└──────┬──────┘
       │
┌──────▼──────┐
│ 2. Push a   │  git push -f a tu repo
│    GitHub   │
└──────┬──────┘
       │
┌──────▼──────┐         ┌─────────────┐
│ 3. Cuenta   │   +     │ 4. Key      │
│  Anthropic  │         │  Resend     │
└──────┬──────┘         └──────┬──────┘
       │                       │
       └───────┬───────────────┘
               │
        ┌──────▼──────┐
        │ 5. Vercel:  │  Import repo + Env vars + Deploy
        │   importar  │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ 6. Dominio  │  Porkbun nameservers → Vercel
        │  → Vercel   │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ 7. Verificar│  Vercel DNS → 3 TXT records
        │   Resend    │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ 8. Probar   │  /contacto + /asistente
        │             │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ 9. Email    │  Porkbun forward o Zoho
        │  hola@      │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ 10. Legales │  Rellenar [PLACEHOLDER]
        │             │
        └─────────────┘
              🎉
```
