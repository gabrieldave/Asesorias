# Guía para Configurar Google Calendar API

## Paso 1: Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el selector de proyectos (arriba a la izquierda)
4. Haz clic en "NUEVO PROYECTO"
5. Ingresa un nombre para tu proyecto (ej: "Asesorias Calendar")
6. Haz clic en "CREAR"

## Paso 2: Habilitar la API de Google Calendar

1. En el menú lateral, ve a **APIs y servicios** → **Biblioteca**
2. Busca "Google Calendar API"
3. Haz clic en "Google Calendar API"
4. Haz clic en el botón **HABILITAR**

## Paso 3: Configurar la Pantalla de Consentimiento OAuth

1. Ve a **APIs y servicios** → **Pantalla de consentimiento de OAuth**
2. Selecciona **Externo** (a menos que tengas una cuenta de Google Workspace)
3. Haz clic en **CREAR**
4. Completa el formulario:
   - **Nombre de la aplicación**: "Asesorias - Todos Somos Traders"
   - **Correo electrónico de soporte**: Tu email
   - **Correo electrónico del desarrollador**: Tu email
5. Haz clic en **GUARDAR Y CONTINUAR**
6. En **Ámbitos**, haz clic en **AGREGAR O QUITAR ÁMBITOS**
7. Busca y selecciona:
   - `https://www.googleapis.com/auth/calendar` (Leer y escribir eventos)
   - `https://www.googleapis.com/auth/calendar.events` (Acceso completo a eventos)
8. Haz clic en **ACTUALIZAR** y luego **GUARDAR Y CONTINUAR**
9. En **Usuarios de prueba**, agrega tu email (y otros emails que necesiten acceso durante desarrollo)
10. Haz clic en **GUARDAR Y CONTINUAR** hasta completar

## Paso 4: Crear Credenciales OAuth 2.0

1. Ve a **APIs y servicios** → **Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth**
3. Selecciona **Aplicación web**
4. Configura:
   - **Nombre**: "Asesorias Web Client"
   - **Orígenes de JavaScript autorizados**: 
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.vercel.app` (tu dominio de Vercel)
   - **URIs de redireccionamiento autorizadas**:
     - `http://localhost:3000/api/auth/google/callback` (para desarrollo)
     - `https://tu-dominio.vercel.app/api/auth/google/callback` (tu dominio de Vercel)
5. Haz clic en **CREAR**
6. **¡IMPORTANTE!** Copia y guarda:
   - **ID de cliente** → Este es tu `GOOGLE_CALENDAR_CLIENT_ID`
   - **Secreto de cliente** → Este es tu `GOOGLE_CALENDAR_CLIENT_SECRET`

## Paso 5: Obtener el Refresh Token

Tienes dos opciones:

### Opción A: Usar el Script de Node.js (Recomendado)

Ejecuta el script `get-google-refresh-token.js` que está en este proyecto.

### Opción B: Usar la Herramienta de Google OAuth Playground

1. Ve a [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Haz clic en el ícono de configuración (⚙️) en la esquina superior derecha
3. Marca "Use your own OAuth credentials"
4. Ingresa tu `GOOGLE_CALENDAR_CLIENT_ID` y `GOOGLE_CALENDAR_CLIENT_SECRET`
5. En la lista de APIs, busca y selecciona:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
6. Haz clic en **Authorize APIs**
7. Inicia sesión y otorga los permisos
8. Haz clic en **Exchange authorization code for tokens**
9. Copia el **Refresh token** → Este es tu `GOOGLE_CALENDAR_REFRESH_TOKEN`

## Paso 6: Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega las tres variables:
   - `GOOGLE_CALENDAR_CLIENT_ID`
   - `GOOGLE_CALENDAR_CLIENT_SECRET`
   - `GOOGLE_CALENDAR_REFRESH_TOKEN`
4. Guarda y redespliega

## Notas Importantes

- El **Refresh Token** solo se muestra una vez. Guárdalo de forma segura.
- Si pierdes el refresh token, tendrás que generar uno nuevo.
- En producción, asegúrate de agregar tu dominio de Vercel a los orígenes y URIs autorizados.
- Los usuarios de prueba solo pueden usar la app durante el desarrollo. Para producción, necesitarás publicar la app.

