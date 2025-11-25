/**
 * Script para obtener el Refresh Token de Google Calendar API
 * 
 * Instrucciones:
 * 1. Asegúrate de tener tus CLIENT_ID y CLIENT_SECRET de Google
 * 2. Ejecuta: node get-google-refresh-token.js
 * 3. Sigue las instrucciones en la terminal
 */

const readline = require('readline');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n=== Obtener Google Calendar Refresh Token ===\n');
  
  const CLIENT_ID = await question('Ingresa tu GOOGLE_CALENDAR_CLIENT_ID: ');
  const CLIENT_SECRET = await question('Ingresa tu GOOGLE_CALENDAR_CLIENT_SECRET: ');
  
  const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';
  const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' ');
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  console.log('\n=== PASOS A SEGUIR ===\n');
  console.log('1. Abre esta URL en tu navegador:');
  console.log(`\n${authUrl}\n`);
  console.log('2. Inicia sesión y otorga los permisos');
  console.log('3. Serás redirigido a localhost:3000');
  console.log('4. Copia el código de la URL (el parámetro "code=...")');
  console.log('\nEjemplo de URL después de la redirección:');
  console.log('http://localhost:3000/api/auth/google/callback?code=4/0Aean...\n');
  
  const authCode = await question('Pega aquí el código de autorización: ');
  
  // Intercambiar código por tokens
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code: authCode.trim(),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });
  
  console.log('\nObteniendo tokens...\n');
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error:', data.error);
      console.error('Descripción:', data.error_description);
      process.exit(1);
    }
    
    console.log('✅ ¡Tokens obtenidos exitosamente!\n');
    console.log('=== TUS CREDENCIALES ===\n');
    console.log('GOOGLE_CALENDAR_CLIENT_ID=' + CLIENT_ID);
    console.log('GOOGLE_CALENDAR_CLIENT_SECRET=' + CLIENT_SECRET);
    console.log('GOOGLE_CALENDAR_REFRESH_TOKEN=' + data.refresh_token);
    console.log('\n⚠️  IMPORTANTE: Guarda el REFRESH_TOKEN de forma segura.');
    console.log('Este token solo se muestra una vez.\n');
    
  } catch (error) {
    console.error('❌ Error al obtener tokens:', error.message);
    process.exit(1);
  }
  
  rl.close();
}

main().catch(console.error);




