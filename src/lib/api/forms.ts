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
      const errorMsg = "User not authenticated";
      console.error("❌ Form creation failed:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("📝 Creating form:", { name, user_id: user.id, accessType });

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

    if (error) {
      console.error("❌ Supabase error creating form:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("✅ Form created successfully:", data.id);
    return { data, error: null };
  } catch (error: any) {
    console.error("❌ Error creating form:", error);

    // Return detailed error in development, generic in production
    const isDev = import.meta.env.DEV;
    const errorMessage = isDev
      ? `Failed to save: ${error.message}`
      : "Failed to save";

    return { data: null, error: errorMessage };
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
    console.log("📝 Updating form:", formId);

    const { data, error } = await supabase
      .from("forms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error updating form:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log("✅ Form updated successfully");
    return { data, error: null };
  } catch (error: any) {
    console.error("❌ Error updating form:", error);

    const isDev = import.meta.env.DEV;
    const errorMessage = isDev
      ? `Failed to update: ${error.message}`
      : "Failed to update";

    return { data: null, error: errorMessage };
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
