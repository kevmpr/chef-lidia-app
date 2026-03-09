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

## Solución Propuesta

### A. Modificar `src/lib/supabase.ts`
Debemos asegurar que al hacer `set()` y `remove()` en el adapter de cookies de Astro, siempre se le pase `path: "/"`.

```typescript
set(key, value, options) {
  cookies.set(key, value, { ...options, path: "/" });
},
remove(key, options) {
  cookies.delete(key, { ...options, path: "/" });
},
```

### B. Modificar `src/pages/api/auth/signin.ts`
Debemos detectar si no estamos en `localhost` y forzar que el protocolo de la `redirectTo` URL sea `https:`.

```typescript
const callbackUrl = new URL("/api/auth/callback", request.url);
if (callbackUrl.hostname !== "localhost" && callbackUrl.hostname !== "127.0.0.1") {
    callbackUrl.protocol = "https:";
}
```

## Validación
- Hacer deploy a Vercel tras este commit.
- Intentar login con Google. El callback debería procesar el PKCE correctamente tras ser redirigido a HTTPS seguro y con las cookies disponibles en todo el dominio.
