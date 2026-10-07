# Estructura del proyecto

## Clasificación

Aplicación full-stack web en un único proyecto Next.js App Router. La interfaz y la API se ejecutan desde el mismo proyecto; persistencia, autenticación y almacenamiento de archivos dependen de Supabase. No se observa una estructura de monorepo.

## Tamaño observado

Conteo estático del árbol excluyendo `node_modules`, `.next` y `.git`:

| Área | Archivos TS/TSX |
|---|---:|
| `app/` | 75 |
| `core/` | 23 |
| `components/` | 8 |
| `lib/` | 1 |
| `types/` | 1 |

El árbol contiene 19 archivos `page.tsx` y 36 archivos `app/api/**/route.ts`. El conteo de `app/` incluye páginas, rutas API y componentes alojados en `app/components/`.

## Capas y flujo

1. **Presentación y navegación** — `app/` contiene App Router, grupos por rol, páginas y componentes compartidos en `app/components/`.
2. **API HTTP** — `app/api/` define handlers `GET`, `POST`, `PUT`, `PATCH` y `DELETE`; varios validan payloads con Zod.
3. **Servicios** — `core/services/` compone autenticación, permisos de rol y operaciones de dominio.
4. **Repositorios** — `core/repositories/` contiene la mayoría de consultas Supabase; no todas las rutas pasan por repositorios (por ejemplo, métricas y algunas operaciones de catálogo).
5. **Integraciones** — `core/db/` crea clientes Supabase de servidor/navegador; Storage usa el bucket `documentos`.

Flujo habitual: página → `/api/...` → servicio → repositorio → Supabase. Hay excepciones donde el handler o el servicio consulta Supabase directamente.

## Entradas y superficies

- `/` redirige a `/auth/login`.
- Autenticación: `/auth/login`, `/auth/password-reset` y `/auth/update-password`.
- Portal administrativo: grupo `app/(admin)/dashboard/`, con páginas de actividades, catálogos, carpetas, métricas, configuración, cotizaciones y usuarios.
- Portal de cliente: grupo `app/(cliente)/cliente/dashboard/`, con carga, presupuestos, resultados y configuración.
- Portal de contador: grupo `app/(contador)/contador/dashboard/`, con cartera de clientes, detalle de cliente y configuración.
- API: autenticación, usuarios, catálogos, cotizaciones, actividades, carpetas/documentos, conversaciones/mensajes, notificaciones y métricas/operaciones administrativas.
- `proxy.ts` conecta el proxy de Next a `core/middleware/auth.middleware.ts`. Comprueba la sesión y aplica redirecciones por rol a rutas de interfaz; los handlers API también deben efectuar su propia autenticación/autorización.

## Dominios funcionales observados

- **Identidad y usuarios:** inicio/cierre de sesión, recuperación y cambio de contraseña, perfiles, roles, estado de usuario y asignación cliente-contador.
- **Cotizaciones:** solicitud del cliente, propuesta de precio del administrador, respuesta del cliente y conversión documentada a actividad.
- **Actividades y atención:** asignación de actividades a contadores, estados, carga de insumos y publicación de entregables.
- **Documentos:** carpetas generales, documentos por actividad y enlaces firmados de descarga.
- **Comunicación:** conversaciones y mensajes entre cliente, contador y administración.
- **Catálogos:** regímenes, especialidades, actividades y categorías de documentos.
- **Operación:** notificaciones y métricas del panel administrativo.

## Configuración y documentación

- `package.json`: dependencias y scripts `dev`, `build`, `start` y `lint`.
- `next.config.ts`: configuración Next.js actualmente vacía salvo el tipo de configuración.
- `tsconfig.json`: TypeScript estricto, resolución `bundler`, alias `@/*` hacia la raíz y destino ES2017.
- `proxy.ts`: punto de entrada del control de navegación/sesión.
- `DATABASE.md`, `API.md`, `API_STATUS.md` y `BUSINESS_LOGIC_GAP.md`: documentación funcional existente; conviene contrastarla con handlers y consultas actuales.
- El código lee `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y, para recuperación, `NEXT_PUBLIC_SITE_URL`. No se incluyen valores de entorno en este informe.

## Observaciones de arquitectura

- Las capas están separadas parcialmente: `core/repositories/catalogos.repository.ts` es actualmente un TODO y la lógica de catálogo vive en `core/services/catalogos.service.ts`.
- El control de rol no está centralizado de forma uniforme: el proxy regula páginas y algunos servicios comprueban rol; las rutas de API obtienen autenticación en distintas capas.
- Las cargas a Storage y las escrituras en tablas se realizan como pasos separados desde servicios; el código no muestra una transacción que abarque ambos sistemas.
- Las notificaciones se disparan en varios flujos sin esperarse (`.catch(...)`), de modo que la respuesta principal no garantiza su persistencia.
- El árbol local no contiene las migraciones ni el `schema.dbml` que `DATABASE.md` menciona. Por ello, las reglas de base de datos documentadas no pudieron verificarse contra DDL en este repositorio.
