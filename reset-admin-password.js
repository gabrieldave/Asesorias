/**
 * Script para resetear la contraseña del admin
 * Uso: node reset-admin-password.js <email> <nueva-contraseña>
 */

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configurados en las variables de entorno');
  process.exit(1);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Uso: node reset-admin-password.js <email> <nueva-contraseña>');
  console.error('   Ejemplo: node reset-admin-password.js admin@example.com nuevaPassword123');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function resetPassword() {
  try {
    console.log(`\n🔄 Buscando admin con email: ${email}...`);
    
    // Buscar admin existente
    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError || !admin) {
      console.log('⚠️  Admin no encontrado. Creando nuevo admin...');
      
      // Crear nuevo admin
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          name: 'Admin',
          active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error al crear admin:', createError);
        process.exit(1);
      }

      console.log('✅ Admin creado exitosamente!');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   ID: ${newAdmin.id}`);
      return;
    }

    console.log('✅ Admin encontrado. Actualizando contraseña...');
    
    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data: updatedAdmin, error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error al actualizar contraseña:', updateError);
      process.exit(1);
    }

    console.log('✅ Contraseña actualizada exitosamente!');
    console.log(`   Email: ${updatedAdmin.email}`);
    console.log(`   ID: ${updatedAdmin.id}`);
    console.log(`\n📝 Ahora puedes iniciar sesión con la nueva contraseña.\n`);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

resetPassword();

