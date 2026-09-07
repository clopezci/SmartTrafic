# Acciones manuales — SmartTrafic

Solo aparecen aquí las cosas que **no puedo hacer yo desde este entorno**. Hazlas en paralelo mientras el código ya está en GitHub. Marca cada casilla cuando termines.

Correo de superadmin de la plataforma: **clpezci@gmail.com**  
Repo: https://github.com/clopezci/SmartTrafic

---

## 0. Ahora mismo (15 minutos)

### 0.1 Confirmar que GitHub te reconoce

1. Abre https://github.com/clopezci/SmartTrafic
2. Deberías ver el código de la Fase 1 (`src/`, `docs/`, `supabase/`, `firmware/`).
3. Si el repo sigue vacío, avísame: el push no llegó y lo reintento.

### 0.2 Crear el proyecto de Supabase

1. Entra a https://supabase.com y inicia sesión (GitHub está bien).
2. **New project**
   - Name: `smarttrafic`
   - Database password: genera una fuerte y **guárdala en un gestor de contraseñas**. No la subas a Git.
   - Region: **South America (São Paulo)** — es la más cercana a Colombia.
3. Espera a que el proyecto termine de provisionarse (barra verde).
4. Ve a **Project Settings → API**
   - Copia `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
   - Copia `anon public` → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copia `service_role` (secret) → será `SUPABASE_SERVICE_ROLE_KEY` (nunca en el frontend)
5. Ve a **Project Settings → API → JWT Secret** y copia el JWT secret → `SUPABASE_JWT_SECRET` (opcional en fase 1).

### 0.3 Correr el esquema SQL

1. En Supabase: **SQL Editor → New query**
2. Abre en este repo el archivo `supabase/schema.sql`
3. Pega todo el contenido y pulsa **Run**
4. Abre `supabase/seed.sql`, pega y **Run**
5. Si algo falla, copia el error y pégamelo.

### 0.4 Crear tu usuario admin (el único que ve el módulo de plataforma)

1. En Supabase: **Authentication → Users → Add user → Create new user**
2. Email: `clpezci@gmail.com`
3. Password: una que solo tú sepas (mínimo 12 caracteres, mayúscula, número, símbolo)
4. Marca **Auto Confirm User**
5. Luego **SQL Editor**, corre esto (cambia el uuid si el usuario ya existe; lo más simple es el seed que ya enlaza por email):

```sql
update public.profiles
set role = 'superadmin',
    full_name = 'Cristian López',
    is_platform_admin = true
where email = 'clpezci@gmail.com';
```

Si el perfil no se creó solo (a veces el trigger tarda), corre `supabase/seed.sql` de nuevo o avísame.

### 0.5 Desactivar registros públicos

1. **Authentication → Providers → Email**
2. Confirm email: ON
3. **Authentication → URL Configuration**
   - Site URL (luego de Vercel): `https://smart-trafic-six.vercel.app`
4. No habilites “Sign up” público. Los usuarios los crea el superadmin o el admin de alcaldía.

---

## 1. Conectar Vercel

El proyecto ya está importado: https://smart-trafic-six.vercel.app/

Si ves **404**, casi seguro Vercel no encontró Next.js (antes estaba en una subcarpeta). Ya lo movimos a la raíz. Tras el push, el deploy nuevo debe servir la app.

Si el 404 sigue:

1. Entra a https://vercel.com → proyecto **smart-trafic**
2. **Settings → Build and Deployment** (no General)
   - **Framework Preset:** Next.js (si dice Other / Other, cámbialo)
   - **Root Directory:** vacío
3. **Deployments → Redeploy** con “Use existing Build Cache” **apagado**

Para un proyecto nuevo:

1. Entra a https://vercel.com e inicia sesión con GitHub.
2. **Add New → Project → Import** `clopezci/SmartTrafic`
3. **Root Directory:** vacío
4. Framework: Next.js
5. Environment Variables — pega estas:

| Nombre | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | la Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | la service_role |
| `SUPERADMIN_EMAIL` | `clpezci@gmail.com` |
| `SESSION_SECRET` | una cadena larga aleatoria (32+ caracteres) |
| `CRON_SECRET` | otra cadena aleatoria |
| `TELEGRAM_BOT_TOKEN` | lo sacas en el paso 2 |
| `TELEGRAM_ADMIN_CHAT_ID` | tu chat id |
| `NEXT_PUBLIC_APP_URL` | `https://smart-trafic-six.vercel.app` |

6. Deploy.
7. Cuando tenga URL, vuelve a Supabase → **Authentication → URL Configuration** y pon esa URL como Site URL. En Redirect URLs agrega:
   - `https://smart-trafic-six.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

8. Prueba entrar con `clpezci@gmail.com`. Debes ver el módulo **Plataforma** (salud, auditoría, variables globales). Un usuario de alcaldía no debe verlo.

---

## 2. Bot de Telegram (reportes de salud y alertas)

1. En Telegram busca `@BotFather`
2. `/newbot` → nombre: `SmartTrafic Salud` → username tipo `smarttrafic_salud_bot`
3. Copia el **token**. Eso es `TELEGRAM_BOT_TOKEN`
4. Ábrele un chat al bot y pulsa Start
5. Para saber tu chat id: busca `@userinfobot` o `@getidsbot` y copia tu id numérico → `TELEGRAM_ADMIN_CHAT_ID`
6. (Opcional, mejor) Crea un grupo privado “SmartTrafic — Operación”, agrega el bot, y usa el chat id del grupo (suele ser negativo)
7. Pega token y chat id en Vercel → Environment Variables → **Redeploy**
8. En la app: **Plataforma → Salud → Enviar reporte de prueba**

---

## 3. Broker MQTT (cuando tengamos el prototipo físico)

Todavía no es bloqueante para la Fase 1 del software. Cuando vayas a conectar la placa:

1. Crea cuenta en https://www.hivemq.com/products/mqtt-cloud-broker/ (free tier)
2. Crea un cluster, usuario y password
3. Anota:
   - Host
   - Puerto 8883 (TLS)
   - User / pass
4. Esas variables se llaman `MQTT_URL`, `MQTT_USER`, `MQTT_PASSWORD`
5. En Supabase, tabla `system_settings`, o en **Plataforma → Variables**

No uses MQTT sin TLS. No dejes el broker anónimo.

---

## 4. Correo transaccional (reportes al alcalde)

1. Crea cuenta en https://resend.com
2. Verifica el dominio (o usa el sandbox `beth.t@example.com` para pruebas)
3. API key → `RESEND_API_KEY`
4. Variable `REPORTS_FROM_EMAIL`

Esto puede esperar a la Fase 2. El dashboard ya genera el reporte en pantalla.

---

## 5. Dominio (opcional pero recomendado)

1. Compra o apunta un dominio tipo `app.smarttrafic.co`
2. En Vercel → Project → Domains → Add
3. Cambia Site URL en Supabase al dominio propio

---

## 6. Hardware de escritorio (cuando quieras el prototipo físico)

No es necesario para usar la plataforma web. La Fase 1 ya simula cruces.

Lista mínima (un cerebro, dos calles):

- 1× ESP32-S3 DevKit (empieza barato; Compute Module después)
- 1× protoboard 830 puntos
- 6× LED 5 mm (2 rojo, 2 ámbar, 2 verde)
- 6× resistencias 330 Ω
- cables Dupont macho-hembra
- 2× pulsadores
- fuente USB decente

Dónde: Didácticas Electrónicas, Mundo Robótico, o AliExpress. El software del edge está en `firmware/`.

---

## 7. Cosas legales / comerciales que solo tú puedes hacer

- Registrar la empresa / RUT si vas a facturar a un municipio
- Cuenta bancaria a nombre de la empresa
- Plantilla de contrato de comodato + prestación de servicios (puedo redactarla en una fase siguiente; tú la firmas con abogado)
- Póliza de responsabilidad civil cuando un municipio lo exija
- NDA si vas a mostrar el prototipo a terceros

---

## Qué NO tienes que hacer

- No instales Hostinger. El front va a Vercel.
- No pongas la `service_role` en el navegador ni en un `.env` que se suba a Git.
- No habilites “sign up” abierto.
- No conectes el repo a Vercel hasta que yo te diga que la Fase 1 compiló y está en GitHub (este archivo se actualiza si cambia algo).
