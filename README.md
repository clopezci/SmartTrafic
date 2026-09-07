# SmartTrafic

Plataforma de semaforización solar, adaptativa y en suscripción para municipios pequeños e intermedios.

## Fase 1 (esto)

- App Next.js en `platform/`
- Esquema Supabase en `supabase/`
- Firmware de escritorio en `firmware/`
- Investigación y arquitectura en `docs/`
- Lo que solo tú puedes hacer: `ACCIONES_MANUALES.md`

## Correr en local

```bash
cd platform
npm install
npm run dev
```

Entra a http://localhost:3000

Cuentas de demostración (también están en `/entrar`):

| Rol | Correo | Clave |
|---|---|---|
| Dueño de plataforma | clopezci@gmail.com | Demo#SmartTrafic26 |
| Alcaldía | alcalde@villaesperanza.gov.co | Demo#Municipio26 |
| Técnico | tecnico@villaesperanza.gov.co | Demo#Tecnico26 |
| Policía | transito@villaesperanza.gov.co | Demo#Visor26 |

El módulo **Plataforma** (salud, auditoría, variables globales) solo aparece con el correo del dueño.

## Vercel

Root Directory = `platform`. Guía completa en `ACCIONES_MANUALES.md`.
