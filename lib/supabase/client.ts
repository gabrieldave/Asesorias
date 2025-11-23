import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Exportar instancia para compatibilidad con código existente
export const supabase = createBrowserClient();

