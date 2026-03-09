# Deploy & CI/CD Exploration: Vercel + GitHub

## 1. Adaptador Vercel y Configuración Astro
✅ **Evaluación:** El proyecto ya se encuentra instrumentado correctamente desde la etapa base. 
- *Dependencia instalada:* `@astrojs/vercel`.
- *Configuración:* En `astro.config.mjs` ya establecimos `output: 'server'` y se inicializó `adapter: vercel()`. Esto garantiza que todas las _Astro Actions_ y el middleware funcionen de forma dinámica (SSR - Server Side Rendering).

## 2. Git Setup y Primer Commit (Ejecutado)
✅ **Evaluación:** He inicializado automáticamente el repositorio.
- Creado un `.gitignore` robusto que protege `.env`, `.env.*` y carpetas de build (`dist/`, `.vercel/`).
- Ejecutado el comando `git init`, agregado los achivos y realizado el commit: `feat: Initial MVP - Auth, Storage, Platos & Categorias CRUD`.

## 3. Production Readiness (Variables de Entorno)
✅ **Evaluación:** La app es _Production Ready_. 
Tanto `src/middleware.ts` como `src/lib/supabaseBrowser.ts` utilizan `import.meta.env.PUBLIC_SUPABASE_URL` e `import.meta.env.PUBLIC_SUPABASE_ANON_KEY`. En Astro, durante el _build_ de Vercel, estas variables se incrustarán correctamente si están definidas en el panel de Vercel gracias al prefijo `PUBLIC_`.

## 4. Instrucciones de Secretos (Para Vercel y Supabase)

### A. Dashboard de Vercel
Debes ir a Settings > Environment Variables y agregar exactamente estas 2 keys con los valores de tu Supabase:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

### B. Dashboard de Supabase (Authentication > URL Configuration)
En producción, tu app tendrá un dominio nuevo (ej. `https://chef-lidia.vercel.app`).
1. **Site URL**: Cambiá el site URL predeterminado de `localhost:4321` a `https://tu-dominio-vercel.vercel.app`.
2. **Redirect URIs**: Añadé estas URIs a la lista blanca para que Google Login no falle al hacer el callback:
   - `http://localhost:4321/api/auth/callback` (Para que te siga funcionando en local).
   - `https://tu-dominio-vercel.vercel.app/api/auth/callback` (El vital para Vercel).

### C. Google Cloud Console (OAuth Credentials)
Debes actualizar también la consola de Google:
- Authorized JavaScript origins: `https://tu-dominio-vercel.vercel.app`
- Authorized redirect URIs: `https://tu-dominio-vercel.vercel.app/api/auth/callback`

## 5. GitHub CLI (Comandos para Subir)

Asumiendo que tenés GitHub CLI (`gh`) instalado y logueado, solo debés correr estos tres comandos en tu terminal para enviar este código a la nube y empezar el deploy:

```bash
# 1. Crear el repositorio remoto en tu GitHub de forma pública (o privada cambiando --public por --private)
gh repo create chef-lidia-app --public --source=. --remote=origin

# 2. Renombrar rama (si estabas en master por defecto al hacer el init anterior)
git branch -M main

# 3. Subir el código
git push -u origin main
```

Una vez subido a GitHub, simplemente entras a Vercel, tocas "Add New Project", seleccionas este repo, cargas las dos variables del _Paso 4.A_ y ¡Le das Deploy!
