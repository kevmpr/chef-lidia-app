# Fix: OAuth Callback 400 en Producción

## Problema
Al realizar OAuth con Google en Vercel, el callback hacia `/api/auth/callback` falla con estado 400.

## Diagnóstico y Causa Raíz

### 1. Falta de `path: "/"` en Cookies de Supabase SSR (PKCE Fails)
El paquete `@supabase/ssr` implementa **PKCE (Proof Key for Code Exchange)** por defecto. Cuando llamas a `signInWithOAuth`, Supabase establece una cookie con el `code_verifier`. 

Dado que el inicio de sesión ocurre en `/api/auth/signin`, si no se especifica el `path: "/"`, el navegador restringe la cookie a la ruta `/api/auth/`. Luego, cuando llega el redireccionamiento de Google a `/api/auth/callback`, el navegador a veces no envía la cookie correctamente (o Supabase la sobrescribe), resultando en que `exchangeCodeForSession` falle quejándose de que no hay code verifier.

### 2. Protocol Mismatch por Vercel Reverse Proxy
Al correr en Vercel, el protocolo de la request que llega a Astro puede reportarse como `http://` debido a cómo funciona la terminación SSL en el edge/proxy. 
Al usar `new URL("/api/auth/callback", request.url).toString()`, se podría generar un `http://midominio.vercel.app/api/auth/callback`. Auth de Google y Supabase exigen HTTPS estricto para las redirect URIs, lo cual causa desajustes y rechazos (Google dirá URI Mismatch).

## Solución Propuesta (Deep Debugging)

### A. Modificar `src/lib/supabase.ts` (Cookie Hardening & Persistence)
Además del `secure` y `sameSite: 'lax'`, explícitamente le indicamos al cliente de SSR que confíe exclusivamente en las cookies para hidratar la sesión:
```typescript
auth: { persistSession: true, detectSessionInUrl: false }
```

### B. Modificar `src/middleware.ts` (SSR Validation & Logging)
Reemplazar `supabase.auth.getSession()` por `supabase.auth.getUser()`. 
Agregamos profuso `console.log` para escupir en Vercel:
- Si existen cookies `sb-*`.
- Errores de `getUser`.
- Los primeros 5 caracteres de `PUBLIC_SUPABASE_URL` para chequear el env setup.
- Redirección forzada segura (`https:`) para evitar saltar a HTTP en Vercel limitando la visibilidad de la cookie `secure`.

### C. Modificar `src/pages/api/auth/signin.ts` y `callback.ts` (Protocol & Trace)
- Ambos fuerzan `https:` si el origin no es `localhost`.
- Se atrapa con `try/catch` el momento exacto donde `exchangeCodeForSession` corre en el Callback, guardando evidencia de éxito o error en los logs.

## Validación
- Hacer deploy a Vercel tras este commit.
- Intentar login con Google y luego revisar los Edge Logs de Vercel. Allí confirmaremos si la cookie sobrevive el viaje hacia el middleware.
