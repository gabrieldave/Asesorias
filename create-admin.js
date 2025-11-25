/**
 * Script para crear el usuario admin inicial
 * Ejecuta: node create-admin.js
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
  console.log('\n=== Crear Usuario Admin ===\n');
  
  const email = await question('Email del admin: ');
  const password = await question('Contraseña: ');
  const name = await question('Nombre (opcional): ') || null;
  
  const url = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/admin/create`
    : 'http://localhost:3000/api/admin/create';
  
  console.log('\nCreando admin...\n');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
        name: name,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Admin creado exitosamente!\n');
      console.log('Ahora puedes hacer login en:');
      console.log('https://asesorias.todossomostraders.com/login\n');
      console.log('Email:', data.admin.email);
    } else {
      console.error('❌ Error:', data.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('❌ Error al crear admin:', error.message);
  }
  
  rl.close();
}

main().catch(console.error);




