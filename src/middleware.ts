import { defineMiddleware } from "astro:middleware";
import { getSupabase } from "./lib/supabase";

const protectedRoutes = ["/platos", "/calendario", "/exportar"];

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;

    const supabase = getSupabase(cookies);

    // Refresh the session if necessary
    const { data: { session } } = await supabase.auth.getSession();

    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

    // If there's no session and the user tries to access a protected route
    if (isProtectedRoute && !session) {
        return redirect("/login");
    }

    // If there's a session and the user is on the login page
    if (session && url.pathname === "/login") {
        return redirect("/");
    }

    // Protect the dashboard (/) but maybe the intent is to have it protected too
    if (url.pathname === "/" && !session) {
        return redirect("/login");
    }

    // Pass supabase to locals so it can be used in Astro components
    context.locals.supabase = supabase;
    context.locals.session = session;

    return next();
});
