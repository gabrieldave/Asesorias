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
    
    // Buscar admin en la tabla admins
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !admin) {
      console.error('Admin not found:', error);
      return null;
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
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
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingAdmin) {
      // Actualizar
      const { data: admin, error } = await supabase
        .from('admins')
        .update({
          password_hash: hashedPassword,
          name: name || existingAdmin.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAdmin.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating admin:', error);
        return null;
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      };
    } else {
      // Crear nuevo
      const { data: admin, error } = await supabase
        .from('admins')
        .insert({
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          name: name || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating admin:', error);
        return null;
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      };
    }
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    return null;
  }
}
