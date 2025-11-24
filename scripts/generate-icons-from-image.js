/**
 * Script para generar iconos PWA y favicon desde imagen original
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
const originalImage = path.join(publicDir, 'asesorias-original.jpg');

async function generateIcon(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(outputPath);
    console.log(`✅ Generado: ${path.basename(outputPath)} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`❌ Error generando ${outputPath}:`, error.message);
    return false;
  }
}

async function generateFavicon(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(outputPath);
    console.log(`✅ Generado: ${path.basename(outputPath)} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`❌ Error generando ${outputPath}:`, error.message);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(originalImage)) {
    console.error('❌ La imagen original no existe:', originalImage);
    console.log('📥 Descargando imagen...');
    // Intentar descargar
    const https = require('https');
    const fs = require('fs');
    const file = fs.createWriteStream(originalImage);
    https.get('https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/imagenes_curso/asesorias.jpg', (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ Imagen descargada');
        generateIcons();
      });
    });
    return;
  }

  await generateIcons();
}

async function generateIcons() {
  console.log('🔄 Generando iconos PWA y favicon desde imagen original...\n');
  
  // Iconos PWA
  await generateIcon(originalImage, path.join(publicDir, 'icon-192x192.png'), 192);
  await generateIcon(originalImage, path.join(publicDir, 'icon-512x512.png'), 512);
  
  // Favicon (múltiples tamaños)
  await generateFavicon(originalImage, path.join(publicDir, 'favicon-16x16.png'), 16);
  await generateFavicon(originalImage, path.join(publicDir, 'favicon-32x32.png'), 32);
  await generateFavicon(originalImage, path.join(publicDir, 'favicon-96x96.png'), 96);
  await generateFavicon(originalImage, path.join(publicDir, 'favicon.ico'), 32); // ICO básico
  
  console.log('\n✅ ¡Todos los iconos generados exitosamente!');
  console.log('📝 Archivos generados:');
  console.log('   - icon-192x192.png (PWA)');
  console.log('   - icon-512x512.png (PWA)');
  console.log('   - favicon-16x16.png');
  console.log('   - favicon-32x32.png');
  console.log('   - favicon-96x96.png');
  console.log('   - favicon.ico');
}

main().catch(console.error);


