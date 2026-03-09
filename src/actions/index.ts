import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createServerClient } from '@supabase/ssr';

// Helper to init supabase inside an action using Locals
const initSupabase = (context: any) => {
    return createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return context.cookies.headers() ? [] : [];
                    // Astro Locals already has the session and supabase client, 
                    // but actions scope is slightly different. Let's grab it directly from locals:
                },
                setAll() { }
            }
        }
    );
};

export const server = {
    createCategory: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string().min(1, "El nombre no puede estar vacío")
        }),
        handler: async ({ name }, context) => {
            // In Astro 4.14+, context.locals is available in actions!
            const supabase = context.locals.supabase;
            const session = context.locals.session;

            if (!session) {
                throw new Error("No estás autenticado");
            }

            const { data, error } = await supabase
                .from('categories')
                .insert({
                    name,
                    user_id: session.user.id
                })
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data;
        }
    }),

    deleteCategory: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string()
        }),
        handler: async ({ id }, context) => {
            const supabase = context.locals.supabase;
            const session = context.locals.session;

            if (!session) {
                throw new Error("No estás autenticado");
            }

            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)
                .eq('user_id', session.user.id); // Double check RLS

            if (error) {
                throw new Error(error.message);
            }

            return { success: true };
        }
    }),

    // DISHES ACTIONS
    createDish: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string().min(1, "El nombre no puede estar vacío"),
            description: z.string().optional(),
            price: z.number({ coerce: true }).min(0).default(0),
            category_id: z.string().uuid().optional().nullable(),
            is_fixed: z.boolean({ coerce: true }).default(false),
            image_url: z.string().url("Falta la foto del plato").optional().nullable()
        }),
        handler: async (dishData, context) => {
            const supabase = context.locals.supabase;
            const session = context.locals.session;

            if (!session) {
                throw new Error("No estás autenticado");
            }

            // Convertir strings vacíos a null para UUIDs (formulario SSR quirk)
            const cleanData = {
                ...dishData,
                category_id: dishData.category_id || null,
                user_id: session.user.id
            };

            const { data, error } = await supabase
                .from('dishes')
                .insert(cleanData)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data;
        }
    }),

    deleteDish: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string()
        }),
        handler: async ({ id }, context) => {
            const supabase = context.locals.supabase;
            const session = context.locals.session;

            if (!session) {
                throw new Error("No estás autenticado");
            }

            const { error } = await supabase
                .from('dishes')
                .delete()
                .eq('id', id)
                .eq('user_id', session.user.id);

            if (error) {
                throw new Error(error.message);
            }

            return { success: true };
        }
    })
};
