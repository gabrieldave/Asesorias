# Instrucciones Simples para Obtener el Refresh Token

## Paso 1: Configurar OAuth Playground

1. En OAuth 2.0 Playground, haz clic en el **ícono de configuración (⚙️)** en la esquina superior derecha

2. Marca la casilla **"Use your own OAuth credentials"**

3. Pega tu **Client ID** (de Google Cloud Console)

4. Pega tu **Client Secret** (de Google Cloud Console)

5. Haz clic en **"Close"**

## Paso 2: Seleccionar el Scope

1. En la lista de APIs de la izquierda, busca **"Calendar API v3"**

2. Expande "Calendar API v3" (haz clic en la flecha)

3. Marca la casilla de: **`https://www.googleapis.com/auth/calendar`**

   (O simplemente escribe en el campo de abajo: `https://www.googleapis.com/auth/calendar`)

## Paso 3: Autorizar

1. Haz clic en el botón azul **"Authorize APIs"**

2. **IMPORTANTE**: Inicia sesión con **todossomostr4ders@gmail.com**

3. Acepta los permisos

## Paso 4: Obtener el Token

1. Después de autorizar, verás el **Paso 2** expandido

2. Haz clic en el botón azul **"Exchange authorization code for tokens"**

3. En la respuesta que aparece a la derecha, busca **"Refresh token"**

4. **Copia ese refresh token** (es un string largo)

## Paso 5: Configurar en Vercel

1. Ve a Vercel → Tu proyecto → Settings → Environment Variables

2. Actualiza `GOOGLE_CALENDAR_REFRESH_TOKEN` con el token que copiaste

3. Guarda y espera a que Vercel redeploye

