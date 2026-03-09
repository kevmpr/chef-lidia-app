import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
    const authCode = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    if (!authCode) {
        return new Response("No code provided", { status: 400 });
    }

    const supabase = getSupabase(cookies);

    const { error } = await supabase.auth.exchangeCodeForSession(authCode);

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return redirect(next);
};
