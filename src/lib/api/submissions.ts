import { supabase } from "@/lib/supabase/client";

export interface SubmissionFilter {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'ilike';
    value: any;
}

export interface GetSubmissionsOptions {
    formId: string;
    page?: number;
    limit?: number;
    filters?: SubmissionFilter[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function getSubmissions({
    formId,
    page = 1,
    limit = 20,
    filters = [],
    search,
    sortBy = 'created_at',
    sortOrder = 'desc'
}: GetSubmissionsOptions) {
    try {
        let query = supabase
            .from('responses')
            .select('*', { count: 'exact' })
            .eq('form_id', formId);

        // Apply filters
        filters.forEach(filter => {
            // Handle JSON data filtering
            // Note: This assumes the field is inside the 'data' JSONB column
            const column = `data->>${filter.field}`;

            switch (filter.operator) {
                case 'eq': query = query.eq(column, filter.value); break;
                case 'neq': query = query.neq(column, filter.value); break;
                case 'gt': query = query.gt(column, filter.value); break;
                case 'lt': query = query.lt(column, filter.value); break;
                case 'gte': query = query.gte(column, filter.value); break;
                case 'lte': query = query.lte(column, filter.value); break;
                case 'contains': query = query.ilike(column, `%${filter.value}%`); break;
                case 'ilike': query = query.ilike(column, `%${filter.value}%`); break;
            }
        });

        // Apply global search (searches across the entire JSONB object)
        if (search) {
            // This is a simple text search on the JSON representation
            // For better performance on large datasets, we'd need a dedicated search index
            query = query.textSearch('data', search, { config: 'english' });
            // Fallback if textSearch isn't configured or suitable:
            // query = query.ilike('data::text', `%${search}%`);
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data,
            count,
            error: null,
            page,
            limit,
            totalPages: count ? Math.ceil(count / limit) : 0
        };
    } catch (error: any) {
        console.error('Error fetching submissions:', error);
        return { data: null, count: 0, error: error.message };
    }
}

export async function getSubmission(id: string) {
    try {
        const { data, error } = await supabase
            .from('responses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching submission:', error);
        return { data: null, error: error.message };
    }
}

export async function deleteSubmission(id: string) {
    try {
        const { error } = await supabase
            .from('responses')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error('Error deleting submission:', error);
        return { error: error.message };
    }
}

export async function deleteSubmissions(ids: string[]) {
    try {
        const { error } = await supabase
            .from('responses')
            .delete()
            .in('id', ids);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error('Error deleting submissions:', error);
        return { error: error.message };
    }
}
