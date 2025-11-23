# 🔐 Guía de Acceso al Dashboard Admin

## Credenciales de Acceso

**Email:** Configura tu email de administrador en `.env.local`  
**Contraseña:** La que configuraste cuando creaste el usuario en Supabase

## Pasos para Acceder

### 1. Configurar Variables de Entorno

Primero, asegúrate de tener configurado tu email en `.env.local`:

```env
NEXT_PUBLIC_ADMIN_EMAIL=tu_email@example.com
ADMIN_EMAIL=tu_email@example.com
```

### 2. Crear Usuario en Supabase

1. Ve a tu Supabase Dashboard
2. Authentication → Users
3. Crea un nuevo usuario con tu email de administrador
4. Guarda la contraseña de forma segura

### 3. Ir a la página de Login

Abre en tu navegador:
```
http://localhost:3000/login
```

### 4. Ingresar Credenciales

- **Email:** El email que configuraste en `.env.local`
- **Contraseña:** La contraseña que creaste en Supabase

### 5. Acceder al Dashboard

Una vez autenticado, serás redirigido automáticamente a:
```
http://localhost:3000/admin
```

## Funcionalidades del Dashboard

### 📊 Pestaña "Servicios"
- Ver todos los servicios
- **Crear nuevo servicio:** Botón "Nuevo Servicio"
- **Editar servicio:** Botón "Editar" en cada tarjeta
- Activar/Desactivar servicios

### 📅 Pestaña "Slots"
- Ver todos los slots de disponibilidad
- **Crear nuevo slot:** Botón "Nuevo Slot"
  - Formato de fecha: `YYYY-MM-DD HH:mm` (ej: `2025-01-15 14:00`)
  - Duración en minutos (ej: `60`)
- Eliminar slots disponibles

### 👥 Pestaña "Reservas"
- Ver todas las reservas
- Ver estado de pago (Pagado/Pendiente/Fallido)
- Ver links de Zoom (si están configurados)

## Si Olvidaste tu Contraseña

1. Ve a tu Supabase Dashboard
2. Authentication → Users
3. Busca tu email de administrador
4. Puedes resetear la contraseña desde ahí

## Seguridad

- Solo los emails configurados en `NEXT_PUBLIC_ADMIN_EMAIL` pueden acceder al dashboard
- El dashboard está protegido y solo permite acceso a usuarios autenticados
- Todos los cambios se guardan directamente en Supabase
- **NUNCA** subas tu archivo `.env.local` al repositorio (está en `.gitignore`)

## Notas Importantes

- El usuario debe existir en Supabase Auth antes de poder hacer login
- Si no recuerdas la contraseña, puedes resetearla desde Supabase Dashboard
- Puedes configurar múltiples emails de administrador separándolos por comas en el código (requiere modificación)
