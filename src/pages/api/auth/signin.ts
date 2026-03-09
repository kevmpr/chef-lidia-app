import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";
import { getRealOrigin } from "../../../lib/utils";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
    const supabase = getSupabase(cookies);

    const realOrigin = getRealOrigin(request);
    const callbackUrl = new URL("/api/auth/callback", realOrigin);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: callbackUrl.toString(),
        },
    });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return redirect(data.url);
};
