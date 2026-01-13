import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  form_id: string;
  response_id: string;
  data: Record<string, any>;
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendWebhook(webhook: any, payload: any, attempt = 1): Promise<any> {
  const maxRetries = webhook.retries_enabled ? 3 : 1;
  const timeout = 10000; // 10 seconds

  try {
    console.log(`Sending webhook to ${webhook.url} (Attempt ${attempt}/${maxRetries})`);

    let body: any;
    let headers: Record<string, string> = {
      ...webhook.headers,
      'User-Agent': 'FormBuilder-Webhook/1.0',
    };

    if (webhook.payload_format === 'form-data') {
      const formData = new FormData();
      formData.append('form_id', payload.form_id);
      formData.append('response_id', payload.response_id);
      formData.append('data', JSON.stringify(payload.data));
      body = formData;
      // Content-Type header is automatically set by fetch for FormData
    } else {
      body = JSON.stringify(payload);
      headers['Content-Type'] = 'application/json';
      headers['X-Webhook-Signature'] = await signPayload(body, webhook.secret);
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return {
      status: 'success',
      response_code: response.status,
      response_body: 'OK',
      attempt_count: attempt
    };

  } catch (error: any) {
    console.error(`Attempt ${attempt} failed:`, error.message);

    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendWebhook(webhook, payload, attempt + 1);
    }

    return {
      status: 'failed',
      response_code: 0, // 0 indicates network/timeout error usually
      response_body: error.message.substring(0, 1000), // Truncate error
      attempt_count: attempt
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { form_id, response_id, data }: WebhookPayload = await req.json();

    // Get all enabled webhooks for this form
    const { data: webhooks, error: webhooksError } = await supabaseClient
      .from('form_webhooks')
      .select('*')
      .eq('form_id', form_id)
      .eq('enabled', true);

    if (webhooksError) throw webhooksError;

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No webhooks to trigger' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Trigger all webhooks in parallel
    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        const payload = { form_id, response_id, data };
        const result = await sendWebhook(webhook, payload);

        // Log result
        await supabaseClient.from('webhook_logs').insert({
          webhook_id: webhook.id,
          form_id,
          submission_id: response_id,
          status: result.status,
          response_code: result.response_code,
          response_body: result.response_body,
          attempt_count: result.attempt_count
        });

        return { id: webhook.id, ...result };
      })
    );

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
