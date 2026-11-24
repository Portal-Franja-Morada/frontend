# @franja/landing

Sitio público del portal (Astro). Los comandos del monorepo están en la raíz, documentados en `AGENTS.md`.

## Variables de entorno

1. Copiá `.env.example` a `.env` en esta carpeta.
2. Completá `PUBLIC_API_URL` con la URL base del backend (sin barra final), por ejemplo `http://localhost:3000`.
3. Si `PUBLIC_API_URL` no está definida, la home usa `src/data/mock.ts`.

En desarrollo, `?estado=cargando|vacio|error` fuerza estados de UI sin llamar a la API (solo con `pnpm dev`).
