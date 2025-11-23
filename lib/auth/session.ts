import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/server';

export interface AdminSession {
  id: number;
  email: string;
  name: string | null;
}

export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

// Verificar sesión de admin basada en cookies
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    const adminEmail = cookieStore.get('admin_email')?.value;

    if (!sessionToken || !adminEmail) {
      return null;
    }

    // Verificar que el admin existe
    const supabase = createServiceRoleClient();
    const { data: admin, error } = await (supabase.from('admin_users') as any)
      .select('id, email, name')
      .eq('email', adminEmail)
      .single();

    if (error || !admin) {
      return null;
    }

    const adminData = admin as any;
    return {
      id: adminData.id,
      email: adminData.email,
      name: adminData.name,
    };
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}
