# Arquitectura — SmartTrafic Fase 1

## Qué es esta fase

La Fase 1 es el **sistema operativo de la plataforma**: multi-tenant, autenticado, con dashboard de operación, simulador adaptativo, módulo de salud (tipo Sentry), auditoría y configuración. Corre en Vercel. Los datos viven en Supabase. El hardware de calle aún no es obligatorio: el gemelo digital ya toma decisiones con el mismo algoritmo que irá al edge.

```
[Sensores / simulador]
        │
        ▼
[Algoritmo adaptativo]  ← TypeScript (web) y Python (firmware/), misma lógica
        │
        ▼
[MQTT TLS] ──► [Ingest API / Edge Functions]
        │
        ▼
[Supabase Postgres + Realtime + RLS]
        │
        ├──► Next.js (Vercel)  dashboard, RBAC, bento
        ├──► Telegram          salud y fallas
        └──► Resend            reporte al alcalde (fase 2)
```

## Roles

| Rol | Correo / origen | Qué ve |
|---|---|---|
| `superadmin` | solo `clpezci@gmail.com` | Módulo Plataforma: salud, auditoría, variables globales, todas las alcaldías |
| `platform_ops` | operadores que el superadmin invite | Salud y tickets, sin borrar tenants |
| `municipality_admin` | secretario / alcalde | Su municipio: cruces, técnicos, planes, variables locales |
| `technician` | técnico de campo | Cruces asignados, alertas, checklists |
| `viewer` | policía / concejo | Tablero en vivo, sin botones de cambio |

El módulo **Plataforma** está escondido en navegación y bloqueado en middleware si el email no es el superadmin (o un ops creado por él).

## Multi-tenant

Toda fila operativa lleva `municipality_id`. RLS de Postgres: un usuario solo lee su municipio. El superadmin bypasea con `is_platform_admin`.

## Seguridad (mínimo de esta fase)

- Auth de Supabase (email + password). Sin registro público.
- Cookies httpOnly para sesión de servidor.
- RLS por tenant.
- Service role solo en Route Handlers / cron.
- Auditoría append-only (`audit_events`).
- Rate limit básico en `/api/ingest`.
- Comandos al campo firmados (HMAC) cuando MQTT esté activo.
- Conflicto de verdes: el algoritmo nunca emite verde-verde. Si lo detecta, fuerza ámbar intermitente (fail-safe).

## Algoritmo (peso de cola)

Para cada acceso:

```
score = (vehiculos_100m * 1.0)
      + (vehiculos_200m * 1.6)
      + (vehiculos_300m * 2.4)
      + (espera_s del primero * 0.08)
      + (motos * 0.45)
      + (buses * 2.2)
      + (camiones * 2.8)
      + (peatones_esperando * 1.8)
```

Reglas que no se negocian:

- Mínimo verde vehicular y peatonal
- Amarillo + all-red de despeje
- Corte por vacío (si la calle en verde se vació y la otra tiene score)
- Extensión de pelotón hasta máximo
- Prioridad absoluta: emergencia > peatón con botón ya servido > peso de cola
- Modos: normal, colegio, mercado, noche, eco, emergencia

## Módulos de la app

- `/` marketing
- `/entrar` login
- `/tablero` resumen BI (KPIs, gráficos, matriz)
- `/en-vivo` gemelos operativos de cruces
- `/cruces` y `/cruces/[id]` gemelo + sensores 100/200/300
- `/alcaldias` tenants (superadmin ve todas)
- `/tecnicos`
- `/alertas`
- `/reportes`
- `/activos` matriz de propiedad municipio vs comodato
- `/simulador` laboratorio del algoritmo
- `/configuracion` variables del municipio
- `/plataforma/salud` Sentry-like (solo superadmin)
- `/plataforma/auditoria`
- `/plataforma/variables` config global (Telegram, MQTT, flags)

PWA instalable (`manifest`, service worker, iconos, dock inferior). Mobile-first: el tablero se usa con el pulgar.

## Qué viene después (no bloquea Vercel)

- Firmware en ESP32-S3 / CM4 hablando MQTT real
- Visión YOLO en edge
- Resend + PDF al alcalde
- Modo técnico offline con cola de sync
- Módulo de placas / fotomulta (solo con base legal)
