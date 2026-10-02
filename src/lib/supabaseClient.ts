// v2: shared Supabase project (Postgres + Storage + Auth) backing the recipe book,
// replacing the old localStorage-only persistence.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // implicit (not pkce) so a magic link opened on a different device than it
    // was requested on still works, which matters for a family audience.
    flowType: 'implicit',
  },
});
