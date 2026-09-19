# Estado actual de la API — Despacho RC

> Análisis generado el 2026-09-18. Basado en el código fuente, `API.md` y `DATABASE.md`.

---

## Arquitectura y reglas que sigue el proyecto

El proyecto usa una arquitectura de **3 capas** que debe respetarse siempre:

```
app/api/.../route.ts       ← Capa HTTP: valida input, delega al service, formatea respuesta
core/services/*.service.ts ← Capa de negocio: orquesta, verifica auth, llama al repo
core/repositories/*.ts     ← Capa de datos: solo consultas SQL a Supabase, sin lógica
```

**Reglas que se cumplen:**
- Los `route.ts` no hacen SQL directo — delegan siempre a un `Service`
- Los `Service` usan `getAuthUser(request)` para verificar autenticación antes de operar
- Los `Repository` usan `createClient()` (cliente SSR con cookies) — nunca hardcodean claves
- La validación de inputs se hace con **Zod** en el `route.ts` antes de llamar al service
- Los errores se capturan en el `route.ts` y devuelven JSON estructurado `{ success, error }`
- No hay hardcoding de roles, UUIDs ni credenciales en el código

---

## Resumen por módulo

### 🟢 Implementado y funcional
### 🟡 Carpeta creada pero route.ts vacío (estructura lista, falta código)
### 🔴 No existe ni la carpeta

---

## AUTH — `app/api/auth/`

| Endpoint | Método | Estado | Quién lo usa | Qué hace |
|---|---|---|---|---|
| `/auth/login` | POST | 🟢 Implementado | Todos | Autentica con email/password. Usa `UsersService.login()` que resuelve el rol dinámicamente desde la tabla `usuarios` → `roles`. Devuelve `{ user, role, access_token, refresh_token }` |
| `/auth/logout` | POST | 🟢 Implementado | Todos | Llama a `supabase.auth.signOut()`. Devuelve `{ success: true }` |
| `/auth/singup` | POST | 🟢 Implementado | Solo developers | Registra un admin. Usa `UsersService.crearAdmin()` con validación Zod. El trigger de Supabase crea el perfil en `public.usuarios` automáticamente |
| `/auth/recuperar-password` | POST | 🟢 Implementado | Todos | Envía email de recuperación con `supabase.auth.resetPasswordForEmail()` |
| `/auth/cambiar-password` | POST | 🟢 Implementado | Usuarios autenticados | Verifica password actual y actualiza. Usa `getAuthUser()` para protegerlo |

**⚠️ Nota:** El endpoint `/auth/singup` tiene un typo en el nombre de la carpeta (debería ser `signup`). No afecta el funcionamiento pero vale la pena unificarlo eventualmente.

---

## USUARIOS — `app/api/users/`

| Endpoint | Método | Estado | Quién lo usa | Qué hace |
|---|---|---|---|---|
| `GET /users` | GET | 🟢 Implementado | Admin | Lista todos los usuarios de la organización del admin autenticado. Usa `getAuthUser` + `get_org_id_repository` internamente |
| `POST /users` | POST | 🟢 Implementado | Admin | Crea un cliente o contador. Valida con `CreateUserSchema` (Zod). El trigger de Supabase crea el perfil en `public.usuarios` |
| `GET /users/contadores` | GET | 🟢 Implementado | Admin | Lista contadores activos de la organización |
| `GET /users/:id` | GET | 🟡 Carpeta vacía | Admin | **Falta `route.ts`**. El service `UsersService.getById()` ya existe |
| `DELETE /users/:id` | DELETE | 🟡 Carpeta vacía | Admin | **Falta `route.ts`**. El service `UsersService.bajaLogica()` ya existe |
| `PUT /users/:id/asignar-contador` | PUT | 🟡 Carpeta vacía | Admin | **Falta `route.ts`**. El service `UsersService.asignarContador()` ya existe |

---

## CATÁLOGOS — `app/api/catalogos/`

Tablas válidas: `regimenes_fiscales`, `especialidad_contador`, `catalogo_actividades`, `categoria_documentos`

| Endpoint | Método | Estado | Quién lo usa | Qué hace |
|---|---|---|---|---|
| `GET /catalogos/:tipo` | GET | 🟡 Carpeta vacía | Todos autenticados | **Falta `route.ts`**. `CatalogosService.getAll()` ya existe, soporta filtro de activos |
| `POST /catalogos/:tipo` | POST | 🟡 Carpeta vacía | Admin/Owner | **Falta `route.ts`**. `CatalogosService.create()` ya existe |
| `PATCH /catalogos/:tipo/:id` | PATCH | 🟡 Carpeta vacía | Admin/Owner | **Falta `route.ts`**. `CatalogosService.toggleEstatus()` ya existe |

> El service ya tiene whitelist de tablas permitidas — cualquier `:tipo` que no esté en la lista lanza error automáticamente.

---

## COTIZACIONES — `app/api/cotizaciones/`

| Endpoint | Método | Estado | Quién lo usa | Qué hace |
|---|---|---|---|---|
| `GET /cotizaciones` | GET | 🟢 Implementado | Admin | Lista cotizaciones pendientes de la organización |
| `POST /cotizaciones` | POST | 🟢 Implementado | Cliente | Crea nueva solicitud. Valida con `CreateCotizacionSchema`. Asigna `cliente_id` y `organizacion_id` automáticamente del usuario autenticado |
| `PUT /cotizaciones/:id/precio` | PUT | 🟡 Carpeta vacía | Admin | **Falta `route.ts`**. `CotizacionesService.fijarPrecio()` ya existe |
| `PUT /cotizaciones/:id/respuesta` | PUT | 🟡 Carpeta vacía | Cliente | **Falta `route.ts`**. `CotizacionesService.responderCotizacion()` ya existe. Al aceptar, el **trigger de Supabase** crea la actividad automáticamente |

---

## ACTIVIDADES — `app/api/actividades/`

| Endpoint | Método | Estado | Quién lo usa | Qué hace |
|---|---|---|---|---|
| `GET /actividades/resultados` | GET | 🟡 Carpeta vacía | Cliente | **Falta `route.ts`**. `ActividadesService.getResultados()` ya existe |
| `GET /actividades/:id/insumos` | GET | 🟡 Carpeta vacía | Contador | **Falta `route.ts`**. `ActividadesService.getInsumos()` ya existe |
| `PUT /actividades/:id/estatus` | PUT | 🟡 Carpeta vacía | Contador | **Falta `route.ts`**. `ActividadesService.actualizarEstatus()` ya existe |
| `POST /actividades/:id/documentos` | POST | 🟡 Carpeta vacía | Cliente | **Falta `route.ts`**. `ActividadesService.subirDocumentoCliente()` ya existe. Sube a Supabase Storage en `documentos/actividades/:id/` |
| `POST /actividades/:id/entregables` | POST | 🟡 Carpeta vacía | Contador | **Falta `route.ts`**. `ActividadesService.subirEntregable()` ya existe. Marca la actividad como completada automáticamente |

---

## CARPETAS — `app/api/carpetas/`

| Endpoint | Método | Estado | Quién lo usa | Qué hace |
|---|---|---|---|---|
| `POST /carpetas/archivos` | POST | ⚠️ Parcial | Cliente | El `route.ts` existe pero **usa un `mockClienteId` hardcodeado** — no está conectado a `getAuthUser`. Necesita completarse |

> **Nota importante:** El service de carpetas tiene un comentario que dice `// mock temporal hasta que el middleware de auth este listo`. Ya está listo — hay que reemplazar el mock con `getAuthUser(request)`.

---

## Qué NO existe aún (ni carpeta, ni service, ni route)

Funcionalidades que están en la base de datos pero no tienen ningún endpoint implementado:

| Funcionalidad | Tablas involucradas | Quién la necesitaría |
|---|---|---|
| **Conversaciones** | `conversaciones`, `mensajes` | Cliente ↔ Contador, Cliente ↔ Admin |
| **Listar actividades del contador** | `actividades` | Contador (ver sus actividades activas) |
| **Listar cotizaciones del cliente** | `cotizaciones` | Cliente (ver su historial) |
| **Perfil del usuario autenticado** | `usuarios` | Todos (ver/editar su propio perfil) |
| **Lista de actividades del catálogo por categoría** | `lista_actividades`, `categorias` | Cliente (al crear cotización) |
| **Carpetas del cliente** | `carpetas` | Cliente (CRUD de sus carpetas) |
| **Documentos de una carpeta** | `documentos` | Cliente (ver docs en carpeta) |

---

## Resumen ejecutivo

| Estado | Cantidad | Detalle |
|---|---|---|
| 🟢 Implementados y funcionales | **10** | Auth completo + users GET/POST/contadores + cotizaciones GET/POST |
| 🟡 Service listo, falta route.ts | **11** | Users id/delete/asignar + catálogos 3 + cotizaciones 2 + actividades 5 |
| ⚠️ Parcial / necesita corrección | **1** | `carpetas/archivos` (mock hardcodeado) |
| 🔴 Sin implementar (ni service) | **7+** | Conversaciones, perfil, catálogo por categoría, carpetas CRUD |

**Lo más urgente para desbloquear el flujo principal:**
1. `PUT /cotizaciones/:id/precio` — para que el admin pueda aprobar cotizaciones
2. `PUT /cotizaciones/:id/respuesta` — para que el cliente acepte y se genere la actividad
3. `GET /actividades/resultados` — para que el cliente vea sus actividades
4. `PUT /actividades/:id/estatus` — para que el contador actualice progreso
5. `GET /catalogos/:tipo` — para poblar los selects del formulario de cotización
