import { getUser } from './session';

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

