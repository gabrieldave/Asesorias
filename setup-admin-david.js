/**
 * Script para crear/actualizar el admin david.del.rio.colin@gmail.com
 * Ejecutar: node setup-admin-david.js
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  try {
    const adminEmail = 'david.del.rio.colin@gmail.com';
    const adminPassword = process.argv[2] || 'admin123'; // Puedes pasar la contraseña como argumento
    const adminName = 'David del Río';

    console.log('🔧 Configurando admin:', adminEmail);

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Buscar si ya existe
    const { data: existingAdmin, error: findError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail.toLowerCase().trim())
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Error buscando admin:', findError);
      return;
    }

    if (existingAdmin) {
      // Actualizar admin existente
      console.log('📝 Admin ya existe, actualizando...');
      const { data: updatedAdmin, error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          name: adminName,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAdmin.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error actualizando admin:', updateError);
        return;
      }

      console.log('✅ Admin actualizado exitosamente');
      console.log('📧 Email:', updatedAdmin.email);
      console.log('👤 Nombre:', updatedAdmin.name);
      console.log('🔑 Contraseña:', adminPassword);
    } else {
      // Crear nuevo admin
      console.log('➕ Creando nuevo admin...');
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: adminEmail.toLowerCase().trim(),
          password_hash: passwordHash,
          name: adminName,
          active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creando admin:', createError);
        return;
      }

      console.log('✅ Admin creado exitosamente');
      console.log('📧 Email:', newAdmin.email);
      console.log('👤 Nombre:', newAdmin.name);
      console.log('🔑 Contraseña:', adminPassword);
    }

    console.log('\n✅ Configuración completada!');
    console.log('Ahora puedes iniciar sesión con:');
    console.log('  Email: david.del.rio.colin@gmail.com');
    console.log('  Contraseña: ' + adminPassword);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupAdmin();


