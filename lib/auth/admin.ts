import { getUser } from './session';
import { createServiceRoleClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
}

export async function requireAdmin() {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL not configured');
  }

  if (user.email !== adminEmail) {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

// Verificar credenciales de admin (email y password)
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  try {
    const supabase = createServiceRoleClient();
    
    // Buscar admin en la tabla admin_users
    const emailNormalized = email.toLowerCase().trim();
    console.log('🔍 Buscando admin con email:', emailNormalized);
    
    const { data: admin, error } = await (supabase.from('admin_users') as any)
      .select('*')
      .eq('email', emailNormalized)
      .single();

    if (error || !admin) {
      console.error('❌ Admin not found:', error);
      return null;
    }

    console.log('✅ Admin encontrado:', admin.email, 'ID:', admin.id);

    // Verificar contraseña
    const adminData = admin as any;
    console.log('🔐 Verificando contraseña...');
    const isValid = await bcrypt.compare(password, adminData.password_hash);
    
    console.log('🔐 Resultado de verificación:', isValid);
    
    if (!isValid) {
      console.error('❌ Contraseña inválida');
      return null;
    }

    console.log('✅ Credenciales válidas');

    return {
      id: adminData.id,
      email: adminData.email,
      name: adminData.name,
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

// Crear o actualizar admin
export async function createOrUpdateAdmin(
  email: string,
  password: string,
  name?: string
): Promise<AdminUser | null> {
  try {
    const supabase = createServiceRoleClient();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar si ya existe
    const { data: existingAdmin } = await (supabase.from('admin_users') as any)
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingAdmin) {
      const existingAdminData = existingAdmin as any;
      // Actualizar
      const { data: admin, error } = await (supabase.from('admin_users') as any)
        .update({
          password_hash: hashedPassword,
          name: name || existingAdminData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAdminData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating admin:', error);
        return null;
      }

      const adminData = admin as any;
      return {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
      };
    } else {
      // Crear nuevo
      const { data: admin, error } = await (supabase.from('admin_users') as any)
        .insert({
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          name: name || null,
          active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating admin:', error);
        return null;
      }

      const adminData = admin as any;
      return {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
      };
    }
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    return null;
  }
}
