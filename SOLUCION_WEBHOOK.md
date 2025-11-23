# Solución: Webhook con ngrok (Recomendado)

Localtunnel tiene una página de contraseña que bloquea los webhooks de Stripe. **ngrok** es mejor para webhooks porque no tiene esta limitación.

## Instalar ngrok

1. **Descarga ngrok**: https://ngrok.com/download
2. **Extrae** el archivo `ngrok.exe`
3. **Colócalo** en una carpeta fácil, ejemplo: `C:\ngrok\`

## Usar ngrok

1. **Abre una nueva terminal**
2. **Navega a la carpeta de ngrok** (o agrega ngrok al PATH):
   ```bash
   cd C:\ngrok
   ```
3. **Ejecuta ngrok**:
   ```bash
   ngrok http 3000
   ```
4. **Copia la URL HTTPS** que aparece (algo como `https://abc123.ngrok-free.app`)

## Actualizar en Stripe

1. Ve a Stripe Dashboard → Webhooks
2. Edita tu webhook
3. Cambia la URL a:
   ```
   https://TU-URL-NGROK/api/webhooks/stripe
   ```
4. Guarda

## Alternativa: Usar localtunnel con bypass

Si prefieres seguir con localtunnel, puedes configurar Stripe para que envíe un header especial, pero es más complicado. **ngrok es más simple y confiable para webhooks**.


