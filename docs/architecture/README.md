# Arquitectura

Este proyecto usa un monorepo con separación profesional por capas y responsabilidades.

## Frontend

- Web: React + Vite para dashboards y administración.
- Mobile: Expo + React Native para acceso móvil.
- Ambos consumen la API REST del backend mediante variables de entorno.

## Backend

- Node.js + Express.
- Rutas versionadas con prefijo `/api/v1`.
- Configuración centralizada con variables de entorno.
- Manejo global de errores para validación, autenticación y recursos no encontrados.

## Base de datos

Se prepara MongoDB Atlas como base principal. El proyecto permite una conexión mediante `MONGODB_URI` y mantiene un modo no bloqueante cuando no hay configuración.

## Packages compartidos

- `@erp/constants`: valores constantes del sistema.
- `@erp/types`: modelos compartidos.
- `@erp/validation`: validaciones con Zod.
- `@erp/shared`: utilidades de dominio y helpers.
- `@erp/ui`: componentes visuales reutilizables.
- `@erp/utils`: utilidades generales.

## Flujo general

1. El usuario accede al frontend.
2. El frontend consulta la API REST.
3. El backend valida, procesa y responde con un payload estándar.
4. La persistencia se conecta a MongoDB Atlas o memoria en pruebas.
5. Los paquetes compartidos mantienen coherencia entre apps.
