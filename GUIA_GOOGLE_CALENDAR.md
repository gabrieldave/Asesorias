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
   - Si es la primera vez, verás un botón "CREAR" o "CONFIGURAR CONSENTIMIENTO"
   - Si ya existe, verás "EDITAR APP"
2. Selecciona **Externo** (a menos que tengas una cuenta de Google Workspace)
3. Haz clic en **CREAR** (o **EDITAR APP** si ya existe)
4. **Paso 1 - Información de la aplicación:**
   - Completa el formulario:
     - **Nombre de la aplicación**: "Asesorias - Todos Somos Traders"
     - **Correo electrónico de soporte**: Tu email
     - **Correo electrónico del desarrollador**: Tu email
   - Haz clic en **GUARDAR Y CONTINUAR**

5. **⚠️ IMPORTANTE: Configurar Ámbitos (SCOPES)**

   **Opción A: Si ves la sección de Ámbitos en la pantalla de consentimiento:**
   - Después del Paso 1, deberías ver un **Paso 2** con una sección de **"Ámbitos"** o **"Scopes"**
   - Haz clic en **"AGREGAR O QUITAR ÁMBITOS"** o **"ADD OR REMOVE SCOPES"**
   - Busca y selecciona:
     - ✅ `https://www.googleapis.com/auth/calendar`
     - ✅ `https://www.googleapis.com/auth/calendar.events`
   - Haz clic en **"ACTUALIZAR"** y luego **GUARDAR Y CONTINUAR**

   **Opción B: Si NO ves la sección de Ámbitos (interfaz nueva):**
   - Los ámbitos se pueden agregar automáticamente cuando uses la API
   - O puedes agregarlos más tarde cuando crees las credenciales OAuth
   - **Continúa con los siguientes pasos** y los ámbitos se configurarán cuando uses la API

6. **Paso 2 o 3 - Usuarios de prueba:**
   - Agrega tu email (y otros emails que necesiten acceso durante desarrollo)
   - Haz clic en **GUARDAR Y CONTINUAR**

7. **Resumen:**
   - Revisa la información
   - Haz clic en **VOLVER AL PANEL** o **GUARDAR Y CONTINUAR** para completar

**Nota:** Si no encuentras los ámbitos en la pantalla de consentimiento, no te preocupes. Los ámbitos se pueden especificar directamente cuando uses la API o en el código de autorización. Continúa con el siguiente paso.

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

**Los ámbitos se configuran aquí automáticamente** cuando autorizas la aplicación. Tienes dos opciones:

### Opción A: Usar el Script de Node.js (Recomendado)

1. Ejecuta el script `get-google-refresh-token.js` que está en este proyecto:
   ```bash
   node get-google-refresh-token.js
   ```
2. El script te pedirá tus credenciales y luego te dará una URL
3. Al autorizar, los ámbitos de Calendar se solicitarán automáticamente
4. Obtendrás el refresh token directamente

### Opción B: Usar la Herramienta de Google OAuth Playground (Más fácil para ver los ámbitos)

**PASO 1: Configurar tus credenciales**

1. Ve a [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Haz clic en el ícono de **configuración (⚙️)** en la esquina superior derecha
3. Marca la casilla **"Use your own OAuth credentials"**
4. Ingresa:
   - **OAuth Client ID**: Tu `GOOGLE_CALENDAR_CLIENT_ID`
   - **OAuth Client secret**: Tu `GOOGLE_CALENDAR_CLIENT_SECRET`
5. Haz clic en **"Close"** o cierra el modal

**PASO 2: Seleccionar los ámbitos (Scopes)**

1. En el panel izquierdo, busca **"Step 1: Select & authorize APIs"**
2. Si está colapsado (con una flecha ►), haz clic para expandirlo
3. En el campo de búsqueda o en la lista, busca **"Calendar"**
4. Busca y marca (checkbox) estos dos ámbitos:
   - ✅ **Calendar API v3** → `https://www.googleapis.com/auth/calendar`
   - ✅ **Calendar API v3 - Events** → `https://www.googleapis.com/auth/calendar.events`
5. Una vez seleccionados, verás que aparecen en el campo de texto arriba

**PASO 3: Autorizar**

1. Haz clic en el botón **"Authorize APIs"** (arriba a la izquierda, debajo de Step 1)
2. Se abrirá una nueva ventana/pestaña de Google
3. Inicia sesión con tu cuenta de Google (la misma que usaste para crear las credenciales)
4. **Verás una pantalla de consentimiento** pidiendo permisos para Calendar
5. Haz clic en **"Allow"** o **"Permitir"** o **"Continuar"**
6. La ventana se cerrará y regresarás al OAuth Playground
7. Verás que Step 1 ahora muestra un código de autorización

**PASO 4: Obtener el Refresh Token**

1. Ahora ve a **"Step 2: Exchange authorization code for tokens"**
2. Haz clic en el botón **"Exchange authorization code for tokens"** (botón azul)
3. En el panel derecho verás la respuesta JSON
4. Busca en la respuesta el campo **"refresh_token"**
5. **Copia ese valor** → Este es tu `GOOGLE_CALENDAR_REFRESH_TOKEN`
6. También verás `"access_token"` y `"scope": "https://www.googleapis.com/auth/calendar"` confirmando que funcionó

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

