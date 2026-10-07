# Stack tecnológico observado

## Aplicación y runtime

- **Lenguaje:** TypeScript/TSX.
- **Node.js observado en el entorno:** `v22.23.2`.
- **Framework web:** Next.js `16.3.0` (App Router y Route Handlers).
- **UI:** React y React DOM `19.2.8`.
- **TypeScript:** declarado `^5`, instalado `5.9.3`.
- **Estilos:** Tailwind CSS declarado `^4`, instalado `4.3.3`; PostCSS con `@tailwindcss/postcss`.
- **Diseño/componentes:** `@base-ui/react`, `shadcn`, componentes propios y `class-variance-authority`.

## Dependencias directas instaladas

Versiones leídas con `npm list --depth=0` (se muestran dependencias directas; no se enumeran transitivas):

| Dependencia | Versión instalada |
|---|---:|
| `@base-ui/react` | 1.8.0 |
| `@hookform/resolvers` | 5.9.1 |
| `@supabase/ssr` | 0.12.5 |
| `@supabase/supabase-js` | 2.112.4 |
| `class-variance-authority` | 0.7.1 |
| `cn` | 0.3.0 |
| `lucide-react` | 1.47.0 |
| `next` | 16.3.0 |
| `react` | 19.2.8 |
| `react-dom` | 19.2.8 |
| `react-hook-form` | 7.88.0 |
| `react-hot-toast` | 2.6.1 |
| `react-icons` | 5.7.0 |
| `shadcn` | 4.21.0 |
| `tw-animate-css` | 1.4.0 |
| `zod` | 4.6.5 |
| `@tailwindcss/postcss` | 4.3.3 |
| `@types/node` | 20.19.43 |
| `@types/pg` | 8.23.1 |
| `@types/react` | 19.2.18 |
| `@types/react-dom` | 19.2.4 |
| `eslint` | 9.39.5 |
| `eslint-config-next` | 16.3.0 |
| `tailwindcss` | 4.3.3 |
| `typescript` | 5.9.3 |

`package.json` conserva rangos semver para varias dependencias; el detalle declarado está en ese archivo y el lockfile fija las resoluciones. Hay tanto `package-lock.json` como `pnpm-lock.yaml`; en el entorno inspeccionado npm está disponible y `pnpm` no está en `PATH`.

## Persistencia e integraciones

- **Supabase Auth** autentica usuarios y mantiene sesión mediante cookies; `getAuthUser` también admite bearer token.
- **Supabase PostgreSQL/PostgREST** es consultado con `@supabase/supabase-js`.
- **Supabase Storage** almacena documentos en el bucket `documentos`; la aplicación emite enlaces firmados con vencimiento de 60 segundos.
- **Validación:** Zod `4.6.5`.
- **Formularios:** React Hook Form y resolvers.
- **Feedback UI:** React Hot Toast.

## Compilación y herramientas

`tsconfig.json` activa `strict`, `noEmit`, `isolatedModules` y `jsx: react-jsx`; configura `target: ES2017`, `moduleResolution: bundler` y `@/*` como alias de raíz.

Scripts definidos:

- `npm run dev` — `next dev`
- `npm run build` — `next build`
- `npm run start` — `next start`
- `npm run lint` — `eslint`

No hay scripts de pruebas declarados en `package.json`.

## Configuración de entorno identificada

Solo se registran nombres de variables leídos por el código, no sus valores:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Límites de esta inspección

Este archivo describe el stack presente, no recomienda un stack de destino. No se ejecutó build, lint ni pruebas. El repositorio tiene lockfiles de npm y pnpm, pero la verificación de versiones instaladas se hizo con npm.
