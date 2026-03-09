# Proposal: Base App Setup

## Intent

Establecer la base tecnológica para la aplicación "Chef Lidia y Familia". Esto proveerá la infraestructura necesaria para desarrollar el dashboard, la gestión de platos y el calendario, asegurando que el stack tecnológico (Astro + Tailwind + Supabase + Islas) esté listo para su uso.

## Scope

### In Scope
- Inicializar el proyecto Astro con Tailwind CSS integrado.
- Configurar el cliente de Supabase e implementar autenticación con Google.
- Definir el esquema SQL inicial para la base de datos (tablas `categories`, `dishes`, `menu_schedules`).
- Crear la estructura de directorios base para las Islas (Svelte/React) que manejarán la interactividad rica y fluida del cliente (ej. compresión de imágenes).
- Documentar cómo se implementará la compresión de imágenes en el frontend.

### Out of Scope
- Desarrollo completo de las vistas o la interfaz de usuario.
- Lógica de exportación de calendarios a Excel.
- Implementación de los endpoints de la API para administrar platos.

## Approach

1. **Setup Astro + Tailwind:** Utilizar CLI de Astro para inicializar un proyecto limpio y configurar la integración oficial de Tailwind.
2. **Setup Supabase:** Instalar SDK de Supabase, configurar variables de entorno y preparar helpers de auth (ej. login con Google).
3. **Esquema DB:** Crear un archivo SQL documentado que sirva como migración inicial (o script de setup) para las tablas requeridas.
4. **Arquitectura UI:** Crear una carpeta `src/components/islands/` dedicada a componentes interactivos y una utilidad para la compresión de imágenes antes de subirlas (usando una librería como `browser-image-compression`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | New | Dependencias base (astro, tailwind, supabase-js). |
| `src/` | New | Estructura base de la UI. |
| `supabase/migrations/` | New | Archivos SQL de migración inicial. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Incompatibilidad de paquetes en módulos SSR (Astro) vs Cliente (Islas) | Medium | Separar estrictamente componentes UI de lógica SSR y usar directivas de hidratación (`client:load`, `client:only=...`). |
| Fugas de secretos de Supabase en cliente | Med | Exponer solo clave pública en `PUBLIC_SUPABASE...` y usar Service Role o clave privada solo en SSR. |

## Rollback Plan

- Si la configuración del stack falla, se revertirán los commits iniciales y se empezará desde un entorno vacío comprobando la compatibilidad de versiones localmente. Al ser un proyecto nuevo, un rollback implica borrar la carpeta y volver a usar el CLI de Astro con versiones anteriores o probar configuraciones más simples.

## Dependencies

- Proyecto en la consola de Supabase debe estar creado para proveer URLs y Keys.
- Habilitar autenticación con Google en Supabase.
- Bucket "dish-images" debe configurarse como público en Supabase Storage.

## Success Criteria

- [ ] `npm run dev` levanta el proyecto base de Astro con visualización de Tailwind de prueba.
- [ ] Las tablas existen en la base de datos de Supabase.
- [ ] El login de Google está integrado y permite iniciar sesión en un componente básico.
- [ ] La estructura de directorios y la arquitectura de las Islas están en su lugar.
