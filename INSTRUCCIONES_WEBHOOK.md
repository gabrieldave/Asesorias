# Instrucciones Rápidas: Configurar Webhook de Stripe

## ✅ Ya tienes:
- STRIPE_WEBHOOK_SECRET configurado en .env.local

## 🔧 Lo que falta:

### Paso 1: Iniciar ngrok

1. **Abre una nueva terminal** (no cierres la que tiene `npm run dev`)
2. **Ejecuta ngrok**:
   ```bash
   ngrok http 3000
   ```
3. **Copia la URL HTTPS** que aparece, algo como:
   ```
   https://abc123def456.ngrok-free.app
   ```
   O si es versión antigua:
   ```
   https://abc123.ngrok.io
   ```

### Paso 2: Actualizar el Webhook en Stripe

1. Ve a https://dashboard.stripe.com/test/webhooks
2. **Haz clic en tu webhook** (el que creaste)
3. **Haz clic en "Edit"** o el ícono de editar
4. **Actualiza la URL** con tu URL real de ngrok:
   ```
   https://TU-URL-NGROK/api/webhooks/stripe
   ```
   Ejemplo:
   ```
   https://abc123def456.ngrok-free.app/api/webhooks/stripe
   ```
5. **Guarda los cambios**

### Paso 3: Probar

1. **Haz una compra de prueba** en tu app
2. **Ve a Stripe Dashboard** → **Webhooks** → **Tu webhook** → **Events**
3. **Deberías ver** el evento `checkout.session.completed` con status "Succeeded"

## ⚠️ IMPORTANTE:

- **Mantén ngrok corriendo** mientras desarrollas
- **Cada vez que reinicies ngrok**, obtendrás una URL nueva
- **Actualiza el webhook en Stripe** si cambia la URL de ngrok
- **Para producción**, usa tu dominio real (no ngrok)

## 🔍 Verificar que funciona:

Después de una compra:
1. Revisa los logs del servidor (deberías ver mensajes del webhook)
2. Ve al dashboard admin → Reservas
3. El booking debería tener `payment_status: "paid"`
4. Si Zoom está configurado, debería tener `zoom_link`


