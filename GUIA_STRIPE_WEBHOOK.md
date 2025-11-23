# Guía para Configurar Stripe Webhook con Dominio Real

## Paso 1: Configurar el Webhook en Stripe Dashboard

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Inicia sesión en tu cuenta
3. Ve a **Developers** → **Webhooks** (en el menú lateral izquierdo)
4. Haz clic en **"Add endpoint"** o **"Agregar endpoint"**

## Paso 2: Configurar el Endpoint

1. **Endpoint URL**: Ingresa tu URL de webhook:
   ```
   https://asesorias.todossomostraders.com/api/webhooks/stripe
   ```

2. **Description** (Opcional): "Webhook para procesar pagos de asesorías"

3. **Events to send**: Selecciona los eventos que necesitas:
   - ✅ `checkout.session.completed` - Cuando se completa un pago
   - ✅ `payment_intent.succeeded` - Cuando el pago es exitoso
   - ✅ `payment_intent.payment_failed` - Cuando el pago falla
   
   O selecciona **"Select all events"** si quieres recibir todos

4. Haz clic en **"Add endpoint"**

## Paso 3: Obtener el Webhook Secret

1. Una vez creado el endpoint, haz clic en él para ver los detalles
2. En la sección **"Signing secret"**, haz clic en **"Reveal"** o **"Revelar"**
3. Copia el **Signing secret** (empieza con `whsec_...`)
4. Este es tu nuevo `STRIPE_WEBHOOK_SECRET`

## Paso 4: Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Busca `STRIPE_WEBHOOK_SECRET`
4. Actualiza el valor con el nuevo secret que obtuviste
5. Guarda los cambios
6. Redespliega el proyecto

## Paso 5: Probar el Webhook

1. En Stripe Dashboard, ve a tu webhook
2. Haz clic en **"Send test webhook"** o **"Enviar webhook de prueba"**
3. Selecciona el evento `checkout.session.completed`
4. Haz clic en **"Send test webhook"**
5. Verifica que recibas una respuesta 200 OK

## Notas Importantes

- ⚠️ El webhook secret es diferente para cada endpoint
- 🔒 Mantén el secret seguro y no lo compartas
- ✅ Asegúrate de que tu dominio esté correctamente configurado en Vercel
- 🔄 Si cambias el endpoint, necesitarás un nuevo secret

## Troubleshooting

Si el webhook no funciona:
1. Verifica que la URL sea exactamente: `https://asesorias.todossomostraders.com/api/webhooks/stripe`
2. Verifica que el endpoint esté activo en Stripe
3. Revisa los logs en Vercel para ver errores
4. Revisa los logs en Stripe Dashboard → Webhooks → Tu endpoint → "Recent deliveries"

