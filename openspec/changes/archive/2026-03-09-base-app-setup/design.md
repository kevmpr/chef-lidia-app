# Design: Base App Setup

## Technical Approach

El proyecto se construirá sobre **Astro** priorizando el Server-Side Rendering (SSR) híbrido. Astro manejará el enrutamiento general, la estructura de layouts, la validación de sesión (middleware) y el pintado rápido de la UI.
Para la interactividad compleja (selección de platos desde bottom-sheets y carga rápida de fotos) introduciremos el concepto de "Islas" (`Islands Architecture`) utilizando **Svelte** por su bajo peso en bundle final y reactividad nativa eficiente.
Tailwind CSS se encargará del sistema de diseño general, operando globalmente en los componentes `.astro` y locales `.svelte`.
**Supabase** actuará como backend-as-a-service completo (PostgreSQL + Auth + Storage).

## Architecture Decisions

### Decision: Svelte para interactividad de cliente (Islas)

**Choice**: Svelte.
**Alternatives considered**: React (muy pesado), Preact (bueno, pero Svelte compila a vainilla más pequeño), Vanilla JS (difícil de escalar para UI compleja como drag&drop o calendarios reactivos).
**Rationale**: El requerimiento principal es "Mobile-first e Intuitivo". Necesitamos UI que se sienta nativa (toques, modales, previews dinámicos). Svelte en Astro (`@astrojs/svelte`) proporciona la mejor relación entre experiencia de desarrollo declarativa y tamaño final de JS enviado al dispositivo de la usuaria.

### Decision: Manejo de Estado de Autenticación
**Choice**: Cookies + Supabase Server Client en Middleware de Astro.
**Alternatives considered**: LocalStorage completo en el cliente.
**Rationale**: Para evitar "flashes" de contenido no autorizado, validaremos la sesión en el servidor (`middleware.ts` de Astro) interceptando las peticiones antes de renderizar páginas privadas (`/`, `/platos`, etc.). Esto permite redirecciones 302 ultrarrápidas y una carga inicial 100% segura.

### Decision: Estrategia de Compresión de Imágenes en Cliente
**Choice**: Librería `browser-image-compression` encapsulada en Svelte.
**Alternatives considered**: Compresión en backend.
**Rationale**: Subir un archivo de 5MB desde un 4G de celular es lento y consume el Storage de Supabase. Comprimir la imagen _antes_ de la subida garantiza una transferencia rápida por red rústica y ahorro de espacio, vital para un dispositivo móvil.

### Decision: Hosting y SSR Adapter
**Choice**: Despliegue en Vercel usando `@astrojs/vercel`.
**Rationale**: Vercel ofrece una integración SSR nativa y edge caching excelente para Astro, simplificando el CI/CD y la escalabilidad.

### Decision: Seguridad de Base de Datos
**Choice**: Row Level Security (RLS) activo desde el día 1, vinculando los registros de cada tabla a un `user_id` asociado a la cuenta del admin (Google Auth).
**Rationale**: Asegura que aunque las APIs estuvieran expuestas, solo el usuario autenticado y dueño pueda leer y escribir datos de menú y categorías.

## Data Flow

### Flujo de Autenticación SSR
    Cliente (Browser) ──[1. Inicia Auth Google]──→ Supabase Auth
         │                                            │
         └──[3. Redirecciona con Cookie]←─[2. Callback /auth/confirm]
         │                                            │
         └──[4. GET / (Dashboard)]─────────→ Astro Middleware (Valida Cookie en DB)
                                                      │
                                                      └──[5. Renderiza Dashboard SSR]

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `astro.config.mjs` | Modify | Ajustar `output: 'server'` e integrar adaptadores (`@astrojs/vercel`, `@astrojs/tailwind`, `@astrojs/svelte`). |
| `src/middleware.ts` | Create | Archivo interceptor para verificar la sesión de Supabase en cada ruta. |
| `src/lib/supabase.ts` | Create | Inicialización del cliente de Supabase SSR. |
| `src/pages/index.astro` | Modify | Dashboard base, protegido por el middleware. |
| `src/pages/login.astro` | Create | Pantalla de inicio de sesión con botón a `/api/auth/signin`. |
| `src/pages/api/auth/[...auth].ts` | Create | Endpoints de signin/signout/callback para manejar la cookie de Auth de Supabase. |
| `src/components/islands/ImageUploader.svelte` | Create | Skeleton/Placeholder del componente de carga de imagen para validar integración de Svelte. |
| `supabase/migrations/00001_init_schema.sql` | Create | Definición de tablas `categories`, `dishes`, `menu_schedules`. |

## Interfaces / Contracts

**Esquema de BD Principal (`supabase/migrations/00001_init_schema.sql`)**

```sql
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_fixed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own dishes" ON public.dishes FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.menu_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    dish_id UUID REFERENCES public.dishes(id) ON DELETE CASCADE,
    shift TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.menu_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own schedules" ON public.menu_schedules FOR ALL USING (auth.uid() = user_id);
```

**Esquema Auth SDK (`src/lib/supabase.ts`)**
```typescript
import { createServerClient } from '@supabase/ssr'

export function createSupabaseClient(cookies: any) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    { cookies }
  )
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Utilidades genéricas (ej formato fecha) | Vitest. |
| Integration | Middlewares de protección de rutas | Hacer mocks de Supabase cookies para simular requests a `/platos`. |
| E2E | Flujo de login completo y persistencia | Cypress o Playwright iniciando sesión real con credenciales de prueba. |

*(Nota: En esta iteración de "Base App Setup", la estrategia de testing quedará definida pero su implementación técnica será provista en una etapa posterior según las reglas SDD del framework).*

## Migration / Rollout

No migration required. El proyecto comienza desde cero. Se ejecutarán las migraciones SQL contra un proyecto limpio de Supabase en la nube con RLS activado.
