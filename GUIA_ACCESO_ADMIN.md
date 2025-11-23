# 🔐 Guía de Acceso al Dashboard Admin

## Credenciales de Acceso

**Email:** `david.del.rio.colin@gmail.com`  
**Contraseña:** (La que configuraste cuando creaste el usuario en Supabase)

## Pasos para Acceder

### 1. Ir a la página de Login
Abre en tu navegador:
```
http://localhost:3000/login
```

### 2. Ingresar Credenciales
- **Email:** `david.del.rio.colin@gmail.com`
- **Contraseña:** Tu contraseña de Supabase

### 3. Acceder al Dashboard
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

1. Ve a Supabase Dashboard: https://supabase.com/dashboard/project/vdgbqkokslhmzdvedimv
2. Authentication → Users
3. Busca `david.del.rio.colin@gmail.com`
4. Puedes resetear la contraseña desde ahí

## Configuración de Variables de Entorno

Asegúrate de tener en tu `.env.local`:

```env
NEXT_PUBLIC_ADMIN_EMAIL=david.del.rio.colin@gmail.com
```

Esto asegura que solo tu email tenga acceso al dashboard.

## Notas Importantes

- El usuario ya existe en Supabase Auth
- Si no recuerdas la contraseña, puedes resetearla desde Supabase Dashboard
- El dashboard está protegido y solo permite acceso a usuarios autenticados
- Todos los cambios se guardan directamente en Supabase

