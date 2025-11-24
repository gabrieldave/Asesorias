/**
 * Script simple para obtener el refresh token de Google Calendar
 * 
 * INSTRUCCIONES:
 * 1. Ve a: https://developers.google.com/oauthplayground/
 * 2. Sigue los pasos en obtener-refresh-token.md
 * 3. O usa este script si prefieres hacerlo programáticamente
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n=== Obtener Refresh Token de Google Calendar ===\n');
  console.log('OPCIÓN 1: Usar OAuth Playground (MÁS FÁCIL)');
  console.log('1. Ve a: https://developers.google.com/oauthplayground/');
  console.log('2. Configura tus credenciales (⚙️)');
  console.log('3. Selecciona: Calendar API v3 → https://www.googleapis.com/auth/calendar');
  console.log('4. Autoriza con todossomostr4ders@gmail.com');
  console.log('5. Copia el refresh token\n');
  
  console.log('OPCIÓN 2: Usar este script (requiere más configuración)\n');
  
  const useScript = await question('¿Quieres usar el script? (s/n): ');
  
  if (useScript.toLowerCase() !== 's') {
    console.log('\n✅ Perfecto, usa OAuth Playground siguiendo obtener-refresh-token.md');
    rl.close();
    return;
  }

  console.log('\n⚠️  Para usar el script necesitas:');
  console.log('1. Client ID de Google Cloud Console');
  console.log('2. Client Secret de Google Cloud Console');
  console.log('3. Configurar redirect URI en Google Cloud Console\n');
  
  const clientId = await question('Client ID: ');
  const clientSecret = await question('Client Secret: ');
  
  console.log('\n📋 Sigue estos pasos:');
  console.log('1. Abre este URL en tu navegador:');
  console.log(`   https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=https://developers.google.com/oauthplayground&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent`);
  console.log('\n2. Inicia sesión con todossomostr4ders@gmail.com');
  console.log('3. Acepta los permisos');
  console.log('4. Copia el código de la URL (después de ?code=)');
  
  const authCode = await question('\nPega el código de autorización: ');
  
  console.log('\n🔄 Intercambiando código por tokens...\n');
  
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: 'https://developers.google.com/oauthplayground',
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.refresh_token) {
      console.log('✅ ¡Refresh token obtenido exitosamente!\n');
      console.log('📋 Refresh Token:');
      console.log(data.refresh_token);
      console.log('\n💡 Copia este token y configúralo en Vercel como:');
      console.log('   GOOGLE_CALENDAR_REFRESH_TOKEN');
    } else {
      console.error('❌ Error:', data.error || 'Error desconocido');
      console.error('Detalles:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  rl.close();
}

main().catch(console.error);


