import { supabase } from "@/lib/supabase/client";

export interface Webhook {
  id: string;
  form_id: string;
  url: string;
  secret: string;
  enabled: boolean;
  headers: Record<string, string>;
  payload_format: 'json' | 'form-data';
  retries_enabled: boolean;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  form_id: string;
  submission_id: string;
  status: 'success' | 'failed';
  response_code: number;
  response_body: string;
  attempt_count: number;
  created_at: string;
}

export const getWebhooks = async (formId: string) => {
  try {
    const { data, error } = await supabase
      .from("form_webhooks")
      .select("*")
      .eq("form_id", formId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching webhooks:", error);
    return { data: null, error: error.message };
  }
};

export const createWebhook = async (
  formId: string,
  url: string,
  secret: string,
  options: {
    headers?: Record<string, string>;
    payload_format?: 'json' | 'form-data';
    retries_enabled?: boolean;
  } = {}
) => {
  try {
    const { data, error } = await supabase
      .from("form_webhooks")
      .insert({
        form_id: formId,
        url,
        secret,
        headers: options.headers || {},
        payload_format: options.payload_format || 'json',
        retries_enabled: options.retries_enabled ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error creating webhook:", error);
    return { data: null, error: error.message };
  }
};

export const updateWebhook = async (
  webhookId: string,
  updates: Partial<Omit<Webhook, 'id' | 'form_id' | 'created_at'>>
) => {
  try {
    const { data, error } = await supabase
      .from("form_webhooks")
      .update(updates)
      .eq("id", webhookId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating webhook:", error);
    return { data: null, error: error.message };
  }
};

export const deleteWebhook = async (webhookId: string) => {
  try {
    const { error } = await supabase
      .from("form_webhooks")
      .delete()
      .eq("id", webhookId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error deleting webhook:", error);
    return { error: error.message };
  }
};

export const getWebhookLogs = async (formId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("webhook_logs")
      .select("*")
      .eq("form_id", formId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching webhook logs:", error);
    return { data: null, error: error.message };
  }
};
