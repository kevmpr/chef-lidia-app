import type { APIRoute } from "astro";
import { getSupabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ cookies, redirect }) => {
    const supabase = getSupabase(cookies);

    const { error } = await supabase.auth.signOut();

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return redirect("/login");
};
