# Modelo de datos observado

## Fuente y límites de evidencia

La aplicación utiliza Supabase Auth, consultas PostgreSQL/PostgREST y Storage. El código confirma nombres de tablas, algunas columnas y relaciones seleccionadas. `DATABASE.md` documenta más estructura y comportamiento, pero los archivos de DDL citados allí (`schema.dbml` y `supabase/migrations/`) no están presentes en el árbol inspeccionado. Por tanto, las reglas que solo aparecen en `DATABASE.md` se identifican abajo como **documentadas, no verificadas contra DDL**.

## Entidades y responsabilidades

| Entidad | Descripción observada |
|---|---|
| `auth.users` | Identidad administrada por Supabase Auth; las operaciones de registro/inicio/cambio de contraseña usan su API. |
| `usuarios` | Perfil y datos operativos; código consulta nombre, apellidos, correo, RFC, rol, organización, contador asignado, régimen, estado y fecha de creación. |
| `organizaciones` | Despacho/ámbito organizacional; `organizacion_id` filtra usuarios, cotizaciones y actividades. |
| `roles` | Nombres de rol usados por middleware y lógica: `owner`, `admin`, `contador`, `cliente`. |
| `estatus_usuarios` | Estados como `activo` e `inactivo`, leídos al validar login y cambiar el estado del usuario. |
| `cotizaciones` | Solicitudes/propuestas con cliente, organización, título, descripción, precio y estado; el código recupera también sus relaciones con usuario y estado. |
| `estatus_cotizacion` | Estados consultados por nombre, incluidos `pendiente`, `aceptada` y `rechazada`; se menciona `cancelada` en la UI. |
| `actividades` | Trabajo originado por una cotización, vinculado a cliente, contador y organización; incluye estado, precio, documentos y relación a cotización. |
| `estatus_actividad` | Catálogo de estados de actividades; el código establece `en_proceso`, `bloqueada` y `completada`. |
| `documentos` | Metadatos de archivo: organización, actividad o carpeta, cliente, cargador, nombre, ruta y categoría. |
| `carpetas` | Carpeta general del cliente con cliente, organización y nombre. |
| `categoria_documentos` | Categorías de documentos presentadas en portal y administrador. |
| `conversaciones` | Hilos tipados para relación cliente-contador o cliente-administrador; contienen participantes y vínculos opcionales a actividad/cotización. |
| `mensajes` | Contenido enviado en una conversación, remitente y fecha de envío. |
| `regimenes_fiscales`, `especialidad_contador` | Catálogos asociados a usuarios. |
| `categorias`, `catalogo_actividades`, `lista_actividades` | Catálogos de servicios/categorías; `DATABASE.md` describe `lista_actividades` como relación intermedia. |
| `notificaciones` | Registros por usuario con título, mensaje, tipo, URL de destino y estado de lectura. |

El código también utiliza el bucket de Storage `documentos`; Storage contiene los bytes mientras `documentos.ruta_archivo` apunta al objeto.

## Relaciones principales

Relaciones descritas por las consultas actuales y/o por `DATABASE.md`:

- `usuarios.rol_id → roles.id`.
- `usuarios.organizacion_id → organizaciones.id`.
- `usuarios.contador_id → usuarios.id` (asignación de contador a cliente).
- `usuarios.regimen_fiscal_id → regimenes_fiscales.id`.
- `cotizaciones.cliente_id → usuarios.id`; `cotizaciones.organizacion_id → organizaciones.id`; y estado mediante `estatus_id`.
- `actividades.cotizacion_id → cotizaciones.id`; además cliente y contador apuntan a `usuarios`, con `organizacion_id` y `estatus_id`.
- `documentos.actividad_id → actividades.id` o `documentos.carpeta_id → carpetas.id`, además de cliente, cargador y categoría.
- `carpetas.cliente_id → usuarios.id`.
- `conversaciones` enlaza cliente, contador y/o administrador; `mensajes.conversacion_id → conversaciones.id` y `remitente_id → usuarios.id`.
- `lista_actividades` relaciona categorías con actividades del catálogo según el documento de base de datos.

## Flujo de estados relevante

`DATABASE.md` describe un trigger que genera una actividad al aceptar una cotización, valida que el cliente tenga contador y evita crearla dos veces. La ruta de respuesta de cotización actualiza el estado de la cotización y delega esta conversión al comportamiento de base de datos; no crea directamente la actividad en TypeScript. Como las migraciones no están en el árbol, el trigger y sus garantías no se pudieron verificar aquí.

En carga de documentos, los servicios primero suben el archivo a Storage y después insertan metadatos en `documentos`; no se observa una transacción que cubra Storage y PostgreSQL. Los entregables también cambian el estado de la actividad y envían una notificación después de insertar los archivos.

## Divergencias que requieren confirmación

- `CreateCotizacionSchema` requiere `actividad_catalogo_id`, pero `CotizacionesRepository.create` guarda explícitamente `actividad_catalogo_id: null` y comenta que la referencia esperada sería `lista_actividades`. Es una diferencia entre el contrato validado, el modelo documentado y el dato persistido.
- `DATABASE.md` afirma una restricción que exige exactamente uno de `actividad_id` o `carpeta_id` en documentos; no hay DDL disponible en el repositorio para confirmar la restricción.
- El registro de usuario pasa rol y organización por metadata de Supabase Auth; `DATABASE.md` atribuye la creación del perfil a un trigger, pero la función SQL no está disponible para inspección.
