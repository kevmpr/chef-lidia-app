import { defineMiddleware } from "astro:middleware";
import { getSupabase } from "./lib/supabase";

const protectedRoutes = ["/platos", "/calendario", "/exportar"];

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;

    // --- DEBUG LOGGING ---
    console.log("[Middleware] Route:", url.pathname);
    console.log("[Middleware] SUPABASE_URL prefix:", import.meta.env.PUBLIC_SUPABASE_URL?.substring(0, 5));

    // Log auth cookies presence
    const allCookies = cookies.headers() ? Array.from(cookies.headers()) : [];
    const authCookies = allCookies.filter(c => c[0].includes('sb-'));
    console.log("[Middleware] Auth Cookies Present:", authCookies.length > 0 ? "Yes" : "No");

    const supabase = getSupabase(cookies);

    // Validate the token actively against Supabase (getUser instead of getSession)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("[Middleware] getUser Error:", userError.message);
    }
    // --- END DEBUG LOGGING ---

    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

    // Helper for secure redirects
    const secureRedirect = (path: string) => {
        // Build absolute URL using the incoming request url as the base
        const redirectUrl = new URL(path, url.origin);
        if (redirectUrl.hostname !== "localhost" && redirectUrl.hostname !== "127.0.0.1") {
            redirectUrl.protocol = "https:";
        }
        console.log(`[Middleware] -> Redirecting to: ${redirectUrl.toString()}`);
        return redirect(redirectUrl.toString());
    };

    // If there's no user and the user tries to access a protected route
    if (isProtectedRoute && !user) {
        console.log("[Middleware] Redirecting to /login (Protected route, no user)");
        return secureRedirect("/login");
    }

    // If there's a user and the user is on the login page
    if (user && url.pathname === "/login") {
        console.log("[Middleware] Redirecting to / (User already logged in)");
        return secureRedirect("/");
    }

    // Protect the dashboard (/)
    if (url.pathname === "/" && !user) {
        console.log("[Middleware] Redirecting to /login (Dashboard protected, no user)");
        return secureRedirect("/login");
    }

    // Recover the session for Locals (getUser already validated it)
    const { data: { session } } = await supabase.auth.getSession();

    // Pass supabase to locals so it can be used in Astro components
    context.locals.supabase = supabase;
    context.locals.session = session;

    return next();
});
