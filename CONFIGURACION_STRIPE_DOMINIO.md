# Configuración de Stripe para asesorias.todossomostraders.com

## 🔗 Tu Dominio
**URL de Producción:** https://asesorias.todossomostraders.com/

---

## 📋 Checklist de Configuración

### 1. Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y configura:

#### ✅ Variables Requeridas:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### ✅ Variables Opcionales (si las usas en el frontend):

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Nota:** Veo que ya tienes `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en tu `.env.local`. Asegúrate de agregarla también en Vercel.

---

## 🔔 Configuración del Webhook en Stripe

### Paso 1: Crear el Endpoint

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Haz clic en **"Add endpoint"**
3. Ingresa la URL:
   ```
   https://asesorias.todossomostraders.com/api/webhooks/stripe
   ```
4. Selecciona el evento: **checkout.session.completed**
5. Haz clic en **"Add endpoint"**

### Paso 2: Obtener el Webhook Secret

1. Después de crear el endpoint, haz clic en él
2. En la sección **"Signing secret"**, haz clic en **"Reveal"**
3. Copia el secret (empieza con `whsec_...`)
4. Agrega este secret como variable de entorno en Vercel:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## ✅ Verificación Rápida

### 1. Verificar Variables en Vercel

- [ ] `STRIPE_SECRET_KEY` configurada (debe empezar con `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` configurada (debe empezar con `whsec_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada (si la usas)

### 2. Verificar Webhook en Stripe

- [ ] Webhook creado con URL: `https://asesorias.todossomostraders.com/api/webhooks/stripe`
- [ ] Evento `checkout.session.completed` seleccionado
- [ ] Webhook en modo **Live** (no Test)

### 3. Probar el Flujo Completo

1. Ve a https://asesorias.todossomostraders.com/
2. Selecciona un servicio y agendar una sesión
3. Completa el pago (usa una tarjeta de prueba si estás en modo Test)
4. Verifica que:
   - El pago se procese correctamente
   - El booking se actualice a "paid"
   - Se cree el evento en Google Calendar
   - Se cree la reunión de Zoom
   - Se envíen los emails de confirmación

---

## 🔍 URLs Importantes

- **Sitio Web:** https://asesorias.todossomostraders.com/
- **Webhook Stripe:** https://asesorias.todossomostraders.com/api/webhooks/stripe
- **Página de Éxito:** https://asesorias.todossomostraders.com/success
- **Admin Dashboard:** https://asesorias.todossomostraders.com/admin

---

## 🛠️ Comandos Útiles

### Verificar que el Webhook Funciona

1. En Stripe Dashboard → Developers → Webhooks
2. Haz clic en tu endpoint
3. Ve a la pestaña **"Events"**
4. Deberías ver eventos `checkout.session.completed` cuando se complete un pago

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Deployments → Selecciona el último deployment
3. Functions → Ver logs de `/api/webhooks/stripe`

---

## ⚠️ Recordatorios Importantes

1. **Modo Live vs Test:**
   - En producción, usa claves de **Live mode** (`sk_live_...`, `pk_live_...`)
   - Las claves de Test (`sk_test_...`) solo funcionan en desarrollo

2. **Seguridad:**
   - Nunca subas las claves a Git
   - Solo configura las variables en Vercel
   - Mantén las claves privadas

3. **Webhook:**
   - Asegúrate de que el webhook esté en modo **Live**
   - Verifica que la URL sea exactamente: `https://asesorias.todossomostraders.com/api/webhooks/stripe`
   - No uses `localhost` o URLs de Vercel para el webhook en producción

---

## 📞 Si Algo No Funciona

1. **Revisa los logs:**
   - Vercel: Deployments → Functions → Logs
   - Stripe: Developers → Logs

2. **Verifica las variables:**
   - Asegúrate de que todas estén en Vercel
   - Verifica que no tengan espacios extra
   - Confirma que sean las claves de Live mode

3. **Prueba el webhook:**
   - En Stripe, ve a tu webhook → "Send test webhook"
   - Selecciona el evento `checkout.session.completed`
   - Verifica que llegue correctamente

---

## 🎉 ¡Listo para Producción!

Una vez que hayas completado todos los pasos, tu aplicación estará lista para recibir pagos reales.

**URL del Webhook para Stripe:**
```
https://asesorias.todossomostraders.com/api/webhooks/stripe
```

