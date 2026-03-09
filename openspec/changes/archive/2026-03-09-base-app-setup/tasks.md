# Tasks: Base App Setup

## Phase 1: Foundation (Astro & Supabase Schema)

- [x] 1.1 Iniciar el proyecto Astro (`npx create-astro@latest .` configurado para `empty`).
- [x] 1.2 Instalar e inicializar Tailwind CSS (`npx astro add tailwind`).
- [x] 1.3 Instalar e inicializar Svelte (`npx astro add svelte`).
- [x] 1.4 Instalar adaptador Vercel para SSR (`npx astro add vercel` o configurar output server en `astro.config.mjs`).
- [x] 1.5 Crear `supabase/migrations/00001_init_schema.sql` con las tablas `categories`, `dishes`, `menu_schedules` integrando RLS con `user_id`.

## Phase 2: Core Implementation (Supabase Auth & Middleware)

- [x] 2.1 Instalar el SDK de Supabase Auth SSR (`@supabase/ssr` y `@supabase/supabase-js`).
- [x] 2.2 Crear `src/lib/supabase.ts` para inicializar el cliente usando variables de entorno que provea Vercel (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`).
- [x] 2.3 Crear `src/middleware.ts` en Astro para validar la sesión de usuario de la cookie.
- [x] 2.4 Crear `src/pages/api/auth/[...auth].ts` con rutas para iniciar sesión con Google y manejar el callback.

## Phase 3: Integration (UI & Islands Skeleton)

- [x] 3.1 Crear `src/pages/login.astro` con un botón "Ingresar con Google" (protegido si el middleware lo asume, para desviar al Auth).
- [x] 3.2 Modificar `src/pages/index.astro` para leer el usuario actual y mostrar "Hola [Nombre]" validando que la sesión viva.
- [x] 3.3 Crear la estructura `src/components/islands/ImageUploader.svelte` como un esqueleto visual documentado, preparando base para la librería de compresión.

## Phase 4: Testing & Verification

- [x] 4.1 Test: Iniciar el servidor localmente (`npm run dev`) y verificar que Tailwind y la ruta de login renderizan.
- [x] 4.2 Test: Subir esquema SQL por Supabase CLI (`supabase db push` o ejecutarlo en la consola visual de proyecto real).
- [x] 4.3 Test: Iniciar sesión con Google desde local (validando el callback y generación de cookie).
- [x] 4.4 Test: Intentar acceder a `/` sin cookie para confirmar que el middleware hace el redirect a `/login`.
