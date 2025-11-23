# Configurar ngrok (Requiere cuenta)

Ngrok ahora requiere una cuenta gratuita para funcionar. Sigue estos pasos:

## Paso 1: Crear cuenta en ngrok

1. Ve a: https://dashboard.ngrok.com/signup
2. Crea una cuenta gratuita (solo necesitas email)
3. Verifica tu email

## Paso 2: Obtener tu authtoken

1. Después de iniciar sesión, ve a: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copia tu authtoken (algo como: `2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`)

## Paso 3: Configurar ngrok

Abre una terminal y ejecuta:

```bash
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

Reemplaza `TU_AUTHTOKEN_AQUI` con el authtoken que copiaste.

## Paso 4: Ejecutar ngrok

Después de configurar el authtoken:

```bash
ngrok http 3000
```

Verás algo como:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

## Paso 5: Usar en Stripe

Copia la URL HTTPS y úsala en Stripe:
```
https://TU-URL-NGROK/api/webhooks/stripe
```

---

## Alternativa: Seguir con localtunnel

Si prefieres no crear cuenta en ngrok, puedes seguir con localtunnel pero necesitarás configurar Stripe para que envíe un header especial. Es más complicado pero funciona.


