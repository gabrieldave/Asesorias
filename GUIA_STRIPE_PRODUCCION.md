# Guía Completa: Configurar Stripe en Producción

Esta guía te ayudará a configurar Stripe en producción para que tu aplicación funcione con pagos reales.

## 📋 Requisitos Previos

- Cuenta de Stripe (si no la tienes, créala en [stripe.com](https://stripe.com))
- Proyecto desplegado en Vercel
- Acceso a tu dashboard de Vercel

---

## 🚀 Paso 1: Crear/Acceder a tu Cuenta de Stripe

1. Ve a [https://stripe.com](https://stripe.com)
2. Si no tienes cuenta, haz clic en "Sign up" y crea una cuenta
3. Si ya tienes cuenta, inicia sesión
4. Completa la información de tu negocio (nombre, dirección, etc.)

---

## 🔑 Paso 2: Obtener las Claves de API de Producción

### 2.1 Obtener la Secret Key

1. En el dashboard de Stripe, ve a **Developers** → **API keys**
2. Asegúrate de estar en modo **"Live mode"** (toggle en la parte superior)
3. En la sección **"Secret key"**, haz clic en **"Reveal test key"** o **"Reveal live key"**
4. Copia la clave que empieza con `sk_live_...` (NO uses `sk_test_...` en producción)
5. **⚠️ IMPORTANTE:** Guarda esta clave de forma segura, no la compartas

### 2.2 Obtener la Publishable Key (opcional, si la necesitas)

1. En la misma página, en la sección **"Publishable key"**
2. Copia la clave que empieza con `pk_live_...`
3. Esta clave se puede usar en el frontend de forma segura

---

## 🔔 Paso 3: Configurar el Webhook de Stripe

### 3.1 Crear el Endpoint del Webhook

1. En el dashboard de Stripe, ve a **Developers** → **Webhooks**
2. Haz clic en **"Add endpoint"**
3. Ingresa la URL de tu webhook:
   ```
   https://asesorias.todossomostraders.com/api/webhooks/stripe
   ```
   ⚠️ **IMPORTANTE:** Asegúrate de usar tu dominio real, no el de Vercel
4. Selecciona los eventos a escuchar:
   - **checkout.session.completed** (este es el más importante)
   - Opcionalmente puedes agregar otros eventos si los necesitas
5. Haz clic en **"Add endpoint"**

### 3.2 Obtener el Webhook Secret

1. Después de crear el endpoint, haz clic en él para ver los detalles
2. En la sección **"Signing secret"**, haz clic en **"Reveal"**
3. Copia el secret que empieza con `whsec_...`
4. **⚠️ IMPORTANTE:** Guarda este secret de forma segura

---

## ⚙️ Paso 4: Configurar Variables de Entorno en Vercel

### 4.1 Acceder a la Configuración de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### 4.2 Agregar las Variables de Stripe

Agrega las siguientes variables de entorno:

#### Variables Requeridas:

1. **STRIPE_SECRET_KEY**
   - Value: `sk_live_...` (la clave que copiaste en el Paso 2.1)
   - Environment: Production, Preview, Development (o solo Production si prefieres)

2. **STRIPE_WEBHOOK_SECRET**
   - Value: `whsec_...` (el secret que copiaste en el Paso 3.2)
   - Environment: Production, Preview, Development (o solo Production si prefieres)

#### Variables Opcionales (si las usas):

3. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** (si la necesitas en el frontend)
   - Value: `pk_live_...` (la clave que copiaste en el Paso 2.2)
   - Environment: Production, Preview, Development

### 4.3 Guardar y Redesplegar

1. Haz clic en **"Save"** para cada variable
2. Ve a **Deployments** y haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Esto asegurará que las nuevas variables se carguen

---

## ✅ Paso 5: Verificar la Configuración

### 5.1 Verificar que las Variables Estén Configuradas

1. En Vercel, ve a **Settings** → **Environment Variables**
2. Verifica que ambas variables (`STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`) estén presentes
3. Asegúrate de que estén en el ambiente correcto (Production)

### 5.2 Probar un Pago de Prueba

1. Ve a tu aplicación en producción
2. Intenta hacer una reserva con una tarjeta de prueba de Stripe
3. Usa estas tarjetas de prueba (solo funcionan en modo Test, no en Live):
   - **Tarjeta exitosa:** `4242 4242 4242 4242`
   - **CVV:** Cualquier 3 dígitos
   - **Fecha:** Cualquier fecha futura
   - **ZIP:** Cualquier código postal

   ⚠️ **NOTA:** En modo Live, necesitarás usar tarjetas reales. Para pruebas, puedes usar el modo Test primero.

### 5.3 Verificar el Webhook

1. En Stripe, ve a **Developers** → **Webhooks**
2. Haz clic en tu endpoint
3. Ve a la pestaña **"Events"**
4. Deberías ver eventos `checkout.session.completed` cuando se complete un pago
5. Si ves errores, revisa los logs en Vercel

---

## 🔍 Paso 6: Verificar Logs y Debugging

### 6.1 Ver Logs en Vercel

1. En Vercel, ve a **Deployments**
2. Selecciona tu deployment más reciente
3. Haz clic en **"Functions"** para ver los logs de las funciones serverless
4. Busca mensajes relacionados con Stripe

### 6.2 Ver Logs en Stripe

1. En Stripe, ve a **Developers** → **Logs**
2. Aquí verás todas las peticiones a la API de Stripe
3. Busca errores o eventos inesperados

---

## 🛠️ Solución de Problemas Comunes

### Problema: "No signature provided" o "Webhook signature verification failed"

**Solución:**
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado correctamente en Vercel
- Asegúrate de que el secret sea el correcto (debe empezar con `whsec_`)
- Verifica que el webhook esté configurado en Stripe con la URL correcta

### Problema: "Invalid API Key"

**Solución:**
- Verifica que `STRIPE_SECRET_KEY` esté configurado correctamente
- Asegúrate de estar usando la clave de **Live mode** (`sk_live_...`) y no la de Test (`sk_test_...`)
- Verifica que la clave no tenga espacios extra al copiarla

### Problema: El webhook no se está ejecutando

**Solución:**
- Verifica que la URL del webhook en Stripe sea correcta
- Asegúrate de que el endpoint esté en modo **Live** en Stripe
- Verifica que el evento `checkout.session.completed` esté seleccionado
- Revisa los logs en Stripe para ver si hay errores

### Problema: Los pagos se procesan pero no se actualiza el booking

**Solución:**
- Verifica los logs en Vercel para ver si el webhook se está ejecutando
- Revisa que el webhook tenga acceso a Supabase (verifica `SUPABASE_SERVICE_ROLE_KEY`)
- Verifica que el booking_id esté en los metadata de la sesión de Stripe

---

## 📝 Checklist Final

Antes de considerar que Stripe está completamente configurado, verifica:

- [ ] Cuenta de Stripe creada y verificada
- [ ] Modo Live activado en Stripe
- [ ] `STRIPE_SECRET_KEY` configurado en Vercel (clave `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` configurado en Vercel (secret `whsec_...`)
- [ ] Webhook creado en Stripe con la URL correcta
- [ ] Evento `checkout.session.completed` seleccionado en el webhook
- [ ] Deployment redeseado en Vercel después de agregar las variables
- [ ] Prueba de pago realizada exitosamente
- [ ] Webhook recibiendo eventos correctamente
- [ ] Booking actualizado a "paid" después del pago
- [ ] Email de confirmación enviado al cliente

---

## 🔐 Seguridad

### Buenas Prácticas:

1. **Nunca** compartas tus claves de API
2. **Nunca** subas las claves a Git (deben estar solo en Vercel)
3. Usa diferentes claves para desarrollo y producción
4. Rota las claves periódicamente si sospechas que fueron comprometidas
5. Monitorea los logs regularmente para detectar actividad sospechosa

### Variables que NO deben estar en Git:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- Cualquier otra clave secreta

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel y Stripe
2. Consulta la documentación de Stripe: [https://stripe.com/docs](https://stripe.com/docs)
3. Verifica que todas las variables de entorno estén configuradas correctamente

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará lista para recibir pagos reales con Stripe.

**Recuerda:** En modo Live, los pagos son reales. Asegúrate de probar todo en modo Test primero antes de activar el modo Live.

