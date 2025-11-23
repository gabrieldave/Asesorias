# Guía de Configuración de Zoom

Esta guía te ayudará a configurar la integración de Zoom para crear reuniones automáticamente cuando un cliente completa una compra.

## Paso 1: Crear una App OAuth en Zoom

1. Ve a [Zoom Marketplace](https://marketplace.zoom.us/)
2. Inicia sesión con tu cuenta de Zoom
3. Ve a **"Develop"** → **"Build App"** (o haz clic en "Create" en la esquina superior derecha)
4. Selecciona el tipo de app:
   - Busca **"OAuth"** o **"Server-to-Server OAuth"**
   - Si no aparece, busca **"OAuth"** y selecciona la opción que diga algo como "OAuth" o "Server-to-Server"
   - **Alternativa**: Si no encuentras "Server-to-Server", puedes usar **"OAuth"** normal (funciona igual)
5. Haz clic en **"Create"**
6. Completa la información:
   - **App Name**: "Asesorías TST" (o el nombre que prefieras)
   - **Company Name**: Tu nombre o empresa
   - **Developer Contact Information**: Tu email
   - **App Type**: Selecciona "Server-to-Server OAuth" si está disponible, o "OAuth" si no

## Paso 2: Configurar la App

1. **En la página de configuración de la app, busca estas secciones:**

   a) **App Credentials** o **Basic Information**:
   - Aquí verás tu `Client ID` y `Client Secret`
   - Si no los ves, haz clic en "Show" o "Reveal" para ver el Client Secret
   
   b) **Account ID**:
   - Puede estar en la sección "Basic Information"
   - O en la URL de tu app (después de `/app/`)
   - O en la sección "App Credentials"
   - **Formato**: Suele ser un número como `1234567890`

2. **Scopes (Permisos necesarios)** - Ve a la pestaña "Scopes" o "Permissions":
   - ✅ `meeting:write` - Para crear reuniones (OBLIGATORIO)
   - ✅ `meeting:write:admin` - Para crear reuniones como admin (opcional)
   - ✅ `user:read` - Para leer información del usuario (recomendado)
   - Haz clic en "Add" o marca las casillas para activar estos permisos

3. **Activation**: 
   - Ve a la pestaña "Activation" o "Publish"
   - Activa la app para tu cuenta
   - Acepta los términos si es necesario

## Paso 3: Obtener las Credenciales

Necesitas estos 3 valores (guárdalos en un lugar seguro):

1. **Account ID**: 
   - Busca en "Basic Information" o "App Credentials"
   - O en la URL de tu app: `https://marketplace.zoom.us/app/XXXXX/...` (el número después de `/app/`)
   - **Ejemplo**: `1234567890`

2. **Client ID**: 
   - En la sección "App Credentials" o "Basic Information"
   - Es un string largo, algo como: `abc123xyz...`

3. **Client Secret**: 
   - En la misma sección "App Credentials"
   - Haz clic en "Show" o "Reveal" para verlo (está oculto por seguridad)
   - Es un string largo, algo como: `def456uvw...`

**⚠️ IMPORTANTE**: Copia estos valores exactamente, sin espacios extra

## Paso 4: Agregar al .env.local

Agrega estas variables a tu archivo `.env.local`:

```env
ZOOM_ACCOUNT_ID=tu_account_id_aqui
ZOOM_CLIENT_ID=tu_client_id_aqui
ZOOM_CLIENT_SECRET=tu_client_secret_aqui
```

## Paso 5: Verificar la Configuración

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Haz una compra de prueba (usa el modo test de Stripe)

3. Verifica en los logs del servidor que se creó la reunión de Zoom

4. Revisa en tu dashboard de admin que el booking tiene el `zoom_link`

## Cómo Funciona

Cuando un cliente completa una compra:

1. ✅ Stripe envía un webhook a `/api/webhooks/stripe`
2. ✅ El sistema obtiene un access token de Zoom usando OAuth 2.0
3. ✅ Se crea una reunión de Zoom programada con:
   - Título: Nombre del servicio + nombre del cliente
   - Fecha/hora: La del slot reservado
   - Duración: La duración del slot
   - Participante: Email del cliente
4. ✅ El link de Zoom se guarda en la base de datos
5. ✅ Se envía un email al cliente con el link (si Resend está configurado)

## Solución de Problemas

### Error: "Zoom credentials not configured"
- Verifica que las 3 variables de entorno estén en `.env.local`
- Reinicia el servidor después de agregar las variables

### Error: "Zoom OAuth failed"
- Verifica que el Account ID, Client ID y Client Secret sean correctos
- Asegúrate de que la app esté activada en Zoom Marketplace
- Verifica que los scopes necesarios estén habilitados

### Error: "Failed to create Zoom meeting"
- Verifica que tengas permisos para crear reuniones en tu cuenta de Zoom
- Revisa que la fecha/hora del slot sea en el futuro
- Verifica los logs del servidor para más detalles

### La reunión no se crea
- Revisa los logs del servidor en la consola
- Verifica que el webhook de Stripe esté funcionando correctamente
- Asegúrate de que el slot tenga fecha/hora válida

## Notas Importantes

- ⚠️ Las reuniones se crean automáticamente solo después de que el pago se complete
- ⚠️ El link de Zoom se guarda en la base de datos y se puede ver en el dashboard admin
- ⚠️ El cliente recibirá el link por email si Resend está configurado
- ⚠️ Las reuniones se crean con la cuenta de Zoom asociada a las credenciales

## Próximos Pasos

Después de configurar Zoom, puedes:
1. Configurar Google Calendar para agregar eventos automáticamente
2. Personalizar los emails que se envían a los clientes
3. Agregar más configuraciones a las reuniones de Zoom (grabación, etc.)

