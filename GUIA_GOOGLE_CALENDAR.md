# Guía para Configurar Google Calendar

## Paso 1: Habilitar la API de Google Calendar

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **APIs & Services** → **Library**
4. Busca **"Google Calendar API"**
5. Haz clic en **"Enable"**

## Paso 2: Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** → **Credentials**
2. Si es la primera vez, configura la **OAuth consent screen**:
   - Tipo: **External** (o Internal si tienes Google Workspace)
   - App name: **Asesorías TST** (o el nombre que prefieras)
   - User support email: **todossomostr4ders@gmail.com**
   - Developer contact: **todossomostr4ders@gmail.com**
   - Guarda y continúa
3. Haz clic en **"Create Credentials"** → **"OAuth client ID"**
4. Application type: **Web application**
5. Name: **Asesorías Calendar** (o el nombre que prefieras)
6. **Authorized redirect URIs**: Agrega:
   - `https://developers.google.com/oauthplayground`
7. Haz clic en **"Create"**
8. **Copia el Client ID y Client Secret** (los necesitarás después)

## Paso 3: Obtener el Refresh Token

### Opción A: Usando OAuth 2.0 Playground (Más fácil)

1. Ve a [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

2. Haz clic en el ícono de configuración (⚙️) en la esquina superior derecha

3. Marca la casilla **"Use your own OAuth credentials"**

4. Ingresa:
   - **OAuth Client ID**: El Client ID que copiaste en el paso anterior
   - **OAuth Client secret**: El Client Secret que copiaste en el paso anterior

5. Haz clic en **"Close"**

6. En el panel izquierdo, busca y selecciona:
   - **Calendar API v3** → **`https://www.googleapis.com/auth/calendar`**

7. Haz clic en **"Authorize APIs"**

8. **IMPORTANTE**: Inicia sesión con **todossomostr4ders@gmail.com**

9. Acepta los permisos solicitados

10. Haz clic en **"Exchange authorization code for tokens"**

11. **Copia el "Refresh token"** (es un string largo)

## Paso 4: Configurar Variables en Vercel

1. Ve a [Vercel](https://vercel.com/) → Tu proyecto → **Settings** → **Environment Variables**

2. Agrega o actualiza estas variables:

   - **GOOGLE_CALENDAR_CLIENT_ID**
     - Valor: El Client ID que copiaste del paso 2

   - **GOOGLE_CALENDAR_CLIENT_SECRET**
     - Valor: El Client Secret que copiaste del paso 2

   - **GOOGLE_CALENDAR_REFRESH_TOKEN**
     - Valor: El Refresh Token que copiaste del paso 3

3. Asegúrate de que las variables estén en **Production**, **Preview**, y **Development**

4. Vercel redeployará automáticamente

## Paso 5: Probar la Integración

1. Ve a tu admin dashboard → Pestaña **"Integraciones"**

2. Haz clic en **"Probar Google Calendar"**

3. Deberías ver un mensaje de éxito y un evento de prueba en tu Google Calendar

## Troubleshooting

### Error 403: Forbidden
- Verifica que la API de Google Calendar esté habilitada
- Asegúrate de que el refresh token sea de `todossomostr4ders@gmail.com`
- Verifica que el scope sea `https://www.googleapis.com/auth/calendar`

### Error 401: Unauthorized
- El refresh token puede haber expirado
- Regenera el refresh token siguiendo el Paso 3

### El evento no aparece en el calendario
- Verifica que estés revisando el calendario de `todossomostr4ders@gmail.com`
- Revisa la carpeta de spam/notificaciones por la invitación

## Notas Importantes

- El refresh token debe ser de **todossomostr4ders@gmail.com**
- Los eventos se crearán en el calendario de ese email
- Los clientes recibirán invitaciones automáticamente
- El refresh token no expira a menos que lo revoques manualmente
