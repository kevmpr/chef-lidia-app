# Tasks: Dish and Category Management

## Phase 1: Infrastructure (Database & Connectivity)

- [ ] 1.1 Crear migración `00002_add_price_to_dishes.sql` anadiendo `price NUMERIC(10,2) DEFAULT 0.00`.
- [ ] 1.2 Configurar `src/lib/supabaseBrowser.ts` para proveer un cliente instanciado de `@supabase/supabase-js`.

## Phase 2: Category Management (Actions & UI)

- [ ] 2.1 Definir el tipo/esquema de Categoría (`public.categories`) en un archivo types o utilitario (opcional).
- [ ] 2.2 Crear `src/actions/index.ts` configurando Astro Actions e implementar `createCategory` y `deleteCategory`.
- [ ] 2.3 Crear `src/pages/categorias/index.astro` listando las categorías asociadas al usuario logueado mediante SSR.
- [ ] 2.4 Integrar formulario `<form action={actions.createCategory}>` dentro de `categorias/index.astro`.

## Phase 3: Svelte Interactive Image Uploader

- [ ] 3.1 Integrar `browser-image-compression` dentro de `src/components/islands/ImageUploader.svelte`.
- [ ] 3.2 Programar subida directa al bucket `dish-images` usando `supabaseBrowser.ts` al finalizar la compresión.
- [ ] 3.3 Emitir el valor de la URL final o inyectarlo en `<input type="hidden" name="image_url" value={...} />`.

## Phase 4: Dish Management (Actions & UI)

- [ ] 4.1 Extender `src/actions/index.ts` con `createDish` (recibe name, description, price, category_id, is_fixed, image_url) y `deleteDish`.
- [ ] 4.2 Crear `src/pages/platos/index.astro` para listar todos los platos (con imagen por `object-cover` de Tailwind css) y filtro visual Carta vs Día.
- [ ] 4.3 Crear `src/pages/platos/nuevo.astro` conteniendo el formulario padre SSR y la isla `<ImageUploader client:load />`.

## Phase 5: Testing & UI Wiring

- [ ] 5.1 Enlazar la navegación global (index `🏠`, platos `🥘`, calendario `📅`) al nuevo routing.
- [ ] 5.2 Test: Subir tabla SQL a Supabase Local/Remoto.
- [ ] 5.3 Test: Cargar imagen (revisar dev tools para confirmar compresión) y guardar Plato.
- [ ] 5.4 Test: Borrar Categoría / Plato para validar constraints.
