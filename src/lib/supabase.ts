import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export const getSupabase = (cookies: AstroCookies) => {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key) {
          return cookies.get(key)?.value;
        },
        set(key, value, options) {
          cookies.set(key, value, { ...options, path: '/', secure: true, sameSite: 'lax' });
        },
        remove(key, options) {
          cookies.delete(key, { ...options, path: '/' });
        },
      },
    }
  );
};
