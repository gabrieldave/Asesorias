/**
 * Script para generar iconos PWA en formato PNG desde SVG
 * Requiere: npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Sharp no está instalado. Ejecuta: npm install sharp --save-dev');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');

async function generatePNGFromSVG(svgPath, pngPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`✅ Generado: ${path.basename(pngPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Error generando ${pngPath}:`, error.message);
  }
}

async function main() {
  const svg192 = path.join(publicDir, 'icon-192x192.svg');
  const svg512 = path.join(publicDir, 'icon-512x512.svg');
  
  const png192 = path.join(publicDir, 'icon-192x192.png');
  const png512 = path.join(publicDir, 'icon-512x512.png');

  if (!fs.existsSync(svg192) || !fs.existsSync(svg512)) {
    console.error('❌ Los archivos SVG no existen. Ejecuta primero: node scripts/generate-icons.js');
    process.exit(1);
  }

  console.log('🔄 Generando iconos PNG...\n');
  
  await generatePNGFromSVG(svg192, png192, 192);
  await generatePNGFromSVG(svg512, png512, 512);
  
  console.log('\n✅ ¡Iconos PNG generados exitosamente!');
}

main().catch(console.error);

