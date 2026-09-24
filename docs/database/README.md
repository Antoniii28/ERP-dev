# Base de datos

MongoDB Atlas es la base de datos principal del ERP.

## Configuración local

Crea un archivo `.env` en la raíz del repositorio (no se sube a Git) y agrega:

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?appName=<app>
```

Nunca coloques credenciales reales en `.env.example`, README, código fuente o commits.

## Atlas: requisitos

1. Crear un usuario de base de datos en MongoDB Atlas.
2. Configurar Network Access para permitir la IP de desarrollo.
3. Copiar la URI desde Atlas.
4. Sustituir `<password>` por la contraseña del usuario de base de datos.
5. Guardar la URI solamente en `.env`.

## Colecciones previstas

- `users`
- `companies`
- `branches`
- `roles`
- `permissions`
- `customers`
- `suppliers`
- `products`
- `categories`
- `warehouses`
- `inventory`
- `inventory_movements`
- `quotes`
- `sales_orders`
- `invoices`
- `purchase_orders`
- `purchase_receipts`
- `payments`
- `expenses`
- `accounts_receivable`
- `accounts_payable`
- `employees`
- `attendance`
- `crm_leads`
- `crm_opportunities`
- `notifications`
- `audit_logs`
- `reports`
- `ai_insights`

## Entorno de pruebas

`mongodb-memory-server` puede utilizarse para pruebas automatizadas o escenarios locales aislados. No reemplaza MongoDB Atlas como base de datos principal.
