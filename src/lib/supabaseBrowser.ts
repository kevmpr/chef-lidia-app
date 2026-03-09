import { createBrowserClient } from '@supabase/ssr';

export const getSupabaseBrowser = () => {
    return createBrowserClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    );
};
