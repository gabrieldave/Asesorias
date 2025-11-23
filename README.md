# 🎯 Sistema de Gestión de Asesorías - Todos Somos Traders

Sistema completo de gestión de asesorías y mentorías de trading con reservas, pagos, integraciones y administración.

## 📋 Descripción

Plataforma web moderna para gestionar asesorías de trading con las siguientes características:

- **Reservas en línea** con calendario visual interactivo
- **Pagos seguros** mediante Stripe
- **Integración con Google Calendar** para eventos automáticos
- **Reuniones Zoom** creadas automáticamente
- **Notificaciones por email** a clientes y administradores
- **Panel de administración** completo
- **Progressive Web App (PWA)** instalable en dispositivos
- **Diseño responsive** y moderno con tema terminal/retro

## ✨ Características Principales

### Para Clientes

- 📅 **Calendario Visual**: Selección de horarios mediante calendario mensual interactivo
- 💳 **Pagos Seguros**: Integración con Stripe para pagos en línea
- 📧 **Confirmaciones**: Emails automáticos con detalles de la reserva y links de Zoom
- 🌍 **Zona Horaria**: Visualización de horarios en la zona horaria del cliente
- 📱 **PWA**: Instalable como app en dispositivos móviles

### Para Administradores

- 🔐 **Panel de Control**: Dashboard completo para gestionar servicios, horarios y reservas
- 📊 **Gestión de Servicios**: Crear y editar servicios con precios y características
- ⏰ **Gestión de Horarios**: Crear slots individuales o recurrentes
- 📋 **Gestión de Reservas**: Ver, cancelar y gestionar todas las reservas
- 🗑️ **Cancelaciones Automáticas**: Al cancelar, se eliminan eventos de Google Calendar y Zoom automáticamente
- 📧 **Notificaciones**: Recibe emails cuando hay nuevas reservas
- 🔗 **Estado de Integraciones**: Ver el estado de Google Calendar, Zoom y Resend

### Integraciones

- **Stripe**: Procesamiento de pagos y webhooks
- **Google Calendar**: Creación automática de eventos con invitaciones
- **Zoom**: Creación automática de reuniones para cada sesión
- **Resend**: Envío de emails de confirmación y notificaciones
- **Supabase**: Base de datos y autenticación

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Base de Datos**: Supabase (PostgreSQL)
- **Pagos**: Stripe
- **Emails**: Resend
- **Calendario**: Google Calendar API
- **Videollamadas**: Zoom API
- **Deployment**: Vercel

## 📁 Estructura del Proyecto

```
├── app/
│   ├── admin/              # Panel de administración
│   ├── api/                # API routes
│   │   ├── admin/         # Endpoints de administración
│   │   ├── checkout/       # Procesamiento de pagos
│   │   └── webhooks/       # Webhooks de Stripe
│   ├── success/            # Página de éxito después del pago
│   └── page.tsx            # Página principal
├── components/
│   ├── BookingModal.tsx    # Modal de reserva con calendario
│   ├── Services.tsx         # Lista de servicios
│   ├── ServiceForm.tsx      # Formulario de servicios
│   ├── SlotForm.tsx        # Formulario de horarios
│   └── PWARegister.tsx      # Registro de Service Worker
├── lib/
│   ├── supabase/           # Clientes de Supabase
│   ├── google-calendar.ts  # Integración Google Calendar
│   ├── zoom.ts             # Integración Zoom
│   └── auth/               # Autenticación de admin
├── public/
│   ├── manifest.json        # Manifest PWA
│   ├── sw.js               # Service Worker
│   └── icon-*.png          # Iconos PWA
└── scripts/
    └── generate-icons-*.js  # Scripts para generar iconos
```

## 🚀 Funcionalidades Detalladas

### Sistema de Reservas

1. **Selección de Servicio**: Cliente elige entre diferentes niveles de mentoría
2. **Calendario Visual**: Selección de día y hora mediante calendario interactivo
3. **Formulario**: Cliente ingresa nombre y email
4. **Pago**: Redirección a Stripe Checkout
5. **Confirmación**: Webhook procesa el pago y crea recursos automáticamente

### Flujo de Pago

1. Cliente completa el formulario de reserva
2. Se crea un booking con estado "pending"
3. Cliente es redirigido a Stripe Checkout
4. Al completar el pago, Stripe envía webhook
5. El webhook:
   - Actualiza el booking a "paid"
   - Marca el slot como reservado
   - Crea evento en Google Calendar
   - Crea reunión en Zoom
   - Envía emails de confirmación

### Gestión de Horarios

- **Slots Únicos**: Crear un horario específico
- **Slots Recurrentes**: Crear horarios que se repiten semanalmente
- **Validación**: Previene crear slots en el pasado
- **Zona Horaria**: Los horarios se interpretan en hora de México (America/Mexico_City)

### Cancelaciones

Cuando un administrador cancela una reserva:
- Se elimina el evento de Google Calendar
- Se elimina la reunión de Zoom
- Se libera el slot (vuelve a estar disponible)
- Se envía email de cancelación al cliente
- Se elimina el booking de la base de datos

## 🔐 Seguridad

- Autenticación de administradores con cookies seguras
- Verificación de permisos en todos los endpoints de admin
- Service Role Key de Supabase para operaciones privilegiadas
- Validación de webhooks de Stripe con firmas
- Variables de entorno para todas las claves sensibles

## 📧 Sistema de Emails

### Emails al Cliente

- **Confirmación de Reserva**: Con detalles, fecha, hora y link de Zoom
- **Cancelación**: Notificación cuando se cancela una reserva

### Emails al Administrador

- **Nueva Reserva**: Notificación cuando hay una nueva reserva pagada
- Incluye todos los detalles del cliente y la reserva

## 🌍 Zona Horaria

- **Admin**: Ve horarios en hora de México (America/Mexico_City)
- **Clientes**: Ven horarios en su zona horaria local
- Conversión automática para mostrar correctamente en cada región

## 📱 Progressive Web App (PWA)

- Instalable en dispositivos móviles y desktop
- Funciona offline después de la primera visita
- Iconos personalizados
- Manifest configurado
- Service Worker para cache

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend (Emails)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Zoom
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_ACCOUNT_ID=

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REFRESH_TOKEN=

# Admin
ADMIN_EMAIL=
```

### Documentación Adicional

- `GUIA_STRIPE_PRODUCCION.md` - Guía para configurar Stripe en producción
- `CONFIGURACION_STRIPE_DOMINIO.md` - Configuración específica del dominio
- `PWA_SETUP.md` - Documentación de la PWA
- `GUIA_GOOGLE_CALENDAR.md` - Guía para configurar Google Calendar

## 🚀 Deployment

El proyecto está configurado para desplegarse en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

**URL de Producción**: https://asesorias.todossomostraders.com/

## 📊 Base de Datos

### Tablas Principales

- **services**: Servicios/mentorías disponibles
- **availability_slots**: Horarios disponibles para reservar
- **bookings**: Reservas realizadas por clientes
- **admin_users**: Usuarios administradores

## 🎨 Diseño

- Tema oscuro con acentos verdes (#00FF41)
- Estilo terminal/retro inspirado en Bloomberg Terminal
- Tipografía monospace (Geist Mono)
- Animaciones suaves con Framer Motion
- Diseño responsive para todos los dispositivos

## 📝 Scripts Disponibles

- `npm run dev` - Desarrollo local
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `node scripts/generate-icons-from-image.js` - Generar iconos PWA

## 🔄 Flujo Completo de una Reserva

1. Cliente visita el sitio
2. Selecciona un servicio
3. Elige fecha y hora del calendario
4. Completa formulario (nombre, email)
5. Redirección a Stripe Checkout
6. Completa el pago
7. Webhook procesa:
   - Actualiza booking a "paid"
   - Crea evento Google Calendar
   - Crea reunión Zoom
   - Envía emails
8. Cliente recibe confirmación con todos los detalles

## 👥 Roles

### Cliente
- Ver servicios disponibles
- Reservar horarios
- Realizar pagos
- Recibir confirmaciones

### Administrador
- Gestionar servicios
- Crear/editar horarios
- Ver todas las reservas
- Cancelar reservas
- Ver estado de integraciones

## 📞 Soporte

Para problemas o preguntas, consulta la documentación en los archivos `.md` del proyecto.

## 📄 Licencia

Proyecto privado - Todos Somos Traders

---

**Desarrollado con ❤️ para la comunidad de traders**

