# Análisis de Lógica de Negocio vs Implementación API — Despacho RC

> Generado el 2026-09-18. Cruza el documento de reglas de negocio con el código fuente actual.

---

## Leyenda

| Símbolo | Significado |
|---|---|
| ✅ | Implementado y cumple la regla |
| ⚠️ | Implementado parcialmente o con una inconsistencia detectable en código |
| ❌ | No implementado — falta código |
| 🐛 | Bug detectado en el código existente |

---

## Bloque 1 — Autenticación, Roles y Privacidad

### Reglas del documento

| Regla | Estado | Detalle |
|---|---|---|
| Validar credenciales y redirigir al panel del rol | ✅ | `POST /auth/login` delega a `UsersService.login()` que resuelve el rol dinámicamente. La página de login redirige según el rol devuelto |
| Rechazar usuarios inactivos en el login | ❌ | El login solo valida email/password. **Nunca consulta `estatus_id` del usuario**. Un usuario marcado como `inactivo` en `usuarios` puede iniciar sesión sin restricción |
| Cerrar sesión y borrar rastros de sesión | ✅ | `POST /auth/logout` llama a `supabase.auth.signOut()`. El frontend usa `window.location.replace` para limpiar el historial del navegador |
| Sesión expirada: borrar datos sin exposición | ⚠️ | El backend expira el token de Supabase automáticamente. Falta lógica en el frontend para detectar 401 en cualquier llamada y forzar logout inmediato antes de mostrar cualquier dato |
| Privacidad financiera del contador: nunca ver precios | ⚠️ | Los precios no se envían en `GET /actividades/:id/insumos` (solo notas y documentos). Pero no existe una validación explícita en el backend que impida al contador consultar directamente `GET /cotizaciones` |
| Contador pierde acceso si le quitan un cliente | ❌ | No hay lógica que verifique en tiempo real si el `contador_id` del cliente sigue siendo el del usuario autenticado. RLS cubre la parte de datos; falta manejo en el frontend para detectar acceso denegado y redirigir |
| Aislamiento del cliente ("burbuja") | ✅ | RLS en Supabase garantiza que el cliente solo vea sus propias cotizaciones, actividades, carpetas y documentos. El backend no expone datos cruzados |

### Endpoints relacionados

| Endpoint | Estado |
|---|---|
| `POST /auth/login` | ✅ Listo |
| `POST /auth/logout` | ✅ Listo |
| `POST /auth/recuperar-password` | ✅ Listo |
| `POST /auth/cambiar-password` | ✅ Listo |

### Bugs y gaps críticos detectados en código

> 🐛 **`UsersService.login` no verifica `estatus_id`.**  
> El método hace `signInWithPassword` y luego obtiene el rol, pero nunca consulta `usuarios.estatus_id`. Hay que agregar una consulta después del login para verificar que el usuario esté activo, y si no, llamar a `supabase.auth.signOut()` y lanzar un 403.

---

## Bloque 2 — Configuración Base y Catálogos

### Reglas del documento

| Regla | Estado | Detalle |
|---|---|---|
| No permitir nombres duplicados al crear | ❌ | `CatalogosService.create()` hace un INSERT directo sin verificar si ya existe un registro con ese nombre. Falta validación previa o manejo del error de constraint unique |
| Si el nombre existe pero está inactivo, sugerir reactivarlo | ❌ | No hay lógica que distinga entre "nombre duplicado activo" vs "nombre duplicado inactivo". Se necesita una consulta previa |
| Ocultar sin borrar (soft delete) | ✅ | `PATCH /catalogos/:tipo/:id` usa `toggleEstatus` que solo actualiza `activo: false`, nunca borra |
| Los registros inactivos no rompen historial | ✅ | Las cotizaciones y actividades guardan `actividad_catalogo_id` como FK; el registro nunca se borra, solo se desactiva |
| Reactivar elementos inactivos | ✅ | `toggleEstatus` soporta `activo: true` — funciona como reactivación |
| Bloquear formulario si catálogo vacío (sin activos) | ❌ | Es lógica de frontend. El backend necesita que `GET /catalogos/:tipo` soporte un filtro de `?soloActivos=true` para que el cliente pueda verificarlo. El service ya tiene el parámetro `soloActivos` implementado; solo falta el `route.ts` |

### Endpoints relacionados

| Endpoint | Estado |
|---|---|
| `GET /catalogos/:tipo` | ❌ Falta `route.ts` (service listo) |
| `POST /catalogos/:tipo` | ❌ Falta `route.ts` (service listo) |
| `PATCH /catalogos/:tipo/:id` | ❌ Falta `route.ts` (service listo) |

### Gaps detectados

> ❌ **Falta query param `?soloActivos`** en el `route.ts` de catálogos.  
> El `CatalogosService.getAll(tabla, soloActivos)` ya soporta el filtro. El route debe leerlo de `searchParams` y pasarlo.

> ❌ **Sin validación de nombre duplicado en `create`.**  
> Agregar consulta previa o capturar el error de violación de unique constraint de Postgres (código `23505`) y convertirlo en respuesta 409 con mensaje amigable.

---

## Bloque 3 — Gestión de Personal y Cartera

### Reglas del documento

| Regla | Estado | Detalle |
|---|---|---|
| Email único al registrar | ✅ | Supabase Auth impide emails duplicados. `UserRepository.CrearUsuario` captura `already registered` y lanza error legible |
| Clientes nacen sin contador | ✅ | `contador_id` es opcional en el schema de creación; si no se envía, va como `null` |
| Contadores nacen sin clientes | ✅ | No hay asignación automática; el admin lo asigna explícitamente |
| Inactivar cliente: cancelar trabajos en curso | ❌ | `UsersService.bajaLogica` solo actualiza `estatus_id` a inactivo. No cancela actividades ni cotizaciones activas del cliente |
| Inactivar cliente: conservar historial | ✅ | Nunca se borra nada — solo `estatus_id` cambia |
| Inactivar contador: pausar (no cancelar) actividades | ❌ | No hay lógica que cambie estatus de actividades a `bloqueada` al inactivar un contador |
| Inactivar contador: alerta de "clientes huérfanos" | ❌ | No existe endpoint que devuelva los clientes afectados antes o después de inactivar. Falta al menos un campo en la respuesta del DELETE |
| Asignar/cambiar contador: cambio instantáneo | ✅ | `PUT /users/:id/asignar-contador` (service listo) actualiza `contador_id` en la tabla directamente |
| Nuevo contador hereda archivos, progreso y chats previos | ✅ | Al cambiar `contador_id`, todas las FK de actividades, documentos y conversaciones apuntan al cliente — el nuevo contador los ve automáticamente por RLS |
| Contador anterior pierde acceso inmediatamente | ✅ | Al cambiar `contador_id`, RLS deja de darle acceso al anterior contador. No requiere código extra |
| Reactivar usuario: recupera acceso | ❌ | No existe `PUT /users/:id/reactivar` o equivalente. La baja lógica es irreversible en la API actual |
| Contador reactivado regresa con cartera en cero | ❌ | No hay lógica que limpie `contador_id` de los clientes al reactivar un contador |

### Endpoints relacionados

| Endpoint | Estado |
|---|---|
| `GET /users` | ✅ Listo |
| `POST /users` | ✅ Listo |
| `GET /users/contadores` | ✅ Listo |
| `GET /users/:id` | ❌ Falta `route.ts` (service listo) |
| `DELETE /users/:id` | ❌ Falta `route.ts` (service listo) |
| `PUT /users/:id/asignar-contador` | ❌ Falta `route.ts` (service listo) |
| `PUT /users/:id/reactivar` | ❌ No existe (ni service ni route) |
| `GET /users/:id/clientes-huerfanos` | ❌ No existe |
| `GET /users/perfil` | ❌ No existe (el usuario autenticado no puede ver su propio perfil) |

### Gaps detectados

> ❌ **Falta cascade en baja de cliente.**  
> Al inactivar un cliente, el service debe buscar sus actividades con estatus `pendiente` o `en_proceso` y cambiarlas a `cancelada`. También cancelar sus cotizaciones `pendientes`.

> ❌ **Falta cascade en baja de contador.**  
> Al inactivar un contador, cambiar sus actividades activas a `bloqueada` (no cancelar). La respuesta del endpoint debe incluir la lista de clientes afectados.

> ❌ **Falta endpoint de reactivación.**  
> Crear `PUT /users/:id/reactivar` que cambie `estatus_id` a activo. Si es contador, limpiar `contador_id` en todos los clientes que lo tenían asignado.

---

## Bloque 4 — El Bucle Financiero (Cotizaciones)

### Reglas del documento

| Regla | Estado | Detalle |
|---|---|---|
| Cliente envía solicitud de cotización | ✅ | `POST /cotizaciones` implementado. Valida con Zod, asigna cliente y org automáticamente |
| Admin recibe solicitudes y fija precio | ⚠️ | `PUT /cotizaciones/:id/precio` — service listo, falta `route.ts`. Pero ver bug de precio cero |
| El precio puede ser cero (cortesía) | 🐛 | `FijarPrecioSchema` usa `.positive()` — **rechaza precios de 0**. Debe cambiarse a `.nonnegative()` |
| Cliente acepta: precio se bloquea para siempre | ⚠️ | Al aceptar, solo cambia el `estatus_id`. No hay campo `precio_bloqueado` ni restricción que impida editar el precio después de aceptar. Falta validar en `fijarPrecio` que la cotización esté en estado `pendiente` antes de actualizar |
| Al aceptar: trigger crea actividad automáticamente | ✅ | El trigger `trg_cotizacion_aceptada` en Supabase maneja esto |
| Cliente rechaza: admin puede modificar precio y reenviar | ⚠️ | El precio se puede modificar, pero el `fijarPrecio` no cambia el estatus a `pendiente` de nuevo. Si está rechazada, el admin debe poder reabrir la negociación cambiando el estatus explícitamente |
| El contador nunca ve la negociación | ✅ | `getInsumos` no devuelve precio ni historial de cotización. RLS protege la tabla de cotizaciones |
| Caducidad de cotizaciones | ❌ | No existe lógica de expiración. No hay campo `fecha_expiracion` en el schema ni job que marque cotizaciones como `caducada` |
| Chat admin ↔ cliente (exclusivo, sin contadores) | ❌ | No existe ningún endpoint de conversaciones. Ver Bloque 5 |
| Cliente ve historial de sus cotizaciones | ❌ | No existe `GET /cotizaciones/mis-cotizaciones` o similar para el cliente |
| `notas_cliente` se guarda en la cotización | 🐛 | `CreateCotizacionSchema` acepta `notas_cliente`, pero `CotizacionesRepository.create()` **no lo incluye en el INSERT**. El campo se pierde |

### Endpoints relacionados

| Endpoint | Estado |
|---|---|
| `GET /cotizaciones` | ✅ Listo (admin — pendientes) |
| `POST /cotizaciones` | ✅ Listo |
| `PUT /cotizaciones/:id/precio` | ❌ Falta `route.ts` (service listo) |
| `PUT /cotizaciones/:id/respuesta` | ❌ Falta `route.ts` (service listo) |
| `GET /cotizaciones/mis-cotizaciones` | ❌ No existe (cliente necesita ver sus cotizaciones) |
| `PUT /cotizaciones/:id/reabrir` | ❌ No existe (para negociación tras rechazo) |

### Bugs críticos detectados

> 🐛 **`FijarPrecioSchema` rechaza precio 0.**  
> Línea: `core/schemas/cotizacion.schema.ts:15` — cambiar `.positive()` a `.nonnegative()`.

> 🐛 **`notas_cliente` nunca se guarda.**  
> Línea: `core/repositories/cotizaciones.repository.ts:36` — agregar `notas_cliente: dto.notas_cliente ?? null` al INSERT.

> 🐛 **`fijarPrecio` no valida el estado actual de la cotización.**  
> Si la cotización ya fue aceptada, el precio no debería poder modificarse. Agregar validación previa en el repository o service.

---

## Bloque 5 — El Bucle Operativo (Ejecución)

### Reglas del documento

| Regla | Estado | Detalle |
|---|---|---|
| Actividad llega al contador como "Pendiente" | ✅ | El trigger crea la actividad con estatus `pendiente` |
| Primera interacción del contador → "En Proceso" automáticamente | ❌ | `GET /actividades/:id/insumos` no cambia el estatus automáticamente al consultar. Habría que agregar esta lógica en el service de `getInsumos` |
| Cliente ve estatus actualizado | ⚠️ | `GET /actividades/resultados` devuelve el estatus, pero falta `route.ts` |
| Chat operativo contador ↔ cliente (sin admin) | ❌ | No existe ningún endpoint de conversaciones o mensajes |
| Carpeta general: contador solo lectura | ❌ | No hay restricción en la API que le impida al contador hacer POST en `carpetas/archivos`. RLS de Supabase puede cubrirlo, pero el endpoint no hace validación de rol explícita |
| Contador sube entregable final → actividad "Completada" | ✅ | `ActividadesService.subirEntregable()` marca la actividad como `completada` y sube el archivo. Falta `route.ts` |
| Cliente descarga el entregable | ⚠️ | `getResultados` devuelve la `ruta_archivo`, pero no hay endpoint que genere una URL firmada de Supabase Storage para la descarga segura |
| Contador puede ver el listado de sus actividades | ❌ | No existe `GET /actividades/mis-actividades` para el contador |

### Endpoints relacionados

| Endpoint | Estado |
|---|---|
| `GET /actividades/resultados` | ❌ Falta `route.ts` (service listo) |
| `GET /actividades/:id/insumos` | ❌ Falta `route.ts` (service listo) |
| `PUT /actividades/:id/estatus` | ❌ Falta `route.ts` (service listo) |
| `POST /actividades/:id/documentos` | ❌ Falta `route.ts` (service listo) |
| `POST /actividades/:id/entregables` | ❌ Falta `route.ts` (service listo) |
| `GET /actividades/mis-actividades` | ❌ No existe (contador necesita ver sus actividades) |
| `GET /documentos/:id/url-firmada` | ❌ No existe (descarga segura desde Storage) |
| `GET /conversaciones` | ❌ No existe |
| `POST /conversaciones` | ❌ No existe |
| `GET /conversaciones/:id/mensajes` | ❌ No existe |
| `POST /conversaciones/:id/mensajes` | ❌ No existe |

### Gaps detectados

> ❌ **No existe el sistema de conversaciones/mensajes.** Es el gap más grande. Implica crear:
> - `ConversacionesRepository` + `ConversacionesService` + routes para crear conversación y enviar/recibir mensajes
> - Lógica de tipo `contador_cliente` vs `cliente_admin` según los participantes
> - Restricción: al cambiar de contador en `asignar-contador`, el nuevo `contador_id` debe poder ver el historial del chat previo

> ❌ **`ActividadesSchema` no incluye `completada` como estatus válido.**  
> `ActualizarEstatusSchema` permite `en_proceso` y `bloqueada`, pero no `completada`. Esto es correcto porque `completada` lo asigna el service internamente al subir el entregable. Sin embargo, hay que asegurarse de que el contador no pueda marcar manualmente como `completada` sin subir el archivo.

---

## Bloque 6 — Casos Borde y Excepciones

### Reglas del documento

| Regla | Estado | Detalle |
|---|---|---|
| Contador corrige entregable equivocado | ⚠️ | `subirArchivoStorage` usa `upsert: false` — si el archivo ya existe en la misma ruta, falla. Hay que cambiar a `upsert: true` o generar siempre nombre único (actualmente ya genera nombre único con `Date.now()`, pero la actividad queda como `completada` con el documento anterior) |
| Al corregir entregable, avisar al cliente | ❌ | Hay notificaciones para la primera entrega final, pero no existe un flujo de corrección/reemplazo que genere un aviso específico |
| Cambio de contador en medio de chat → chat se hereda | ✅ | Por diseño de la DB: las conversaciones apuntan al `cliente_id`, y la FK de `contador_id` en `conversaciones` apunta al nuevo. Al cambiar `contador_id` en `usuarios`, el historial queda accesible. Sin embargo, falta actualizar `conversaciones.contador_id` cuando se hace `asignar-contador` — actualmente no lo hace |
| Contador anterior pierde acceso al chat inmediatamente | ⚠️ | RLS debería cubrir esto, pero `conversaciones.contador_id` no se actualiza automáticamente al reasignar. Hay que agregar esa actualización en `UserRepository.asignarContador` |

---

## Tabla de conectabilidad (¿ya se puede conectar al frontend?)

| Endpoint | ¿Conectar ya? | Condición |
|---|---|---|
| `POST /auth/login` | ✅ Sí | Agregar verificación de `estatus_id` activo antes de producción |
| `POST /auth/logout` | ✅ Sí | |
| `POST /auth/recuperar-password` | ✅ Sí | |
| `POST /auth/cambiar-password` | ✅ Sí | |
| `GET /users` | ✅ Sí | |
| `POST /users` | ✅ Sí | |
| `GET /users/contadores` | ✅ Sí | |
| `GET /users/:id` | ⚠️ Casi | Solo falta agregar `route.ts` |
| `DELETE /users/:id` | ⚠️ Casi | Falta `route.ts` + cascade de actividades/cotizaciones |
| `PUT /users/:id/asignar-contador` | ⚠️ Casi | Falta `route.ts` + actualizar `conversaciones.contador_id` |
| `GET /catalogos/:tipo` | ⚠️ Casi | Solo falta `route.ts` + query param `?soloActivos` |
| `POST /catalogos/:tipo` | ⚠️ Casi | Falta `route.ts` + validación de duplicados |
| `PATCH /catalogos/:tipo/:id` | ⚠️ Casi | Solo falta `route.ts` |
| `GET /cotizaciones` | ✅ Sí | |
| `POST /cotizaciones` | ⚠️ Casi | Fix bug de `notas_cliente` |
| `PUT /cotizaciones/:id/precio` | ⚠️ Casi | Falta `route.ts` + fix de precio 0 + validar estado previo |
| `PUT /cotizaciones/:id/respuesta` | ⚠️ Casi | Solo falta `route.ts` |
| `GET /actividades/resultados` | ⚠️ Casi | Solo falta `route.ts` |
| `GET /actividades/:id/insumos` | ⚠️ Casi | Falta `route.ts` + auto-cambio a `en_proceso` |
| `PUT /actividades/:id/estatus` | ⚠️ Casi | Solo falta `route.ts` |
| `POST /actividades/:id/documentos` | ⚠️ Casi | Solo falta `route.ts` |
| `POST /actividades/:id/entregables` | ⚠️ Casi | Falta `route.ts` + lógica de reemplazo |
| `POST /carpetas/archivos` | 🐛 No | Fix del `mockClienteId` hardcodeado |

---

## Endpoints que no existen y deben crearse desde cero

Ordenados por prioridad de flujo:

| Prioridad | Endpoint | Para quién | Por qué es necesario |
|---|---|---|---|
| 🔴 Alta | `GET /users/perfil` | Todos | Cada rol necesita ver su propio nombre, RFC, etc. en el header |
| 🔴 Alta | `GET /cotizaciones/mis-cotizaciones` | Cliente | Sin esto el cliente no puede ver el estado de sus solicitudes |
| 🔴 Alta | `GET /actividades/mis-actividades` | Contador | Sin esto el contador no ve su bandeja de trabajo |
| 🔴 Alta | `PUT /users/:id/reactivar` | Admin | Reactivación de usuarios deshabilitados |
| 🟡 Media | `GET /documentos/:id/url-firmada` | Cliente/Contador | Descarga segura desde Supabase Storage |
| 🟡 Media | `POST /conversaciones` | Admin/Cliente/Contador | Crear hilo de comunicación |
| 🟡 Media | `GET /conversaciones` | Admin/Cliente/Contador | Listar conversaciones del usuario autenticado |
| 🟡 Media | `GET /conversaciones/:id/mensajes` | Participantes | Leer mensajes del hilo |
| 🟡 Media | `POST /conversaciones/:id/mensajes` | Participantes | Enviar mensaje |
| 🟡 Media | `PUT /cotizaciones/:id/reabrir` | Admin | Reactivar cotización rechazada para re-negociar |
| 🟢 Baja | `GET /users/:id/clientes-huerfanos` | Admin | Antes de inactivar un contador, ver clientes afectados |

---

## Bugs a corregir antes de conectar al frontend

| Bug | Archivo | Línea aprox. | Fix |
|---|---|---|---|
| 🐛 Login no verifica `estatus_id` | `core/services/users.service.ts` | 13 | Consultar `usuarios.estatus_id` y rechazar si es inactivo |
| 🐛 `notas_cliente` se pierde en el INSERT | `core/repositories/cotizaciones.repository.ts` | 43 | Agregar campo al INSERT |
| 🐛 Precio 0 rechazado por Zod | `core/schemas/cotizacion.schema.ts` | 15 | `.positive()` → `.nonnegative()` |
| 🐛 `fijarPrecio` no valida estado previo | `core/repositories/cotizaciones.repository.ts` | 58 | Verificar que `estatus` sea `pendiente` o `rechazada` |
| 🐛 `carpetas.service.ts` usa mock UUID | `core/services/carpetas.service.ts` | 5 | Reemplazar con `getAuthUser(request)` |
| 🐛 `asignar-contador` no actualiza conversaciones | `core/repositories/usuarios.repository.ts` | 166 | Actualizar `conversaciones.contador_id` en el mismo método |

---

## Actualización — cobertura de notificaciones en cotizaciones y asignaciones

La siguiente cobertura corresponde a la implementación actual; las tablas anteriores de este análisis son una fotografía histórica y pueden describir otros gaps ya resueltos.

| Evento | Destinatarios | Condición |
|---|---|---|
| Cliente envía una cotización | Admins/owners de su organización, excepto el actor | Solo después de crear la cotización |
| Admin fija o actualiza el precio | Cliente y admins/owners de la organización, excepto el actor | Solo después de guardar el precio |
| Cliente acepta o rechaza | Admins/owners de la organización, excepto el actor | Solo desde una cotización pendiente con precio |
| Admin rechaza | Cliente y admins/owners de la organización, excepto el actor | Solo desde una cotización pendiente |
| Cliente acepta una cotización | Contador asignado al cliente y contadores asignados a actividades | Cada contador recibe un solo aviso; para el asignado al cliente se envía un aviso aunque no tenga actividades en la cotización |
| Se asigna o reasigna un contador | Nuevo contador y cliente | No se envía un aviso repetido si ya era el mismo contador |

Las notificaciones se insertan en `notificaciones`, que alimenta la campana y el toast Realtime del encabezado. En las transiciones de cotización no se inserta una notificación para quien ejecuta la acción, evitando duplicar el toast de confirmación de la interfaz. La entrega depende de que las políticas RLS permitan las inserciones para cada destinatario y de que la tabla esté habilitada en la publicación Realtime de Supabase; el esquema remoto y esas políticas no se han verificado desde este checkout.
