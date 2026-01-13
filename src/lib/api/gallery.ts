import { supabase } from "@/lib/supabase/client";
import { FormSchema } from "@/lib/types/form";

export interface PublicForm {
    id: string;
    user_id: string;
    name: string; // Changed from title to name to match forms table
    description?: string;
    category?: string;
    schema: FormSchema; // Changed from form_schema to schema
    created_at: string;
    updated_at: string;
    published_at?: string;
}

export interface PublishFormOptions {
    formId: string;
    title: string;
    description?: string;
    category?: string;
}

export interface GalleryFilters {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export async function publishToGallery(options: PublishFormOptions) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("forms")
            .update({
                is_published: true,
                published_at: new Date().toISOString(),
                name: options.title, // Update name/title if changed
                description: options.description,
                category: options.category || 'Other',
            })
            .eq("id", options.formId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error("Error publishing to gallery:", error);
        return { data: null, error: error.message };
    }
}

export async function getGalleryForms(filters?: GalleryFilters) {
    try {
        let query = supabase
            .from("forms")
            .select("*")
            .eq("is_published", true)
            .order("published_at", { ascending: false });

        if (filters?.category && filters.category !== "All Categories") {
            query = query.eq("category", filters.category);
        }

        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { data: data as PublicForm[], error: null };
    } catch (error: any) {
        console.error("Error fetching gallery forms:", error);
        return { data: null, error: error.message };
    }
}

export async function getGalleryForm(id: string) {
    try {
        const { data, error } = await supabase
            .from("forms")
            .select("*")
            .eq("id", id)
            .eq("is_published", true)
            .single();

        if (error) throw error;
        return { data: data as PublicForm, error: null };
    } catch (error: any) {
        console.error("Error fetching gallery form:", error);
        return { data: null, error: error.message };
    }
}

export async function unpublishForm(formId: string) {
    try {
        const { error } = await supabase
            .from("forms")
            .update({
                is_published: false,
                published_at: null
            })
            .eq("id", formId);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error("Error unpublishing form:", error);
        return { error: error.message };
    }
}

export async function checkIfPublished(formId: string) {
    try {
        const { data, error } = await supabase
            .from("forms")
            .select("is_published")
            .eq("id", formId)
            .single();

        if (error) throw error;
        return { data: data?.is_published || false, error: null };
    } catch (error: any) {
        console.error("Error checking publish status:", error);
        return { data: false, error: error.message };
    }
}
