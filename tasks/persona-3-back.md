# Tareas - Wicho: Backend general

## Responsabilidad exclusiva

Wicho se encarga del backend general de autenticación, usuarios, catálogos, cotizaciones, actividades, carpetas y documentos.

La base de datos y el módulo completo de conversaciones y mensajes pertenecen exclusivamente a Pablo. El frontend general pertenece a Malaga.

## Rama sugerida

- `feature/wicho-backend-core`

## Principio de trabajo

- Respetar el patrón `route.ts -> service -> repository`.
- Validar payloads con Zod antes de llamar al repository.
- Usar `getAuthUser(request)` en rutas protegidas.
- Mantener respuestas `{ success, data }` o `{ success, error }`.
- No crear ni modificar tablas, migraciones, RLS, conversaciones o mensajes de Pablo.

## Actividades

### 1) Autenticación y usuarios

- Corregir login para rechazar usuarios inactivos con `403`.
- Implementar o completar perfil, consulta, baja lógica, reactivación y asignación de contador.
- Restringir cambios de `rol_id`, `organizacion_id`, `contador_id` y `estatus_id` por rol y organización.
- En `PUT /api/users/[id]/asignar-contador`, actualizar solo `usuarios.contador_id`; la migración/trigger de Pablo sincroniza `conversaciones.contador_id`.

### 2) Catálogos

- Completar `GET`, `POST` y `PATCH` de catálogos permitidos.
- Validar UUID, nombres duplicados, activos/inactivos y organización.
- Permitir reactivación sin borrar historial.

### 3) Cotizaciones

- Corregir `FijarPrecioSchema` para aceptar cero.
- Persistir `notas_cliente`.
- Implementar precio, respuesta, historial y reapertura con transiciones válidas.
- Crear actividad una sola vez cuando una cotización sea aceptada.

### 4) Actividades y documentos

- Corregir la firma de `ActividadesService.getResultados` y el build.
- Implementar resultados, insumos, estatus, documentos y entregables.
- Marcar completada solo después de guardar un entregable válido.
- Eliminar `mockClienteId` de uploads y validar propiedad del archivo.

### 5) Validación y pruebas

- Probar `401`, `403`, `404` y `422`.
- Probar acceso por organización y rol.
- Probar precio cero, notas persistidas, usuario inactivo, transiciones de cotización y generación única de actividad.
- Ejecutar `npm run build` y documentar errores restantes.
- Verificar que la asignación de contador funcione junto con el trigger de base de datos de Pablo, sin editar conversaciones desde este backend.

## Límites explícitos

- No implementar frontend general: pertenece a Malaga.
- No implementar base de datos, migraciones o RLS: pertenece a Pablo.
- No implementar conversaciones ni mensajes: su frontend y backend pertenecen a Pablo.

## Criterios de entrega

- Backend general compilando y con rutas documentadas.
- Schemas, services y repositories alineados con el frontend de Malaga.
- Reglas de autorización y errores verificadas.
- Sin cambios en el módulo de conversaciones/mensajes ni en la base de datos de Pablo.

## Merge strategy

- Merge independiente en `feature/wicho-backend-core`.
- Se integra mediante contratos estables con Malaga y Pablo.

---

## Registro de Cambios e Implementación Realizada (Wicho - Backend Core)

### 1. Corrección de Compilación en Resultados de Actividades
- **Qué se hizo**: Se corrigió la firma del controlador recibiendo `request` en `app/api/actividades/resultados/route.ts` y pasando `request` a `ActividadesService.getResultados(request)`. En `core/repositories/actividades.repository.ts`, se actualizó la consulta SQL cambiando la columna inexistente `created_at` por `fecha_creacion`.
- **Archivos modificados**:
  - [`app/api/actividades/resultados/route.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/app/api/actividades/resultados/route.ts)
  - [`core/repositories/actividades.repository.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/repositories/actividades.repository.ts)
- **Motivo**: `getResultados` requería el contexto del usuario autenticado para validar permisos/organización. Además, la discrepancia de nombres de columnas en PostgreSQL provocaba fallos de compilación (`npm run build`).

### 2. Persistencia de `notas_cliente` y Permitir Cotización a $0
- **Qué se hizo**:
  1. En `core/repositories/cotizaciones.repository.ts`, se incluyó la propiedad `notas_cliente: dto.notas_cliente ?? null` dentro del `INSERT` de la función `crear`.
  2. En `core/schemas/cotizacion.schema.ts`, se ajustó la regla Zod para `fijarPrecio` de `.positive()` a `.nonnegative()`.
- **Archivos modificados**:
  - [`core/repositories/cotizaciones.repository.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/repositories/cotizaciones.repository.ts)
  - [`core/schemas/cotizacion.schema.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/schemas/cotizacion.schema.ts)
- **Motivo**: Las observaciones enviadas por los clientes al solicitar cotizaciones se perdían al no insertarse en la BD. Por otro lado, la validación de precio impedía asignar $0 para servicios de cortesía o cotizaciones en promoción.

### 3. Autenticación: Bloqueo y Rechazo de Usuarios Inactivos (403)
- **Qué se hizo**: En `core/services/users.service.ts` (función `login`), tras validar credenciales mediante `signInWithPassword`, se realiza una consulta adicional a `usuarios` unida con `estatus_usuarios`. Si el estatus es `'inactivo'`, la sesión activa de Supabase es cerrada inmediatamente (`signOut()`) y se arroja un error que resulta en respuesta `403 Forbidden`.
- **Archivos modificados**:
  - [`core/services/users.service.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/services/users.service.ts)
- **Motivo**: Previamente, si un usuario era dado de baja lógicamente en la tabla `usuarios` pero conservaba acceso en Supabase Auth, podía seguir iniciando sesión y consumiendo la API.

### 4. Eliminación de Mocks y Corrección de Metadatos en Carpetas
- **Qué se hizo**:
  1. En `core/services/carpetas.service.ts`, se eliminó el ID de cliente estático (`mockClienteId`) y se implementó la resolución dinámica mediante `getAuthUser(request)`.
  2. Se corrigió el nombre del campo en la inserción de metadatos de documentos: `tipo_archivo_id` -> `categoria_documento_id`.
  3. En `app/api/carpetas/archivos/route.ts`, se actualizó la invocación para pasar el objeto `request`.
- **Archivos modificados**:
  - [`core/services/carpetas.service.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/services/carpetas.service.ts)
  - [`app/api/carpetas/archivos/route.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/app/api/carpetas/archivos/route.ts)
- **Motivo**: Eliminar hardcoding de UUIDs y asegurar que los archivos subidos pertenezcan y queden registrados a nombre del usuario en sesión con el esquema correcto de base de datos.

### 5. Creación e Implementación de Endpoints Faltantes
- **Qué se hizo**: Se crearon e integraron 4 nuevos endpoints con su flujo completo de Repository, Service y Route Handler:
  1. `GET /api/users/perfil`: Retorna el perfil estructurado del usuario autenticado (incluye joins de rol, estatus, organización y régimen fiscal).
  2. `PUT /api/users/[id]/reactivar`: Permite la reactivación lógica de usuarios en estado inactivo.
  3. `GET /api/cotizaciones/mis-cotizaciones`: Obtiene las cotizaciones asociadas al cliente en sesión.
  4. `GET /api/actividades/mis-actividades`: Obtiene la lista de actividades asignadas al contador en sesión.
- **Archivos agregados/modificados**:
  - [`app/api/users/perfil/route.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/app/api/users/perfil/route.ts) [NUEVO]
  - [`app/api/users/[id]/reactivar/route.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/app/api/users/[id]/reactivar/route.ts) [NUEVO]
  - [`app/api/cotizaciones/mis-cotizaciones/route.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/app/api/cotizaciones/mis-cotizaciones/route.ts) [NUEVO]
  - [`app/api/actividades/mis-actividades/route.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/app/api/actividades/mis-actividades/route.ts) [NUEVO]
  - [`core/repositories/usuarios.repository.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/repositories/usuarios.repository.ts)
  - [`core/services/users.service.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/services/users.service.ts)
  - [`core/repositories/cotizaciones.repository.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/repositories/cotizaciones.repository.ts)
  - [`core/services/cotizaciones.service.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/services/cotizaciones.service.ts)
  - [`core/repositories/actividades.repository.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/repositories/actividades.repository.ts)
  - [`core/services/actividades.service.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/services/actividades.service.ts)
- **Motivo**: Proporcionar las rutas necesarias requeridas por las pantallas del frontend para la consulta de información personal, reactivación de usuarios y páneles de trabajo de clientes y contadores.

### 6. Transiciones de Estatus y Reapertura Automática de Cotizaciones Rechazadas
- **Qué se hizo**: En `core/repositories/cotizaciones.repository.ts` (método `fijarPrecio`), se introdujo validación previa del estado de la cotización:
  - Si está `aceptada` o `cancelada`: lanza un error impidiendo cambiar el precio.
  - Si está `rechazada`: actualiza el precio y cambia automáticamente el estatus a `pendiente` para reabrir la negociación.
  - Si está `pendiente`: actualiza el precio manteniendo el estatus.
- **Archivos modificados**:
  - [`core/repositories/cotizaciones.repository.ts`](file:///c:/Users/luisp/Downloads/DESPACHOFULL/Despacho_RC/core/repositories/cotizaciones.repository.ts)
- **Motivo**: Evitar inconsistencias de negocio (como modificar precios de cotizaciones cerradas) y permitir un flujo continuo de re-negociación cuando el administrador genera una nueva propuesta de precio para una cotización rechazada por el cliente.

