# API Reference

Base URL: `http://localhost:3000/api`

Todos los endpoints marcados con 🔒 requieren header:
```
Authorization: Bearer <token>
```

---

## AUTH

### `POST /auth/login`
Inicia sesión y devuelve el token.
```json
{
    "email": "usuario@ejemplo.com",
    "password": "Qwerty12345"
}
```

### `POST /auth/singup`
> Solo developers. Registra un administrador.
```json
{
    "nombre": "Ali",
    "apellido_paterno": "García",
    "apellido_materno": "López",
    "email": "ali@despacho.com",
    "password": "Qwerty12345",
    "rol_id": "<uuid del rol admin>"
}
```

### `POST /auth/logout` 🔒
Cierra sesión. Sin body.

### `POST /auth/recuperar-password`
Manda un email con link de recuperación.
```json
{
    "email": "usuario@ejemplo.com"
}
```

### `POST /auth/cambiar-password` 🔒
Cambia la contraseña estando logueado. Verifica la contraseña actual antes de cambiar.
```json
{
    "password_actual": "Qwerty12345",
    "password_nueva": "NuevaPassword123"
}
```

---

## USUARIOS 🔒

### `GET /users`
Admin lista todos los usuarios de su organización. Sin body.

### `GET /users/contadores`
Lista los contadores activos de la organización. Sin body.

### `GET /users/:id`
Obtiene un usuario específico por UUID. Sin body.

### `POST /users`
Admin crea un cliente o contador en su organización.
```json
{
    "nombre": "Juan",
    "apellido_paterno": "García",
    "apellido_materno": "López",
    "email": "juan@ejemplo.com",
    "password": "Qwerty12345",
    "rfc": "GALJ900101ABC",
    "rol_id": "<uuid del rol>",
    "regimen_fiscal_id": "<uuid>",
    "contador_id": "<uuid del contador>"
}
```

### `DELETE /users/:id`
Baja lógica — cambia estatus a inactivo. Sin body.

### `PUT /users/:id/asignar-contador`
Asigna o reasigna el contador responsable de un cliente.
```json
{
    "contador_id": "<uuid del contador>"
}
```

---

## CATÁLOGOS 🔒

Tipos válidos para `:tipo_catalogo`:
- `regimenes_fiscales`
- `especialidad_contador`
- `catalogo_actividades`
- `categoria_documentos`

### `GET /catalogos/:tipo_catalogo`
Lista todos los registros del catálogo. Sin body.

### `POST /catalogos/:tipo_catalogo`
Agrega un nuevo registro al catálogo.
```json
{
    "nombre": "Personas Morales"
}
```

### `PATCH /catalogos/:tipo_catalogo/:id`
Activa o desactiva un registro.
```json
{
    "activo": false
}
```

---

## COTIZACIONES 🔒

### `GET /cotizaciones`
Admin lista las cotizaciones pendientes de su organización. Sin body.

### `POST /cotizaciones`
Cliente crea una sola cotización que puede incluir uno o varios servicios. El precio se asigna a la cotización y el cliente acepta o rechaza el conjunto completo.
```json
{
    "titulo": "Solicitud de 2 actividades",
    "descripcion": "Contexto general opcional",
    "actividades": [
        {
            "catalogo_actividad_id": "<uuid de catalogo_actividades>",
            "notas_cliente": "Nota opcional para este servicio"
        },
        {
            "catalogo_actividad_id": "<uuid de otro servicio>",
            "notas_cliente": "Otra nota opcional"
        }
    ]
}
```
`actividades` debe contener al menos un servicio y no permite IDs repetidos. El campo legado `actividad_catalogo_id` sigue disponible para solicitudes individuales existentes.

### `PUT /cotizaciones/:id/precio`
Admin fija el precio de una cotización.
```json
{
    "precio": 1500.00
}
```

### `PUT /cotizaciones/:id/respuesta`
Cliente acepta o rechaza la cotización completa. Al aceptar una cotización agrupada, se crea una actividad pendiente por cada servicio incluido; el precio total permanece en la cotización.
```json
{
    "respuesta": "aceptada"
}
```
Valores válidos: `"aceptada"` | `"rechazada"`

---

## ACTIVIDADES 🔒

### `GET /actividades/resultados`
Cliente consulta sus actividades con documentos y estatus. Sin body.

### `GET /actividades/:id/insumos`
Contador consulta las notas y documentos del cliente para una actividad. Sin body.

### `PUT /actividades/:id/estatus`
Contador cambia el estatus de una actividad.
```json
{
    "estatus": "en_proceso"
}
```
Valores válidos: `"en_proceso"` | `"bloqueada"` | `"completada"`

### `POST /actividades/:id/documentos`
Cliente sube un documento a una actividad. Body tipo `form-data`:
| Campo | Tipo | Requerido |
|---|---|---|
| archivo | File | ✅ |
| categoria_documento_id | uuid | ❌ |

### `POST /actividades/:id/entregables`
Contador sube el entregable final y cierra la actividad como completada. Body tipo `form-data`:
| Campo | Tipo | Requerido |
|---|---|---|
| archivo | File | ✅ |

---

## CARPETAS 🔒

### `POST /carpetas/archivos`
> Pendiente de implementar.
