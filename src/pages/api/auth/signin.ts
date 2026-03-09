import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
    const supabase = getSupabase(cookies);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: new URL("/api/auth/callback", request.url).toString(),
        },
    });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return redirect(data.url);
};
