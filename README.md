# ERP

## Descripción

ERP monolítico modular diseñado para gestionar operaciones de negocio con una base técnica compartida entre backend, frontend web, frontend móvil y paquetes reutilizables.

## Arquitectura

La solución sigue una arquitectura de monorepo con separación clara entre aplicaciones y paquetes compartidos:

- `apps/api`: API REST en Express y MongoDB Atlas preparado.
- `apps/web`: frontend web en React + Vite.
- `apps/mobile`: aplicación móvil en Expo + React Native.
- `packages/*`: librerías compartidas de tipos, validación, constantes, UI, utils y utilidades de dominio.

## Tecnologías

- Node.js 20+
- TypeScript
- Express
- MongoDB Atlas / MongoDB compatible
- React + Vite
- Expo + React Native
- Vitest
- ESLint + Prettier

## Estructura

```text
ERP/
├── apps/
│   ├── api/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── constants/
│   ├── shared/
│   ├── types/
│   ├── ui/
│   ├── utils/
│   └── validation/
├── docs/
├── tests/
├── native/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.base.json
├── tsconfig.json
├── README.md
└── vitest.config.ts
```

## Instalación

```bash
npm install
```

## Variables de entorno

Copia el archivo `.env.example` a `.env` y completa los valores reales:

```bash
cp .env.example .env
```

Variables principales:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `CORS_ORIGINS`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

## Ejecución

```bash
npm run dev
```

Esto levanta la API y el frontend web. Si `MONGODB_URI` está configurado en `.env`, la API se conecta a MongoDB Atlas al iniciar. En desarrollo, la API puede arrancar sin MongoDB para realizar checks de infraestructura; en producción, `MONGODB_URI` es obligatorio.

## Desarrollo

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Testing

Se utiliza Vitest para pruebas unitarias y de integración. La infraestructura está preparada para ampliar la suite gradual y controladamente.

## Estado actual

La fase actual es la infraestructura base del ERP. Ya quedan configurados el monorepo, API base, frontend web, aplicación móvil, packages compartidos, configuración de TypeScript, manejo de errores y documentación inicial.

## Roadmap

- Fase 1: autenticación, usuarios y roles.
- Fase 2: empresas, sucursales y permisos.
- Fase 3: clientes, proveedores, productos e inventario.
- Fase 4: ventas, compras y finanzas.
- Fase 5: reporting, CRM y IA.
