# Tareas - Pablo: Base de datos y conversaciones/mensajes

## Responsabilidad exclusiva

Pablo se encarga de:

- base de datos, integridad, migraciones, RLS y seeds;
- frontend de conversaciones y mensajes;
- backend de conversaciones y mensajes.

Pablo no implementa el frontend general de login, dashboards, catálogos, cotizaciones ni actividades. Ese frontend pertenece a Malaga.

## Rama sugerida

- `feature/pablo-database-conversations`

## 1) Base de datos, seguridad e integridad

### Actividades

1. Revisar [DATABASE.md](../DATABASE.md), [BUSINESS_LOGIC_GAP.md](../BUSINESS_LOGIC_GAP.md) y confirmar la ubicación real de las migraciones; si no están versionadas en el workspace, crearlas en la ruta de migraciones definida por el proyecto.
2. Confirmar que `conversaciones` y `mensajes` tengan claves foráneas, timestamps, índices y relaciones consistentes con usuarios, clientes, contadores, cotizaciones y actividades.
3. Crear o corregir migraciones para evitar conversaciones huérfanas y mensajes sin conversación o remitente válido.
4. Reforzar RLS para que cada usuario solo consulte conversaciones y mensajes autorizados.
5. Validar reglas por tipo: `contador_cliente` requiere cliente y contador; `cliente_admin` requiere cliente y admin; no se permiten organizaciones diferentes.
6. Revisar índices para listar conversaciones por participante y mensajes por `conversacion_id` ordenados por `fecha_envio`.
7. Revisar el seed para que sea idempotente y documentar migraciones necesarias para producción.
8. Crear una migración o trigger que sincronice `conversaciones.contador_id` cuando cambie `usuarios.contador_id`; debe conservar el historial, otorgar acceso al nuevo contador y revocar el acceso anterior sin que Wicho modifique tablas de conversaciones.

### Criterios de aceptación de base de datos

- Las migraciones aplican en una base limpia y no destruyen datos existentes.
- RLS bloquea accesos entre organizaciones y usuarios no participantes.
- No existen registros huérfanos en conversaciones o mensajes.

## 2) Frontend de conversaciones y mensajes

### Archivos objetivo

- [app/components/ui/ChatBox.tsx](../app/components/ui/ChatBox.tsx)
- componentes o páginas de dashboard que monten el chat;
- cliente de API para conversaciones y mensajes.

### Actividades

1. Refactorizar `ChatBox` para recibir conversaciones y mensajes reales mediante props tipadas, eliminando mensajes locales permanentes.
2. Crear el cliente de API para `GET/POST /api/conversaciones` y `GET/POST /api/conversaciones/[id]/mensajes`.
3. Crear la vista de listado de conversaciones y conversación activa.
4. Implementar estados de carga, vacío, error, envío y respuesta exitosa.
5. Validar mensajes no vacíos y conservar el texto si la API falla.
6. Ordenar mensajes por `fecha_envio`, diferenciar remitentes y desplazar el panel al mensaje más reciente.
7. Evitar que respuestas antiguas de un hilo aparezcan al cambiar de conversación.
8. Probar cliente, contador, admin y owner con los permisos definidos por el backend.

### Modelos del frontend

```ts
type Conversacion = {
  id: string;
  tipo: "contador_cliente" | "cliente_admin";
  cliente_id: string;
  contador_id?: string;
  admin_id?: string;
  cotizacion_id?: string;
  actividad_id?: string;
  ultimo_mensaje?: string;
  fecha_ultimo_mensaje?: string;
};

type Mensaje = {
  id: string;
  conversacion_id: string;
  remitente_id: string;
  autor_tipo: "cliente" | "contador" | "admin" | "owner";
  contenido: string;
  fecha_envio: string;
  leido?: boolean;
};
```

## 3) Backend de conversaciones y mensajes

### Archivos objetivo

- `core/schemas/conversacion.schema.ts`
- `core/repositories/conversaciones.repository.ts`
- `core/services/conversaciones.service.ts`
- `app/api/conversaciones/route.ts`
- `app/api/conversaciones/[id]/mensajes/route.ts`

### Actividades

1. Crear schemas Zod para creación de conversación, envío de mensaje y parámetros UUID.
2. Crear el repository para crear/listar conversaciones, obtener una conversación, consultar mensajes ordenados e insertar mensajes.
3. Crear el service para autorización, organización, participantes y reglas de negocio.
4. Implementar `GET` y `POST` en `/api/conversaciones`.
5. Implementar `GET` y `POST` en `/api/conversaciones/[id]/mensajes`.
6. Usar `getAuthUser(request)` en todas las rutas protegidas.
7. Tomar `remitente_id` del usuario autenticado, nunca del body.
8. Rechazar usuarios no participantes, organizaciones diferentes, conversaciones inexistentes y mensajes vacíos.
9. Incluir el último mensaje al listar conversaciones sin exponer otros hilos.
10. Responder con `{ success: true, data }` o `{ success: false, error }` y códigos `401`, `403`, `404` y `422`.

### Contratos

`POST /api/conversaciones`:

```json
{
  "tipo": "contador_cliente",
  "cliente_id": "uuid",
  "contador_id": "uuid",
  "cotizacion_id": "uuid",
  "actividad_id": "uuid"
}
```

`POST /api/conversaciones/[id]/mensajes`:

```json
{
  "contenido": "Necesito revisar este documento"
}
```

Ambas rutas deben devolver el registro persistido dentro de `data`.

### Pruebas obligatorias

- listar solo conversaciones autorizadas;
- rechazar un usuario no participante;
- rechazar mensaje vacío;
- crear y recuperar mensajes en orden;
- impedir participantes de otra organización;
- validar permisos después de reasignar contador;
- validar RLS con cliente, contador, admin y owner.

## Criterios de entrega

- Migraciones y políticas de base de datos documentadas y verificadas.
- Frontend del chat conectado a contratos reales.
- Backend de conversaciones y mensajes implementado con route, service, repository y schemas.
- Pruebas de seguridad, permisos e integración ejecutadas.

## Merge strategy

- Merge independiente en `feature/pablo-database-conversations`.
- Malaga consume los contratos del chat, pero no modifica sus rutas ni su modelo de datos.
- Wicho consume los resultados de seguridad y no duplica la implementación del módulo.
