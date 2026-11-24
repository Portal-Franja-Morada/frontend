# @franja/landing

Sitio público del portal (Astro). Los comandos del monorepo están en la raíz, documentados en `AGENTS.md`.

## Variables de entorno

1. Copiá `.env.example` a `.env` en esta carpeta.
2. Completá `PUBLIC_API_URL` con la URL base del backend (sin barra final), por ejemplo `http://localhost:3000`.

`PUBLIC_API_URL` es obligatoria: sin ella, agenda y novedades muestran el estado de error.

## Probar en local

1. En el repo del backend, levantá la API con datos de demo: `pnpm db:seed:demo`.
2. En `apps/landing/.env`, definí `PUBLIC_API_URL=http://localhost:3000`.
3. Desde la raíz del frontend: `pnpm dev`.

En desarrollo, `?estado=cargando|vacio|error` fuerza estados de UI sin llamar a la API (solo con `pnpm dev`).
