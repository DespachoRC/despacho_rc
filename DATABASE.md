# Base de datos de Supabase

## 1. Descripción general

La base de datos pertenece a una aplicación de gestión para despachos contables. Está construida sobre PostgreSQL mediante Supabase y utiliza `auth.users` para la autenticación.

El modelo permite:

- Administrar organizaciones o despachos.
- Registrar usuarios con diferentes roles.
- Asignar clientes a contadores.
- Crear y gestionar cotizaciones.
- Convertir cotizaciones aceptadas en actividades.
- Organizar documentos por actividad o carpeta.
- Mantener conversaciones entre clientes, contadores y administradores.
- Consultar catálogos fiscales, actividades y categorías.
- Aplicar seguridad mediante Row Level Security, conocida como RLS.

El esquema DBML asociado está en [schema.dbml](schema.dbml).

## 2. Migraciones

Las migraciones se encuentran en `supabase/migrations` y se ejecutan en orden cronológico:

| Migración                                      | Responsabilidad                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `20260914015531_schema.sql`                    | Crea tablas, columnas, claves foráneas y restricciones principales.                  |
| `20260914015551_rls.sql`                       | Habilita RLS, crea funciones auxiliares, permisos y políticas de acceso.             |
| `20260914015610_trigger_cotizacion.sql`        | Convierte una cotización aceptada en una actividad.                                  |
| `20260914015627_seed.sql`                      | Inserta organizaciones, roles, estados y catálogos iniciales.                        |
| `20260914022601_trigger_user.sql`              | Crea el perfil en `public.usuarios` después de registrar un usuario en `auth.users`. |
| `20260914223310_add_especialidad_contador.sql` | Agrega la especialidad del contador a la tabla de usuarios.                          |

## 3. Autenticación y usuarios

### `auth.users`

Es una tabla administrada por Supabase Auth. Contiene la identidad autenticada del usuario.

La tabla `public.usuarios` utiliza el mismo UUID como clave primaria y referencia a `auth.users(id)`.

### `usuarios`

Almacena el perfil y la información operativa de cada usuario.

Campos importantes:

- `id`: UUID del usuario autenticado.
- `nombre`, `apellido_paterno`, `apellido_materno`: datos personales.
- `email`: correo único del usuario.
- `rfc`: RFC del cliente o contador.
- `rol_id`: referencia al rol del usuario.
- `organizacion_id`: despacho al que pertenece.
- `contador_id`: contador asignado; se utiliza principalmente para clientes.
- `regimen_fiscal_id`: régimen fiscal del usuario.
- `especialidad_contador`: especialidad del contador.
- `estatus_id`: estado del usuario, por ejemplo `activo` o `inactivo`.
- `fecha_creacion`: fecha de creación del perfil.

La relación `contador_id -> usuarios.id` es autorreferenciada: un cliente puede apuntar al contador que tiene asignado.

## 4. Roles

La tabla `roles` contiene los roles disponibles:

- `owner`: propietario con control general.
- `admin`: administrador de una organización.
- `contador`: profesional que atiende actividades y clientes.
- `cliente`: usuario que solicita servicios y consulta su información.

Los nombres de rol son utilizados por las políticas RLS para decidir qué registros puede consultar o modificar cada usuario.

## 5. Organizaciones

### `organizaciones`

Representa un despacho o unidad de trabajo.

Cada organización tiene:

- `id`: identificador UUID.
- `nombre`: nombre del despacho.

Las tablas operativas utilizan `organizacion_id` para separar la información entre despachos.

## 6. Tablas de catálogo

Estas tablas contienen valores reutilizables por la aplicación:

| Tabla                   | Uso                                         |
| ----------------------- | ------------------------------------------- |
| `roles`                 | Roles de los usuarios.                      |
| `estatus_usuarios`      | Estados de usuarios.                        |
| `estatus_cotizacion`    | Estados de cotizaciones.                    |
| `estatus_actividad`     | Estados de actividades.                     |
| `regimenes_fiscales`    | Regímenes fiscales del SAT.                 |
| `especialidad_contador` | Especialidades de los contadores.           |
| `categorias`            | Categorías generales de actividades.        |
| `catalogo_actividades`  | Actividades que puede solicitar un cliente. |
| `categoria_documentos`  | Tipos de documentos.                        |

### `lista_actividades`

Es una tabla intermedia entre `categorias` y `catalogo_actividades`.

Permite asociar actividades del catálogo con una categoría:

```text
categorias 1 ---- N lista_actividades N ---- 1 catalogo_actividades
```

La tabla `cotizaciones` utiliza `actividad_catalogo_id` para apuntar a una entrada de `lista_actividades`.

## 7. Cotizaciones y actividades

### `cotizaciones`

Representa una solicitud o propuesta de servicio de un cliente.

Campos principales:

- `organizacion_id`: organización responsable.
- `cliente_id`: usuario que solicita el servicio.
- `titulo`: nombre de la cotización.
- `descripcion`: detalle del servicio.
- `precio`: importe propuesto.
- `estatus_id`: estado de la cotización.
- `actividad_catalogo_id`: actividad seleccionada del catálogo.
- `fecha_creacion`: fecha de creación.

Estados iniciales incluidos:

- `pendiente`
- `aceptada`
- `rechazada`
- `cancelada`

### `actividades`

Representa el trabajo que debe realizar un contador.

Campos principales:

- `organizacion_id`: organización responsable.
- `cotizacion_id`: cotización de origen.
- `cliente_id`: cliente atendido.
- `contador_id`: contador asignado.
- `titulo`, `descripcion` y `precio`: información del trabajo.
- `estatus_id`: estado de la actividad.
- `fecha_creacion`: fecha de creación.

Estados iniciales incluidos:

- `pendiente`
- `en_proceso`
- `completada`
- `cancelada`

### Flujo automático de cotización

El trigger `trg_cotizacion_aceptada` se ejecuta después de actualizar `cotizaciones.estatus_id`.

Cuando una cotización cambia a `aceptada`:

1. Busca el estado `aceptada`.
2. Comprueba que antes no estuviera aceptada.
3. Evita crear otra actividad si ya existe una para la cotización.
4. Busca el contador asignado al cliente.
5. Crea una actividad con estado `pendiente`.
6. Copia título, descripción, precio, cliente y organización de la cotización.

Si el cliente no tiene contador asignado, la operación genera un error y no permite aceptar la cotización.

## 8. Carpetas y documentos

### `carpetas`

Permite que un cliente organice documentos generales.

Campos principales:

- `organizacion_id`
- `cliente_id`
- `nombre`
- `fecha_creacion`

El nombre de carpeta tiene como valor por defecto `General`.

### `documentos`

Registra los documentos relacionados con una actividad o con una carpeta.

Campos principales:

- `organizacion_id`: organización del documento.
- `actividad_id`: actividad relacionada, opcional.
- `carpeta_id`: carpeta relacionada, opcional.
- `cliente_id`: cliente propietario.
- `subido_por_id`: usuario que cargó el documento.
- `nombre_archivo`: nombre visible del archivo.
- `ruta_archivo`: ubicación del archivo.
- `categoria_documento_id`: categoría del documento.
- `fecha_subida`: fecha de carga.

Existe una restricción que exige exactamente uno de estos destinos:

- `actividad_id`, o
- `carpeta_id`.

No se permite que ambos estén vacíos ni que ambos tengan valor.

La tabla registra la ruta del archivo, pero las políticas de Storage de Supabase deben configurarse por separado para proteger el archivo físico.

## 9. Conversaciones y mensajes

### `conversaciones`

Representa un hilo de comunicación dentro de una organización.

Tipos permitidos:

- `contador_cliente`: conversación entre un contador y un cliente.
- `cliente_admin`: conversación entre un cliente y un administrador.

Campos principales:

- `organizacion_id`
- `cliente_id`
- `contador_id`
- `admin_id`
- `cotizacion_id`, opcional
- `actividad_id`, opcional
- `fecha_creacion`

Una restricción verifica que:

- Una conversación `contador_cliente` tenga `contador_id` y no tenga `admin_id`.
- Una conversación `cliente_admin` tenga `admin_id` y no tenga `contador_id`.

### `mensajes`

Almacena los mensajes enviados dentro de una conversación.

Campos principales:

- `conversacion_id`
- `remitente_id`
- `contenido`
- `fecha_envio`

El remitente debe ser un usuario existente y la conversación debe existir.

## 10. Row Level Security

RLS está habilitado en las tablas de catálogos y en las tablas operativas.

Las funciones auxiliares principales son:

- `get_my_org_id()`: devuelve la organización del usuario autenticado.
- `get_my_role()`: devuelve el rol del usuario autenticado.
- `is_contador_de(cliente_id)`: comprueba si el usuario actual es el contador asignado a un cliente.
- `is_participante_conversacion(conversacion_id)`: comprueba si el usuario participa en una conversación.

### Acceso general por rol

| Rol        | Acceso principal                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `owner`    | Control total de organizaciones, usuarios y registros operativos.                                                          |
| `admin`    | Gestión de usuarios, registros y conversaciones dentro de su organización.                                                 |
| `contador` | Consulta de sus clientes, cotizaciones, actividades, carpetas y documentos relacionados. Puede actualizar sus actividades. |
| `cliente`  | Consulta y creación de sus cotizaciones, carpetas, documentos y conversaciones.                                            |

Los catálogos tienen lectura disponible para cualquier usuario autenticado. La gestión de catálogos está reservada a `owner` y `admin`.

### Políticas destacadas

- Un usuario puede consultar su propio perfil.
- Un contador puede consultar sus clientes asignados.
- Un cliente puede consultar el contador indicado en su metadata JWT.
- Un cliente solo puede crear cotizaciones a su nombre y dentro de su organización.
- Un contador puede subir documentos a sus actividades.
- Un cliente puede subir documentos propios.
- Solo los participantes pueden leer y enviar mensajes en una conversación.

## 11. Creación automática de usuarios

La función `public.nuevo_usuario()` se ejecuta después de insertar un registro en `auth.users`.

El trigger:

1. Busca el estado `activo`.
2. Lee los datos de `raw_user_meta_data`.
3. Inserta el perfil correspondiente en `public.usuarios`.
4. Convierte los UUID opcionales vacíos en `NULL`.
5. Evita duplicados mediante `on conflict (id) do nothing`.

Los metadatos esperados incluyen:

- `nombre`
- `apellido_paterno`
- `apellido_materno`
- `rfc`
- `regimen_fiscal_id`
- `rol_id`
- `contador_id`
- `organizacion_id`

## 12. Datos iniciales

El seed crea inicialmente:

- 3 organizaciones de prueba.
- 4 roles.
- Estados de usuarios, cotizaciones y actividades.
- 10 especialidades para contadores.
- 14 regímenes fiscales.
- 5 categorías de actividades.
- 25 actividades del catálogo.
- Relaciones entre categorías y actividades.
- 13 categorías de documentos.

El seed actual no utiliza restricciones únicas ni operaciones `upsert`, por lo que no debe ejecutarse repetidamente sobre una base que ya tenga esos datos, salvo que se adapte para ser idempotente.

## 13. Relaciones principales

```text
organizaciones
  |
  +-- usuarios
  |     +-- contador_id -> usuarios
  |     +-- rol_id -> roles
  |     +-- regimen_fiscal_id -> regimenes_fiscales
  |     +-- especialidad_contador -> especialidad_contador
  |
  +-- cotizaciones
  |     +-- cliente_id -> usuarios
  |     +-- actividad_catalogo_id -> lista_actividades
  |
  +-- actividades
  |     +-- cotizacion_id -> cotizaciones
  |     +-- cliente_id -> usuarios
  |     +-- contador_id -> usuarios
  |
  +-- carpetas
  |     +-- cliente_id -> usuarios
  |
  +-- documentos
  |     +-- actividad_id -> actividades
  |     +-- carpeta_id -> carpetas
  |
  +-- conversaciones
        +-- cliente_id -> usuarios
        +-- contador_id/admin_id -> usuarios
        +-- cotizacion_id -> cotizaciones
        +-- actividad_id -> actividades
              |
              +-- mensajes
```

## 14. Observaciones de seguridad e integridad

Estas observaciones describen el estado actual del código:

1. El trigger de registro toma `rol_id`, `organizacion_id` y `contador_id` desde metadata enviada al crear el usuario. El flujo de registro debe validar estos valores en backend o mediante una función controlada.
2. La política que permite actualizar el propio perfil debe impedir que un usuario cambie campos sensibles como `rol_id`, `organizacion_id` o `contador_id`.
3. Las políticas de actualización de cotizaciones deben validar que la organización no pueda cambiarse a otra.
4. La creación de conversaciones debería comprobar que los participantes pertenecen a la misma organización y que el contador está asignado al cliente cuando corresponda.
5. `actividades.cotizacion_id` no tiene una restricción `unique`; el trigger evita duplicados en condiciones normales, pero una restricción adicional protegería contra concurrencia.
6. `lista_actividades` no tiene una restricción única sobre `(categoria_id, catalogo_actividad_id)`.
7. Las claves foráneas y columnas utilizadas frecuentemente por RLS pueden beneficiarse de índices adicionales.
8. Las políticas de las tablas no sustituyen las políticas de Supabase Storage para proteger los archivos.

## 15. Archivos relacionados

- [Esquema SQL](migrations/20260914015531_schema.sql)
- [Políticas RLS](migrations/20260914015551_rls.sql)
- [Trigger de cotizaciones](migrations/20260914015610_trigger_cotizacion.sql)
- [Datos iniciales](migrations/20260914015627_seed.sql)
- [Trigger de usuarios](migrations/20260914022601_trigger_user.sql)
- [Especialidad de contador](migrations/20260914223310_add_especialidad_contador.sql)
