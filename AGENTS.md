# Reglas para agentes (Pi, Claude, Cursor, etc.)

Portal Franja Morada — frontend del portal de estudiantes de la Facultad de Ciencias Económicas (UNNE). Este repo es solo el frontend. El backend y el paquete Zod `@franja/shared` viven en [Portal-Franja-Morada/backend](https://github.com/Portal-Franja-Morada/backend).

## Proyecto

- Monorepo pnpm: `apps/landing` (Astro, sitio público), `apps/admin` (Vite + React, detrás de login), `packages/ui` (`@franja/ui`).
- El backend está en otro repo, normalmente clonado en `../backend`. Setup local: `apps/landing/README.md` y README del backend (`pnpm db:seed:demo`).

## Stack

Node 22.23.5 (`.nvmrc`), TypeScript, Prettier y ESLint. Tailwind CSS v4 y shadcn/ui en `@franja/ui`. Astro 7 pide Node `>=22.23.4`; en CI, `actions/setup-node` toma la versión desde `.nvmrc`.

## Estructura

```text
apps/landing     @franja/landing   sitio público (Astro, estático)
apps/admin       @franja/admin      panel de administración (React + Vite)
packages/ui      @franja/ui         componentes React, estilos y tema
```

La landing no tiene login. Importá el CSS una sola vez, desde el layout:

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
pnpm dev            # @franja/landing y @franja/admin en paralelo
pnpm build          # build de los workspaces que tienen script build
pnpm lint           # eslint .
pnpm format         # prettier --write .
pnpm format:check   # prettier --check .
pnpm typecheck      # astro check en landing y tsc --noEmit en ui/admin
```

## Flujo de trabajo

- Siempre partí de main actualizado: `git checkout main && git pull`, después creá una rama `feat/<nombre-corto>` (o `docs/...` para documentación).
- Una pantalla o un cambio por PR. Nada de mezclar.
- Antes de terminar: `pnpm format`, `pnpm lint`, `pnpm format:check` y `pnpm build` tienen que pasar.
- **No hagas commit, push ni PR sin que el humano lo apruebe.** Al final mostrá `git status` y el mensaje de commit propuesto (Conventional Commits, en español).
- No commitear secretos, `.env` ni prompts o briefs.
- Git: no commitear directo en `main`. Push solo con aprobación. Nunca `push --force`, `reset --hard`, borrar ramas ni reescribir historial.
- Dependencias: preguntar antes de agregar, quitar o actualizar paquetes. El lockfile solo cambia con `pnpm`.
- Alcance: no tocar el repo padre de esta carpeta ni el del backend.

## Figma → código

- Leé el Figma (por MCP o por API con `FIGMA_API_KEY`; nunca imprimas ni guardes el token).
- Respetá textos, tamaños, colores y espaciados de desktop y mobile.
- Reportá siempre las diferencias contra el Figma y por qué.

## Backend / API

- **No cambies el backend desde este repo.** El frontend se adapta a lo que da la API.
- Revisá en el backend qué endpoint corresponde y qué campos devuelve de verdad.
- Si el Figma muestra un campo que la API no tiene, no lo inventes: dejalo afuera y avisalo.

## Patrones

- `fetch-*.ts` / `*-api.ts` con `getApiBaseUrl` y timeout de 10 s. En admin, `credentials: 'include'`.
- Fechas con los helpers de `dates.ts`, en hora de Argentina.
- Estados cargando, vacío y error (con "Reintentar"). `?estado=` solo en DEV.
- Reusá componentes de `@franja/ui` antes de crear nuevos. Cambios a cosas compartidas, en un PR aparte.
- Rutas con slug en landing: `[slug].astro` con `getStaticPaths` solo para `_`, rewrite en middleware (dev) y en `vercel.json` (prod).

## Seguridad

- Nada de datos mock en el código. Para probar: backend local + `pnpm db:seed:demo` (en el repo del backend).
- No leas ni muestres valores de `.env`; solo nombres de variables. `.env.example` solo con nombres.
- Nunca pongas contraseñas, tokens ni datos personales de estudiantes (nombre, DNI, legajo, notas) en código, tests, commits ni reportes.

## Admin y sesión

La cookie de login del backend es `SameSite=Lax`. En producción, la app y la API tienen que compartir dominio raíz (`app` y `api` bajo el mismo sitio). En local, el admin usa el proxy de Vite. La landing es pública y no participa de esa sesión.

Hosting previsto: Vercel. Dominios futuros: landing en el dominio público y el admin en un subdominio `app`. No configurar Vercel ni dominios en este repo hasta que se pida.
