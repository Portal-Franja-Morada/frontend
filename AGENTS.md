# Portal Franja Morada — frontend

Frontend del portal de estudiantes de la Facultad de Ciencias Económicas (UNNE), Franja Morada. Este repo es solo el frontend. El backend y el paquete Zod `@franja/shared` viven en [Portal-Franja-Morada/backend](https://github.com/Portal-Franja-Morada/backend). No se comparten desde acá.

## Stack

Monorepo pnpm, sin Turborepo. Node 22.23.5 (`.nvmrc`), TypeScript, Prettier y ESLint. Tailwind CSS v4 y shadcn/ui viven en `@franja/ui`.

Astro 7 pide Node `>=22.23.4`. La raíz declara `engines.node` `>=22.23.4`. En CI, `actions/setup-node` toma la versión desde `.nvmrc`.

## Estructura

```text
apps/landing     @franja/landing   sitio público (Astro, estático)
packages/ui      @franja/ui        componentes React, estilos y tema
```

`apps/web` se suma después: SPA con React + Vite, detrás de login (TanStack Query, React Router, react-hook-form + Zod). Va a reutilizar `@franja/ui`. No crearla todavía.

La landing no tiene login. Importa el CSS una sola vez, desde el layout:

```astro
import "@franja/ui/globals.css";
```

Los componentes de UI se importan así:

```astro
import {Button} from "@franja/ui/components/button";
```

Para agregar un componente de shadcn, desde la raíz:

```sh
pnpm dlx shadcn@latest add <componente> -c apps/landing
```

El CLI lo instala en `packages/ui` porque `apps/landing/components.json` apunta `ui` y `utils` a ese paquete. `style`, `iconLibrary` y `baseColor` tienen que coincidir en los dos `components.json`.

## Comandos

Desde la raíz:

```sh
pnpm install
pnpm dev            # dev de @franja/landing
pnpm build          # build de los workspaces que tienen script build
pnpm lint           # eslint .
pnpm format         # prettier --write .
pnpm format:check   # prettier --check .
pnpm typecheck      # astro check en la landing y tsc --noEmit en @franja/ui
```

## Antes de commitear

1. Actualizar `main` y abrir la rama desde ahí.
2. Una cosa por PR.
3. Correr `pnpm format` y después `pnpm lint`, `pnpm format:check` y `pnpm build`.
4. Preguntar antes de commitear y antes de abrir el PR.

No commitear secretos, `.env` ni prompts o briefs. En la documentación, solo nombres de variables, nunca valores.

## Nota para cuando exista la app

La cookie de login del backend es `SameSite=Lax`. En producción, la app y la API tienen que compartir dominio raíz (`app` y `api` bajo el mismo sitio). En local, la app va a usar el proxy de Vite. La landing de ahora es pública y no participa de esa sesión.

Hosting previsto: Vercel. Dominios futuros: landing en el dominio público y la app en un subdominio `app`. No configurar Vercel ni dominios en este repo hasta que se pida.
