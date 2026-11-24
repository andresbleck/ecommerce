import { createClient } from '@supabase/supabase-js';

export const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  // PKCE: los links de email vuelven con ?code= (query), compatible con el router por hash.
  { auth: { flowType: 'pkce' } },
);
