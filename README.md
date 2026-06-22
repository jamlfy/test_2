# test_2

Sistema de gestión de órdenes de Shopify e inventario de material de empaque.

## Características

- **Integración con Shopify** — Recepción de órdenes vía webhooks desde Shopify
- **Gestión de órdenes** — Visualización y seguimiento del estado de órdenes (PENDING, PROCESSING, COMPLETED, FAILED)
- **Inventario de materiales** — Control de stock de materiales de empaque (cajas, cintas, etc.)
- **Cálculo automático de empaque** — Asigna materiales requeridos por orden según los productos, con detección de artículos frágiles
- **Dashboard** — Panel de monitoreo con resumen de órdenes y materiales
- **Autenticación** — Integración con Auth0 (OAuth2 / JWT)
- **Documentación API** — Swagger/OpenAPI disponible en `/api/docs`

## Tecnologías

| Capa          | Tecnología                                    |
| ------------- | --------------------------------------------- |
| Backend       | NestJS (TypeScript)                           |
| Frontend      | Vue 3, Pinia, Vue Router, Vite                |
| Base de datos | PostgreSQL 15                                 |
| ORM           | Prisma                                        |
| Colas         | BullMQ (Redis)                                |
| Autenticación | Auth0 (OAuth2, JWT, JWKS)                     |
| Contenedores  | Docker / Docker Compose                       |
| Monorepo      | npm workspaces                                |

## Estructura del proyecto

```
/
├── apps/
│   ├── backend/          # Aplicación NestJS
│   └── frontend/         # Aplicación Vue 3
├── packages/
│   ├── backend/
│   │   ├── orders/       # Lógica de órdenes
│   │   ├── inventory/    # Lógica de inventario
│   │   └── packaging/    # Cálculo de empaque
│   ├── frontend/
│   │   ├── order/        # Componentes de órdenes
│   │   ├── inventory/    # Componentes de inventario
│   │   └── summary/      # Componentes de dashboard
│   ├── prisma/           # Schema y cliente de Prisma
│   ├── php/              # Script PHP heredado
│   └── share/
│       ├── types/        # Tipos compartidos
│       └── utils/        # Utilidades compartidas
├── scripts/              # Scripts auxiliares
├── docker-compose.yml
└── package.json
```

## Requisitos previos

- Node.js >= 18
- Docker y Docker Compose
- npm

## Configuración

1. Copia el archivo de entorno:
   ```bash
   cp .env.example .env
   ```

2. Configura las variables de entorno en `.env` (Auth0, base de datos, Redis, etc.).

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Inicia los servicios de infraestructura (PostgreSQL y Redis):
   ```bash
   docker compose up
   ```

5. Genera el cliente de Prisma y ejecuta las migraciones:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. (Opcional) Siembra la base de datos con datos de ejemplo:
   ```bash
   npm run seed
   ```

## Uso

### Desarrollo

Inicia el backend y frontend en modo desarrollo:
```bash
npm run dev
```

O de forma individual:
```bash
npm run dev:back   # Backend en http://localhost:3000
npm run dev:front  # Frontend en http://localhost:5173
```

### Producción

```bash
npm run build
docker compose up -d
```

### Pruebas

```bash
npm run test          # Backend y frontend
npm run test:back     # Solo backend
npm run test:front    # Solo frontend
```

### OpenAPI

- http://localhost:3000/api/docs
