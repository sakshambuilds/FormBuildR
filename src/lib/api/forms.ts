import { supabase } from "@/lib/supabase/client";
import { FormSchema } from "@/lib/types/form";

export interface Form {
  id: string;
  user_id: string;
  name: string;
  schema: FormSchema;
  settings?: Record<string, any>;
  access_type: 'public' | 'password' | 'auth' | 'one_response';
  password_hash?: string;
  created_at: string;
  updated_at: string;
  is_published?: boolean;
  published_at?: string;
  description?: string;
  category?: string;
  thumbnail_url?: string;
}

export const createForm = async (
  name: string,
  schema: FormSchema,
  settings?: Record<string, any>,
  accessType: 'public' | 'password' | 'auth' | 'one_response' = 'public',
  passwordHash?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("forms")
      .insert({
        user_id: user.id,
        name,
        schema,
        settings: settings || {},
        access_type: accessType,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error creating form:", error);
    return { data: null, error: error.message };
  }
};

export const updateForm = async (
  formId: string,
  updates: {
    name?: string;
    schema?: FormSchema;
    settings?: Record<string, any>;
    access_type?: 'public' | 'password' | 'auth' | 'one_response';
    password_hash?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from("forms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating form:", error);
    return { data: null, error: error.message };
  }
};

export const deleteForm = async (formId: string) => {
  try {
    const { error } = await supabase
      .from("forms")
      .delete()
      .eq("id", formId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error deleting form:", error);
    return { error: error.message };
  }
};

export const getForm = async (formId: string) => {
  try {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error getting form:", error);
    return { data: null, error: error.message };
  }
};

export const getUserForms = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    return await fetchForms(user.id);
  } catch (error: any) {
    console.error("Error getting user forms:", error);
    return { data: null, error: error.message };
  }
};

export async function fetchForms(userId: string) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching forms:", error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

// Function to verify password via Edge Function (to avoid exposing hash)
export const verifyFormPassword = async (formId: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-password', {
      body: { formId, password }
    });

    if (error) {
      console.error("Error verifying password:", error);
      return false;
    }

    return data?.valid || false;
  } catch (e) {
    console.error("Exception verifying password:", e);
    return false;
  }
};
