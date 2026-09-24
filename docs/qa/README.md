# QA y pruebas

## Estrategia

- Verificar infraestructura base antes de implementar módulos de negocio.
- Usar pruebas unitarias para validadores y utilidades.
- Usar pruebas de integración para endpoints y middleware.
- Mantener la suite ligera para facilitar ciclos de desarrollo.

## Herramientas

- Vitest para pruebas.
- Supertest para endpoints HTTP.
- `mongodb-memory-server` como opción para pruebas de integración con base de datos.

## Criterios mínimos

- Health check responde con éxito.
- Build de TypeScript no falla.
- Lint sin errores de configuración relevantes.
- Aplicación web y móvil arrancan o validan su estructura base.
