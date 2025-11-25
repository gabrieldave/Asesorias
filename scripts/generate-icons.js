/**
 * Script para generar iconos PWA básicos
 * Requiere: npm install sharp (opcional, para mejor calidad)
 * 
 * Si no tienes sharp, puedes usar un generador online:
 * https://realfavicongenerator.net/
 * https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

// Crear un SVG simple para el icono
const createIconSVG = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" fill="none" stroke="#00FF41" stroke-width="${size * 0.05}"/>
  <text x="50%" y="50%" font-family="monospace" font-size="${size * 0.3}" fill="#00FF41" text-anchor="middle" dominant-baseline="middle" font-weight="bold">TST</text>
</svg>`;
};

// Crear directorio public si no existe
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generar SVG para 192x192
const svg192 = createIconSVG(192);
fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), svg192);

// Generar SVG para 512x512
const svg512 = createIconSVG(512);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), svg512);

console.log('✅ Iconos SVG generados en public/');
console.log('📝 Nota: Para convertir a PNG, usa un convertidor online o:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/imageGenerator');
console.log('   - O instala sharp: npm install sharp --save-dev');



