# Configuración PWA - Asesorías TST

## ✅ Estado: Configurado

El proyecto está configurado como Progressive Web App (PWA) y está listo para usar.

## 📁 Archivos PWA

- `public/manifest.json` - Manifest de la aplicación
- `public/sw.js` - Service Worker para funcionalidad offline
- `public/icon-192x192.png` - Icono 192x192
- `public/icon-512x512.png` - Icono 512x512
- `components/PWARegister.tsx` - Componente que registra el Service Worker
- `app/layout.tsx` - Layout con metadata PWA

## 🚀 Características PWA

✅ **Instalable**: Los usuarios pueden instalar la app en sus dispositivos
✅ **Offline**: Service Worker cachea recursos para funcionar offline
✅ **Iconos**: Iconos personalizados para la app
✅ **Tema**: Color de tema verde (#00FF41) que coincide con el diseño
✅ **Standalone**: Se abre como app independiente sin barra del navegador

## 📱 Cómo probar la PWA

### En Chrome/Edge (Desktop):
1. Abre la aplicación en el navegador
2. Busca el icono de "Instalar" en la barra de direcciones
3. O ve a: Menú → "Instalar [nombre de la app]"

### En Chrome (Android):
1. Abre la aplicación
2. Aparecerá un banner de "Agregar a pantalla de inicio"
3. O ve a: Menú → "Agregar a pantalla de inicio"

### En Safari (iOS):
1. Abre la aplicación
2. Toca el botón de compartir
3. Selecciona "Agregar a pantalla de inicio"

## 🔧 Verificar PWA

### Lighthouse (Chrome DevTools):
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona "Progressive Web App"
4. Haz clic en "Generar informe"
5. Debería pasar todas las pruebas PWA

### Verificar Service Worker:
1. Abre Chrome DevTools (F12)
2. Ve a "Application" → "Service Workers"
3. Deberías ver el Service Worker registrado

### Verificar Manifest:
1. Abre Chrome DevTools (F12)
2. Ve a "Application" → "Manifest"
3. Deberías ver toda la información del manifest

## 🎨 Personalizar Iconos

Si quieres cambiar los iconos:

1. Reemplaza los archivos en `public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`

2. O regenera los iconos:
   ```bash
   node scripts/generate-icons.js
   node scripts/generate-icons-png.js
   ```

## 📝 Notas

- El Service Worker usa estrategia "Network First" con fallback a cache
- Los recursos se cachean automáticamente al visitarlos
- El cache se limpia automáticamente cuando hay actualizaciones
- La app funciona offline después de la primera visita

## 🔄 Actualizar PWA

Para forzar una actualización del Service Worker:

1. Cambia el `CACHE_NAME` en `public/sw.js`
2. O elimina el cache desde DevTools: Application → Storage → Clear site data



