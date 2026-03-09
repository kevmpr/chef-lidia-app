<script lang="ts">
  import { getSupabaseBrowser } from '../../lib/supabaseBrowser';
  
  export let folderPath: string = 'platos';
  
  let files: FileList | null = null;
  let previewUrl: string | null = null;
  let isCompressing = false;
  let uploadError: string | null = null;
  let finalImageUrl: string | null = null;

  async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    uploadError = null;
    
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      previewUrl = URL.createObjectURL(file);
      isCompressing = true;
      
      try {
        // 1. Comprimir en cliente (Dynamic import to avoid SSR errors)
        const imageCompression = (await import('browser-image-compression')).default;
        
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1080,
          useWebWorker: true
        });
        
        // 2. Subir a Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;
        
        const supabase = getSupabaseBrowser();
        const { data, error } = await supabase.storage
          .from('dish-images')
          .upload(filePath, compressedBlob, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) throw error;
        
        // 3. Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from('dish-images')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
        
      } catch (error: any) {
        console.error('Error in upload pipeline:', error);
        uploadError = error.message;
        previewUrl = null; // Revertir en caso de fallo
      } finally {
        isCompressing = false;
      }
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-olive-300 rounded-2xl bg-olive-50 transition-colors hover:bg-olive-100 cursor-pointer relative overflow-hidden h-48 justify-center">
    <input 
      type="file" 
      accept="image/png, image/jpeg, image/webp" 
      on:change={handleFileChange}
      disabled={isCompressing}
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-wait"
    />

    {#if previewUrl}
      <div class="absolute inset-0 w-full h-full">
        <!-- Object Cover tal como se diseñó -->
        <img src={previewUrl} alt="Preview" class="w-full h-full object-cover" />
        
        {#if !isCompressing}
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span class="text-white font-medium drop-shadow-md">Tocar para cambiar</span>
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex flex-col items-center text-olive-600 pointer-events-none">
        <svg class="w-10 h-10 mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span class="font-medium text-center">Tocar para agregar foto</span>
        <span class="text-xs opacity-70 mt-1 max-w-[80%] text-center">(Se optimiza automáticamente para celular)</span>
      </div>
    {/if}

    {#if isCompressing}
      <div class="absolute bottom-2 left-0 right-0 flex justify-center z-20">
        <span class="bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm">
          <svg class="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Subiendo...
        </span>
      </div>
    {/if}
  </div>

  {#if uploadError}
    <p class="text-xs text-red-500 font-medium px-1">{uploadError}</p>
  {/if}

  <!-- Output the URL for the Astro form -->
  {#if finalImageUrl}
    <input type="hidden" name="image_url" value={finalImageUrl} />
    <p class="text-xs text-olive-600 font-medium px-1 text-center">✓ Foto lista para usar</p>
  {/if}
</div>
