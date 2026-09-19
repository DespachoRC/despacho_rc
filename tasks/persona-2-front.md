# Tareas - Malaga: Frontend general

## Responsabilidad exclusiva

Malaga se encarga del frontend general: autenticación visual, layouts, dashboards, usuarios, catálogos, cotizaciones, actividades, carpetas y consumo de la API.

El backend general pertenece a Wicho. Conversaciones y mensajes, incluyendo su frontend y backend, pertenecen exclusivamente a Pablo.

## Rama sugerida

- `feature/malaga-frontend`

## Actividades

### 1) Login y sesión

- Revisar [app/auth/login/page.tsx](../app/auth/login/page.tsx).
- Validar email y password antes del request.
- Manejar estados idle, loading, success y errores `401`/`403`.
- Redirigir según `role` y crear guarda para rutas privadas.

### 2) Layout y perfil

- Revisar [app/components/layout/Header.tsx](../app/components/layout/Header.tsx).
- Consumir el perfil real y eliminar nombre/rol hardcodeados.
- Consumir `GET /api/users/perfil` para cargar nombre, RFC, rol y organización.
- Revisar [app/components/layout/Sidebar.tsx](../app/components/layout/Sidebar.tsx).
- Mostrar navegación según `owner`, `admin`, `contador` y `cliente`.

### 3) Dashboards

- Conectar métricas, usuarios, catálogos, tareas y carpetas del admin.
- Conectar carga documental, presupuestos y resultados del cliente.
- Conectar clientes y actividades del contador.
- Implementar estados loading, error, empty y success.
- El chat se consume mediante los contratos de Pablo y no se modifica desde esta rama.

### 4) Cotizaciones y actividades

- Preparar formularios y tablas para los payloads reales.
- Consumir `POST /api/cotizaciones`, `GET /api/cotizaciones/mis-cotizaciones`, `PUT /api/cotizaciones/[id]/precio`, `PUT /api/cotizaciones/[id]/respuesta` y `PUT /api/cotizaciones/[id]/reabrir`.
- Consumir `GET /api/actividades/resultados`, `GET /api/actividades/mis-actividades`, `GET /api/actividades/[id]/insumos`, `PUT /api/actividades/[id]/estatus`, `POST /api/actividades/[id]/documentos` y `POST /api/actividades/[id]/entregables`.
- Validar errores de API y eliminar datos mock permanentes.

### 5) Archivos y carpetas

- Conectar carga de archivos al usuario autenticado.
- Mostrar progreso, archivo subido, lista vacía y error.
- Consumir `POST /api/carpetas/archivos`, `GET /api/carpetas`, `GET /api/carpetas/[id]/documentos` y `GET /api/documentos/[id]/url-firmada` sin exponer rutas internas de Storage.

### 6) Usuarios y catálogos

- Consumir `GET /api/users`, `POST /api/users`, `GET /api/users/contadores`, `GET /api/users/[id]`, `DELETE /api/users/[id]`, `PUT /api/users/[id]/asignar-contador` y `PUT /api/users/[id]/reactivar`.
- Consumir `GET /api/catalogos/[tipo]`, `POST /api/catalogos/[tipo]` y `PATCH /api/catalogos/[tipo]/[id]`.
- Mostrar clientes huérfanos usando `GET /api/users/[id]/clientes-huerfanos` cuando el backend lo habilite.

## Contratos de integración

- Mantener tipos locales para `UserProfile`, `Cotizacion`, `Actividad` y `ArchivoSubido`.
- Respetar `{ success, data }` y `{ success, error }`.
- Usar los nombres de campo del backend: `fecha_creacion` para entidades y `fecha_envio` para mensajes.
- No crear rutas, schemas, services o repositories de conversaciones y mensajes.

## Criterios de entrega

- Frontend general conectado a los contratos del backend de Wicho.
- Login, guardas, header, sidebar y dashboards sin datos hardcodeados críticos.
- Estados de carga y error implementados.
- El módulo de conversaciones se integra consumiendo la API de Pablo sin duplicar lógica.

## Merge strategy

- Merge independiente en `feature/malaga-frontend`.
- Depende únicamente de contratos documentados; no modifica backend ni base de datos.
