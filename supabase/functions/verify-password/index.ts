import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { formId, password } = await req.json();

        if (!formId || !password) {
            return new Response(
                JSON.stringify({ valid: false, error: 'Missing parameters' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Fetch the stored hash
        const { data: form, error } = await supabaseClient
            .from('forms')
            .select('password_hash')
            .eq('id', formId)
            .single();

        if (error || !form || !form.password_hash) {
            return new Response(
                JSON.stringify({ valid: false, error: 'Form not found or no password set' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            );
        }

        // Compare password
        const isValid = await bcrypt.compare(password, form.password_hash);

        return new Response(
            JSON.stringify({ valid: isValid }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
