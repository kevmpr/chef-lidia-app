import { defineMiddleware } from "astro:middleware";
import { getSupabase } from "./lib/supabase";

const protectedRoutes = ["/platos", "/calendario", "/exportar"];

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;

    const supabase = getSupabase(cookies);

    // Validate the token actively against Supabase (getUser instead of getSession)
    const { data: { user } } = await supabase.auth.getUser();

    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

    // If there's no user and the user tries to access a protected route
    if (isProtectedRoute && !user) {
        return redirect("/login");
    }

    // If there's a user and the user is on the login page
    if (user && url.pathname === "/login") {
        return redirect("/");
    }

    // Protect the dashboard (/)
    if (url.pathname === "/" && !user) {
        return redirect("/login");
    }

    // Recover the session for Locals (getUser already validated it)
    const { data: { session } } = await supabase.auth.getSession();

    // Pass supabase to locals so it can be used in Astro components
    context.locals.supabase = supabase;
    context.locals.session = session;

    return next();
});
