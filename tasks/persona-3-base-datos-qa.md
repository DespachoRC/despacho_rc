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
