# Design: Dish and Category Management

## Technical Approach

El sistema se basará en **Astro Actions** (disponible nativamente en Astro >= 4.15) como puente seguro y tipado entre los formularios del cliente SSR y la base de datos de Supabase. Astro Actions ofrece protección automática de CSRF y simplifica el parsing de FormData sin requerir crear endpoints en `src/pages/api/` manualmente.
Dado que Supabase impone RLS, pasaremos la sesión ya validada en "locals" middleware a la capa de base de datos dentro de cada Action, mediante el SDK `@supabase/ssr` (lado servidor).

Para la **Carga de Imágenes**, la isla `ImageUploader.svelte` se vuelve un componente independiente que funciona asíncronamente. La usuaria elegirá la foto, la Isla la comprimirá (vía WebWorker de `browser-image-compression`), solicitará inicializar un _Browser Client_ de Supabase y subirá el Blob directamente al Storage. Al finalizar, la isla actualizará un `<input type="hidden" name="image_url" />` del formulario padre administrado por Astro, logrando que al darle click a "Guardar" se envíe todo el texto del plato junto con la pura URL optimizada. A nivel visualización, confiaremos en CSS `object-cover` en Tailwind para evitar recortar la imagen antes de subirla, simplificando radicalmente el flujo.

## Architecture Decisions

### Decision: Astro Actions para el Backend
**Choice**: Usar funciones definidas en `src/actions/index.ts` que se procesan vía SSR.
**Alternatives considered**: Crear endpoints REST manuales `POST /api/dishes` y usar `fetch` desde el cliente.
**Rationale**: Las Actions de Astro están integradas en el framework, brindando seguridad y enrutamiento natural. Si JavaScript falla en el cliente de la usuaria, los formularios puros (con `action="..."`) seguirán funcionando para el texto, brindando "Progressive Enhancement".

### Decision: Componente Padre Formulario SSR (Astro) y Componente Hijo Isla Upload (Svelte)
**Choice**: `<form>` tradicional en `.astro` que envuelve un componente híbrido `<ImageUploader client:load />`.
**Alternatives considered**: Hacer todo el formulario reactivo en Svelte o React.
**Rationale**: Mantener el formulario en Astro elimina JS muerto y cumple con la filosofía MPA (Multi-Page Application) favoreciendo la eficiencia de batería y carga inicial en móviles. La única porción interactiva rigurosa es el procesado de imágenes.

### Decision: Supabase Browser Client para Storage
**Choice**: Instanciar `@supabase/supabase-js` en Svelte leyendo `import.meta.env.PUBLIC_SUPABASE...` sin tokens expuestos que no sean Anónimos, valiéndose de la cookie `sb-[project_id]-auth-token` configurada por el SSR.
**Rationale**: Supabase soporta Storage Uploads directos desde el cliente respetando RLS si la cookie de autenticación SSR tiene la sesión seteada correctamente, eliminando el "round-trip" costoso servidor-frontend.

## Data Flow

### Flujo Completo de Creación de Plato
```
[1. User: Click "+ Plato"] → GET /platos/nuevo (Render SSR rápido)
                 │
[2. User: Sube Foto] → Svelte Isla: Comprime (browser-image-compression)
                 │
[3. Svelte] ───────(Subida Segura Bucket)────────→ Supabase Storage
                 │                                        │ (Devuelve publicUrl)
[4. Svelte] ←─────────────────────────────────────────────┘
                 │ (Inyecta valor en input hidden)
[5. User: Llena Form y Submit]
                 │
[6. form POST] ────(Astro Action: createDish)────→ Astro SSR Server
                                                         │
[7. Astro Action] ──(Aplica RLS auth.uid())──────→ Supabase PostgreSQL
                                                         │ (Inserta plato y URL)
[8. Astro Action] ←──────────────────────────────────────┘
                 │
[9. Redirect] ──→ GET /platos (Refleja plato insertado)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/00002_add_price_to_dishes.sql` | Create | Migración trivial: `ALTER TABLE dishes ADD COLUMN price NUMERIC DEFAULT 0;` (o Integer simulando centavos/moneda). |
| `src/lib/supabaseBrowser.ts` | Create | Exporta contenedor inicializador `createBrowserClient` envuelto en función para evitar problemas de SSR durante build. |
| `src/actions/index.ts` | Create | Orquesta las acciones `createCategory`, `deleteCategory`, `createDish`, `deleteDish`. |
| `src/pages/categorias/index.astro` | Create | Lista de categorías con vista simple y pequeño sumbit in-line de nueva categoría. |
| `src/pages/platos/index.astro` | Create | Interfaz Grilla 2x2 mostrando fotos y switch de "Fijo/Diario". |
| `src/pages/platos/nuevo.astro` | Create | Layout con Formulario integrando la isla Uploader y categorías base de BD. |
| `src/components/islands/ImageUploader.svelte` | Modify | Reemplaza placeholder con lógica real de Blob, compresión e instanciador de Supabase Storage. |

## Interfaces / Contracts

### Tablas Afectadas
```sql
ALTER TABLE public.dishes ADD COLUMN price NUMERIC(10,2) DEFAULT 0.00;
-- Políticas de RLS en 'dish-images' bucket:
-- INSERT permitida para auth.uid() == user_id_del_archivo
```

### Astro Actions (`src/actions/index.ts`)
```typescript
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  createCategory: defineAction({
    accept: 'form',
    input: z.object({ name: z.string().min(1) }),
    handler: async ({ name }, context) => { /* Supabase Insert */ }
  }),
  createDish: ...
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Form validation (Zod in Actions) | Invocar el handler de Astro Action exportado directamente con mock de Supabase. |
| Integration | Svelte Upload & Supabase RL | Manual/Cypress: Elegir un archivo grande en un entorno efímero y certificar redimensionamiento en Panel Storage local. |
| E2E | Crear, Ver y Eliminar Platos | Playwright: Correr `npm run dev` y hacer click path completo conectándose a un bucket dummy. |

## Migration / Rollout

La migración `00002_add_price_to_dishes.sql` debe ejecutarse previo al deploy final. Debe crearse y configurarse manualmente (o por script) el Bucket `dish-images` asignándole estatus público (Policy SELECT) en Supabase Studio y RLS de subida limitando acceso a logueados (Policy INSERT).

- [ ] Astro Actions está disponible nativamente en versiones recientes, asumo que estaremos trabajando con Astro v4.14+.
