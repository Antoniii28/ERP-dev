# API

La API principal del ERP se sirve bajo el prefijo `/api/v1`.

## Health check

```http
GET /api/v1/health
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "message": "API funcionando correctamente"
}
```

## Estructura base

- `app.ts`: configuración de Express y middlewares.
- `server.ts`: arranque del servidor HTTP.
- `config/`: entorno y base de datos.
- `middlewares/`: autenticación, validación y errores.
- `routes/`: enrutado versionado.
- `modules/`: módulos funcionales del ERP.

## Convenciones

- Respuestas estandarizadas con `success`, `data` y `message`.
- Manejo centralizado de errores.
- Versionado de API a través de `/api/v1`.
