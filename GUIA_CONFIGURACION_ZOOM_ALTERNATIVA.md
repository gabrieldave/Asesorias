# Guía Alternativa: Configuración de Zoom (Si no encuentras Server-to-Server OAuth)

Si no encuentras la opción "Server-to-Server OAuth" en Zoom Marketplace, aquí tienes alternativas:

## Opción 1: Usar OAuth Normal (Recomendado)

1. Ve a [Zoom Marketplace](https://marketplace.zoom.us/)
2. **Develop** → **Build App**
3. Selecciona **"OAuth"** (sin el "Server-to-Server")
4. Completa el formulario y crea la app
5. Sigue los mismos pasos de configuración de scopes y credenciales

**Nota**: OAuth normal también funciona para Server-to-Server, solo necesitas las credenciales correctas.

## Opción 2: Usar JWT (Más simple, pero menos seguro)

Si OAuth no funciona, podemos cambiar el código para usar JWT. Esto requiere:
- API Key
- API Secret

Pero JWT está siendo deprecado por Zoom, así que OAuth es mejor.

## Opción 3: Verificar tu Tipo de Cuenta

Algunas cuentas de Zoom (especialmente las gratuitas) pueden tener limitaciones:

1. Verifica que tengas una cuenta de Zoom con permisos de desarrollador
2. Si tienes cuenta gratuita, considera actualizar a una cuenta Pro o Business
3. Algunas funciones requieren cuenta pagada

## Opción 4: Contactar Soporte de Zoom

Si ninguna opción funciona:
1. Ve a [Zoom Developer Support](https://devforum.zoom.us/)
2. Pregunta sobre cómo crear una app Server-to-Server OAuth
3. O contacta soporte de Zoom directamente

## Verificación Rápida

Para verificar qué tipo de apps puedes crear:
1. Ve a tu perfil en Zoom Marketplace
2. Revisa "My Apps" o "Developed Apps"
3. Si ya tienes apps, revisa su tipo para referencia

## Solución Temporal

Mientras configuras Zoom, el sistema seguirá funcionando:
- ✅ Las compras se procesan correctamente
- ✅ Los bookings se crean en la base de datos
- ⚠️ Solo falta el link de Zoom (se puede agregar manualmente después)

Puedes agregar el link de Zoom manualmente en el dashboard admin después de crear la reunión en Zoom.


