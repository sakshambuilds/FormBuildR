import { supabase } from "@/lib/supabase/client";

export interface FormResponse {
    id: string;
    form_id: string;
    data: Record<string, any>;
    created_at: string;
}

export const submitResponse = async (formId: string, data: Record<string, any>) => {
    try {
        const { data: response, error } = await supabase
            .from("responses")
            .insert({
                form_id: formId,
                data: data,
            })
            .select()
            .single();

        if (error) throw error;

        // Trigger webhooks asynchronously (fire and forget)
        supabase.functions.invoke('trigger-webhooks', {
            body: {
                form_id: formId,
                response_id: response.id,
                data: data
            }
        }).catch(err => console.error("Failed to trigger webhooks:", err));

        return { data: response, error: null };
    } catch (error: any) {
        console.error("Error submitting response:", error);
        return { data: null, error: error.message };
    }
};

export const getFormResponses = async (formId: string) => {
    try {
        const { data, error } = await supabase
            .from("responses")
            .select("*")
            .eq("form_id", formId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error("Error fetching responses:", error);
        return { data: null, error: error.message };
    }
};
