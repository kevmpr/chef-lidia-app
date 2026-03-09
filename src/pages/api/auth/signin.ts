import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
    const supabase = getSupabase(cookies);

    const callbackUrl = new URL("/api/auth/callback", request.url);

    // Vercel proxy might forward http, Google requires https.
    if (callbackUrl.hostname !== "localhost" && callbackUrl.hostname !== "127.0.0.1") {
        callbackUrl.protocol = "https:";
    }

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
