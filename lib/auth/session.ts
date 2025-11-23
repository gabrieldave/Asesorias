import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface AdminSession {
  id: string;
  email: string;
  name?: string;
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

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    const adminEmail = cookieStore.get('admin_email')?.value;

    if (!sessionToken || !adminEmail) {
      return null;
    }

    // Decodificar el token de sesión
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      const [id, email] = decoded.split(':');

      if (email !== adminEmail) {
        return null;
      }

      return {
        id,
        email,
        name: adminEmail,
      };
    } catch (error) {
      console.error('Error decoding session token:', error);
      return null;
    }
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}

