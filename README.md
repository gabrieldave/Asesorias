# Asesorías Todos Somos Traders

PWA completa para venta de mentorías de Trading con estilo "Terminal Bloomberg".

## Stack Tecnológico

- **Frontend:** Next.js 14+ (App Router), React, Tailwind CSS, Framer Motion, Lucide React
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage)
- **Pagos:** Stripe (Checkout Sessions)
- **Emails:** Resend SDK
- **Integraciones:** Zoom API, Google Calendar API
- **Lenguaje:** TypeScript (estricto)

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo `env.example` a `.env.local`:
```bash
cp env.example .env.local
```

2. Las credenciales de Supabase ya están configuradas en `env.example` para el proyecto "calculadora".

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Base de Datos (Supabase)

Las tablas han sido creadas en el proyecto Supabase "calculadora":

### Tablas Creadas

1. **services** - Servicios de mentoría
   - `id`, `title`, `price`, `description`, `features[]`, `image_url`, `active`, `created_at`, `updated_at`

2. **availability_slots** - Slots de disponibilidad del admin
   - `id`, `start_time`, `end_time`, `is_booked`, `created_at`

3. **bookings** - Reservas de clientes
   - `id`, `created_at`, `customer_email`, `customer_name`, `service_id`, `slot_id`, `stripe_session_id`, `payment_status`, `zoom_link`, `gcal_event_id`

### RLS (Row Level Security)

- **services**: Público puede leer servicios activos
- **availability_slots**: Público puede leer slots disponibles
- **bookings**: Público puede crear y leer sus propias reservas

### Datos de Ejemplo

Se han insertado 3 servicios de ejemplo:
- Mentoría Inicial ($50,000 CLP)
- Mentoría Intermedia ($80,000 CLP)
- Mentoría Avanzada ($120,000 CLP)

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globales
├── components/             # Componentes React
│   ├── Hero.tsx            # Hero section
│   ├── Services.tsx        # Grid de servicios (conectado a Supabase)
│   └── SocialProof.tsx     # Enlaces sociales
├── lib/                    # Utilidades
│   ├── supabase/           # Cliente Supabase
│   │   ├── client.ts       # Cliente del lado del cliente
│   │   ├── server.ts       # Cliente del lado del servidor
│   │   └── queries.ts      # Funciones de consulta
│   └── utils.ts            # Utilidades generales
├── types/                  # Tipos TypeScript
│   └── database.types.ts   # Tipos de la base de datos
└── public/                 # Archivos estáticos
    └── manifest.json       # Manifest PWA
```

## Próximos Pasos

1. ✅ Configurar Supabase y crear esquema de base de datos
2. ⏳ Implementar autenticación para admin
3. ⏳ Integrar Stripe Checkout
4. ⏳ Configurar webhooks de Stripe
5. ⏳ Integrar Zoom API y Google Calendar API
6. ⏳ Configurar Resend para emails

