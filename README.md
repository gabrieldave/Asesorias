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

2. Completa las variables de entorno en `.env.local` con tus credenciales reales (ver `env.example` como referencia).

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Base de Datos (Supabase)

Las tablas han sido creadas en tu proyecto Supabase:

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

## Funcionalidades Implementadas

### ✅ Completado

1. ✅ **Base de Datos Supabase** - Tablas creadas con RLS
2. ✅ **Autenticación Admin** - Login con Supabase Auth (`/login`)
3. ✅ **Dashboard Admin** - Gestión de servicios, slots y reservas (`/admin`)
4. ✅ **Landing Page** - Hero, servicios y social proof con estilo Terminal
5. ✅ **Sistema de Reservas** - Modal de booking con selección de slots
6. ✅ **Stripe Checkout** - Integración completa de pagos
7. ✅ **Webhook Stripe** - Procesamiento automático de pagos
8. ✅ **Resend Emails** - Envío de confirmaciones (requiere API key)
9. ✅ **Integraciones Placeholder** - Zoom y Google Calendar (listos para configurar)

## Rutas de la Aplicación

- `/` - Landing page pública
- `/login` - Login para administradores
- `/admin` - Dashboard de administración (protegido)
- `/success` - Página de confirmación después del pago
- `/api/checkout/create` - API para crear sesión de Stripe
- `/api/webhooks/stripe` - Webhook para procesar pagos de Stripe

## Configuración de Variables de Entorno

Copia `env.example` a `.env.local` y completa las siguientes variables:

- **Supabase**: Ya configurado para proyecto "calculadora"
- **Stripe**: Necesitas tus claves de Stripe (publishable y secret)
- **Stripe Webhook**: Configura el webhook en Stripe Dashboard apuntando a `/api/webhooks/stripe`
- **Resend**: API key para envío de emails
- **Zoom**: Credenciales de Zoom API (opcional)
- **Google Calendar**: Credenciales de Google Calendar API (opcional)
- **Admin Email**: Email del administrador para recibir notificaciones

## Notas Importantes

- Las integraciones de Zoom y Google Calendar están como placeholders y requieren configuración adicional
- El webhook de Stripe debe configurarse en el dashboard de Stripe
- Los emails de Resend requieren verificación de dominio
- El admin debe crear una cuenta en Supabase Auth para poder hacer login

