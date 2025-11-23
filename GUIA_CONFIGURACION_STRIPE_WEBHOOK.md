# Guía de Configuración de Stripe Webhook

Esta guía te ayudará a configurar el webhook de Stripe para que tu aplicación reciba notificaciones cuando se completen los pagos.

## Paso 1: Obtener la URL del Webhook

Tu webhook debe apuntar a:
```
https://tu-dominio.com/api/webhooks/stripe
```

**Para desarrollo local**, necesitas usar un túnel (ngrok, localtunnel, etc.) porque Stripe necesita una URL pública.

### Opción A: Usar ngrok (Recomendado para pruebas)

1. **Instala ngrok**: https://ngrok.com/download
2. **Inicia tu servidor local**:
   ```bash
   npm run dev
   ```
3. **En otra terminal, ejecuta ngrok**:
   ```bash
   ngrok http 3000
   ```
4. **Copia la URL HTTPS** que ngrok te da (algo como `https://abc123.ngrok.io`)
5. **Tu webhook URL será**: `https://abc123.ngrok.io/api/webhooks/stripe`

### Opción B: Usar localtunnel (Alternativa)

1. **Instala localtunnel**:
   ```bash
   npm install -g localtunnel
   ```
2. **Inicia tu servidor local**:
   ```bash
   npm run dev
   ```
3. **En otra terminal, ejecuta localtunnel**:
   ```bash
   lt --port 3000
   ```
4. **Copia la URL** que te da y úsala como webhook URL

### Opción C: Para Producción

Si ya tienes tu app en producción (Vercel, Netlify, etc.):
- Tu webhook URL será: `https://tu-dominio.com/api/webhooks/stripe`

## Paso 2: Configurar el Webhook en Stripe Dashboard

1. **Ve a [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Inicia sesión** con tu cuenta de Stripe
3. **Ve a "Developers"** → **"Webhooks"** (en el menú lateral)
4. **Haz clic en "Add endpoint"** o **"Add webhook"**
5. **Completa el formulario**:
   - **Endpoint URL**: Pega la URL de tu webhook (del Paso 1)
     - Ejemplo: `https://abc123.ngrok.io/api/webhooks/stripe`
   - **Description**: "Asesorías TST - Payment webhook" (opcional)
6. **Selecciona los eventos** que quieres escuchar:
   - ✅ **`checkout.session.completed`** (OBLIGATORIO)
   - Este es el evento que se dispara cuando un cliente completa el pago
7. **Haz clic en "Add endpoint"**

## Paso 3: Obtener el Webhook Secret

1. **Después de crear el webhook**, haz clic en él en la lista
2. **En la sección "Signing secret"**, verás algo como:
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **Haz clic en "Reveal"** o **"Click to reveal"** para ver el secret completo
4. **Copia el secret completo** (empieza con `whsec_`)

## Paso 4: Agregar al .env.local

Agrega el secret a tu archivo `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

**⚠️ IMPORTANTE**: 
- Reemplaza `whsec_tu_secret_aqui` con el secret real que copiaste
- No compartas este secret con nadie
- Cada webhook tiene su propio secret único

## Paso 5: Reiniciar el Servidor

Después de agregar el secret:

```bash
# Detén el servidor (Ctrl+C)
# Reinícialo
npm run dev
```

## Paso 6: Probar el Webhook

1. **Haz una compra de prueba** usando Stripe Test Mode
2. **Ve a Stripe Dashboard** → **"Developers"** → **"Webhooks"**
3. **Haz clic en tu webhook**
4. **Ve a la pestaña "Events"** o **"Logs"**
5. **Deberías ver** el evento `checkout.session.completed` con status "Succeeded"

## Verificación en tu App

Después de una compra exitosa:

1. **Revisa los logs del servidor** - Deberías ver mensajes sobre el webhook
2. **Ve al dashboard admin** → Pestaña "Reservas"
3. **Verifica que el booking**:
   - Tiene `payment_status: "paid"`
   - Tiene `zoom_link` (si Zoom está configurado)
   - El slot está marcado como reservado

## Solución de Problemas

### Error: "No signature provided"
- Verifica que `STRIPE_WEBHOOK_SECRET` esté en `.env.local`
- Reinicia el servidor después de agregarlo

### Error: "Webhook signature verification failed"
- Verifica que el secret sea correcto (debe empezar con `whsec_`)
- Asegúrate de usar el secret del webhook correcto (cada webhook tiene su propio secret)

### El webhook no se recibe
- Verifica que la URL del webhook sea correcta y accesible
- Para desarrollo local, asegúrate de que ngrok/localtunnel esté corriendo
- Revisa los logs en Stripe Dashboard → Webhooks → Tu webhook → Events

### El webhook se recibe pero no funciona
- Revisa los logs del servidor para ver errores
- Verifica que las variables de entorno estén correctas
- Asegúrate de que la base de datos esté accesible

## Notas Importantes

- ⚠️ **Para desarrollo local**: Necesitas un túnel (ngrok) porque Stripe necesita una URL pública
- ⚠️ **Para producción**: Usa la URL real de tu dominio
- ⚠️ **Test vs Live**: Stripe tiene webhooks separados para Test Mode y Live Mode
- ⚠️ **Cada webhook tiene su propio secret**: No uses el secret de otro webhook

## Próximos Pasos

Después de configurar el webhook:
1. Prueba con una compra de test
2. Verifica que se cree el booking correctamente
3. Verifica que se cree la reunión de Zoom (si está configurado)
4. Verifica que se envíen los emails (si Resend está configurado)


