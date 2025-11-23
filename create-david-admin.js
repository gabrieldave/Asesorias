/**
 * Script para crear el admin david.del.rio.colin@gmail.com
 * Ejecuta: node create-david-admin.js
 */

async function createAdmin() {
  // Intenta con diferentes URLs posibles
  const possibleUrls = [
    'https://asesorias-todos-somos-traders.vercel.app/api/admin/create',
    'https://asesorias.todossomostraders.com/api/admin/create',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/admin/create` : null,
  ].filter(Boolean);
  
  let url = possibleUrls[0];
  
  const adminData = {
    email: 'david.del.rio.colin@gmail.com',
    password: 'Admin123!',
    name: 'David del Río'
  };

  console.log('🔧 Creando admin:', adminData.email);
  
  // Intentar con cada URL hasta que una funcione
  for (const testUrl of possibleUrls) {
    console.log('📡 Intentando con:', testUrl);
    
    try {
      const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('\n✅ Admin creado exitosamente!');
      console.log('📧 Email:', data.admin.email);
      console.log('👤 Nombre:', data.admin.name);
      console.log('🔑 Contraseña: Admin123!');
      console.log('\nAhora puedes iniciar sesión en:');
      console.log('https://asesorias-todos-somos-traders.vercel.app/login');
      console.log('\nCredenciales:');
      console.log('  Email: david.del.rio.colin@gmail.com');
      console.log('  Contraseña: Admin123!');
      return; // Éxito, salir
    } else {
      console.log('⚠️ Esta URL no funcionó, intentando siguiente...');
      if (testUrl !== possibleUrls[possibleUrls.length - 1]) {
        continue; // Intentar siguiente URL
      } else {
        console.error('❌ Error:', data.error || 'Error desconocido');
        console.error('Respuesta completa:', data);
      }
    }
    } catch (error) {
      console.log('⚠️ Error con esta URL:', error.message);
      if (testUrl === possibleUrls[possibleUrls.length - 1]) {
        console.error('❌ No se pudo crear el admin con ninguna URL');
      }
      continue; // Intentar siguiente URL
    }
  }
}

createAdmin();

