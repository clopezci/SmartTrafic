# SmartTrafic

Plataforma de semaforización solar, adaptativa y en suscripción para municipios pequeños e intermedios.

## Fase 1 (esto)

- App Next.js en la raíz (`src/`)
- Esquema Supabase en `supabase/`
- Firmware de escritorio en `firmware/`
- Investigación y arquitectura en `docs/`
- Lo que solo tú puedes hacer: `ACCIONES_MANUALES.md`

Producción: https://smart-trafic-six.vercel.app/

## Correr en local

```bash
npm install
npm run dev
```

Entra a http://localhost:3000

Cuentas de demostración (también están en `/entrar`):

| Rol | Correo | Clave |
|---|---|---|
| Dueño de plataforma | clpezci@gmail.com | Demo#SmartTrafic26 |
| Alcaldía | alcalde@villaesperanza.gov.co | Demo#Municipio26 |
| Técnico | tecnico@villaesperanza.gov.co | Demo#Tecnico26 |
| Policía | transito@villaesperanza.gov.co | Demo#Visor26 |

El módulo **Plataforma** (salud, auditoría, variables globales) solo aparece con el correo del dueño.

## Vercel

Importa el repo. **Root Directory vacío** (la app ya está en la raíz). Guía en `ACCIONES_MANUALES.md`.
