import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
    const authCode = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    if (!authCode) {
        return new Response("No code provided", { status: 400 });
    }

    const supabase = getSupabase(cookies);

    try {
        console.log("[Callback] Exchanging code for session...");
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (error) {
            console.error("[Callback] exchangeCodeForSession Error:", error.message);
            return new Response(error.message, { status: 500 });
        }

        console.log("[Callback] Exchange successful. Redirecting...");

        // Secure redirect
        const redirectUrl = new URL(next, url);
        if (redirectUrl.hostname !== "localhost" && redirectUrl.hostname !== "127.0.0.1") {
            redirectUrl.protocol = "https:";
        }

        return redirect(redirectUrl.toString());

    } catch (err: any) {
        console.error("[Callback] Unexpected Error:", err.message);
        return new Response("Internal Server Error", { status: 500 });
    }
};
