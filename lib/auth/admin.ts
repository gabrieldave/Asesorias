import { getUser } from './session';
import { createServiceRoleClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export interface Admin {
  id: string;
  email: string;
  name?: string;
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

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<Admin | null> {
  try {
    const supabase = createServiceRoleClient();
    
    // Intentar obtener admin de la tabla admins si existe
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      // Fallback: usar variables de entorno
      const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        return null;
      }

      if (email === adminEmail && password === adminPassword) {
        return {
          id: 'env-admin',
          email: adminEmail,
          name: 'Admin',
        };
      }

      return null;
    }

    // Verificar contraseña con bcrypt
    if (admin.password_hash) {
      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (!isValid) {
        return null;
      }
    } else if (admin.password && admin.password !== password) {
      return null;
    }

    return {
      id: admin.id.toString(),
      email: admin.email,
      name: admin.name || admin.email,
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

export async function createOrUpdateAdmin(
  email: string,
  password: string,
  name?: string
): Promise<Admin | null> {
  try {
    const supabase = createServiceRoleClient();
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Intentar actualizar si existe
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      // Actualizar admin existente
      const { data: updatedAdmin, error } = await supabase
        .from('admins')
        .update({
          password_hash: passwordHash,
          name: name || existingAdmin.name,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        console.error('Error updating admin:', error);
        return null;
      }

      return {
        id: updatedAdmin.id.toString(),
        email: updatedAdmin.email,
        name: updatedAdmin.name || updatedAdmin.email,
      };
    } else {
      // Crear nuevo admin
      const { data: newAdmin, error } = await supabase
        .from('admins')
        .insert({
          email,
          password_hash: passwordHash,
          name: name || email,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating admin:', error);
        return null;
      }

      return {
        id: newAdmin.id.toString(),
        email: newAdmin.email,
        name: newAdmin.name || newAdmin.email,
      };
    }
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    return null;
  }
}

