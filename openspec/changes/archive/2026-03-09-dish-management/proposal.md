# Proposal: Dish and Category Management

## Intent

Proveer a la administradora (Lidia) las herramientas necesarias para gestionar su menú. Esto requiere la creación de un CRUD completo para Platos y Categorías, además de garantizar que la experiencia de carga de fotos sea rápida desde dispositivos móviles mediante compresión en el cliente, optimizando el uso de Supabase Storage.

## Scope

### In Scope
- Creación de migración SQL para añadir el campo `price` a la tabla `dishes` y asegurar el RLS en `dish-images` bucket.
- Implementación de interfaz de usuario para listar, crear, editar y eliminar Categorías.
- Implementación de interfaz de usuario para listar, crear, editar y eliminar Platos.
- Integración de **Astro Actions** para el manejo seguro (SSR) de los formularios (Alta/Edición).
- Desarrollo de la lógica de **compresión de imágenes en el cliente** dentro de la isla `ImageUploader.svelte` usando `browser-image-compression`.
- Carga directa de imágenes desde el cliente (Svelte) hacia Supabase Storage usando el cliente nativo del navegador para evitar embudos de red en el servidor Node.js.

### Out of Scope
- Interfaz del Planificador Semanal (Calendario de asignación de menú).
- Generación de archivo Excel para impresión.

## Approach

Siguiendo la exploración inicial, adoptaremos un enfoque híbrido de alta eficiencia:
1. **Datos Relacionales:** Todo el CRUD de texto (nombres, precios, IDs) se procesará de forma segura en el backend mediante [Astro Actions](https://docs.astro.build/en/guides/actions/), garantizando que no haya APIs expuestas innecesariamente y aprovechando la sesión SSR ya validada por el middleware.
2. **Archivos Pesados (Fotos):** La carga de imágenes ocurrirá 100% en el cliente. La isla de Svelte comprimirá la foto localmente, la subirá a Supabase Storage usando la sesión activa (vía un nuevo cliente instanciado para el navegador), y devolverá la URL pública. Esta URL se enviará silenciosamente junto con el formulario de Astro Action.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/00002_add_price_to_dishes.sql` | New | Añade el precio a los platos. |
| `src/lib/supabaseBrowser.ts` | New | Emite un cliente de Supabase para poder interactuar con Storage directamente desde Svelte. |
| `src/actions/index.ts` | New | Define las Astro Actions para `createDish`, `deleteDish`, `createCategory`, etc. |
| `src/pages/categorias/` | New | Vistas SSR para gestión de categorías. |
| `src/pages/platos/` | New | Vistas SSR para gestión de platos. |
| `src/components/islands/ImageUploader.svelte` | Modify | Implementa compresión asíncrona y upload a Storage. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistencia de estado (Ej. usuario sube foto pero no guarda el plato) | High | Implementar validación cruzada. Si la foto se sube pero el Action de Astro falla o se cancela, la foto quedará "huérfana" en Storage. Como mitigación inicial, los nombres de archivo incluirán el ID temporal o fecha; en el futuro se puede implementar un cronjob de limpieza. |
| Falla al instanciar Supabase en el navegador por falta de PKCE / Auth Cookie | Medium | Asegurar que el servidor (Astro middleware) configure correctamente la cookie haciéndola accesible al inicializar el `createBrowserClient` de `@supabase/ssr`. |

## Rollback Plan

- Los cambios a nivel de interfaz e islas son aditivos y pueden revertirse vía git.
- La migración SQL que añade el campo `price` puede revertirse con un `ALTER TABLE dishes DROP COLUMN price;`.
- Los archivos huérfanos en Storage generados durante pruebas fallidas deberán borrarse manualmente desde el panel de Supabase.

## Dependencies

- El paquete npm `browser-image-compression` (ya instalado).
- Políticas de Storage correctas en Supabase para el bucket `dish-images` (RLS configurado limitando `INSERT` a usuarios logueados).

## Success Criteria

- [ ] Un usuario administrador puede crear una categoría.
- [ ] Un usuario administrador puede crear un plato asignándole una categoría e indicando un precio.
- [ ] Al seleccionar una imagen de >3MB, la isla de Svelte la reduce a <500KB visiblemente antes de subirla.
- [ ] La imagen es alojada correctamente en Supabase Storage y su URL se guarda en el registro de la DB.
- [ ] Las Astro Actions impiden operaciones si el usuario no cuenta con una sesión válida.
