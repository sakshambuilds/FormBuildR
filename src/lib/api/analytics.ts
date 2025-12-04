import { supabase } from '@/lib/supabase/client';

export interface DailyAnalytics {
    date: string; // YYYY-MM-DD
    views: number;
    submissions: number;
}

export interface FormAnalyticsData {
    totalViews: number;
    totalSubmissions: number;
    conversionRate: number; // 0-1
    daily: DailyAnalytics[];
}

/**
 * Fetch analytics for a specific form.
 * Returns total views, total submissions, conversion rate and a daily breakdown.
 */
export async function getFormAnalytics(formId: string): Promise<FormAnalyticsData> {
    // ---- Views ----
    const { data: viewRows, error: viewError } = await supabase
        .from('form_views')
        .select('created_at')
        .eq('form_id', formId);
    if (viewError) throw viewError;
    const totalViews = viewRows?.length ?? 0;

    // ---- Submissions ----
    const { data: subRows, error: subError } = await supabase
        .from('responses')
        .select('created_at')
        .eq('form_id', formId);
    if (subError) throw subError;
    const totalSubmissions = subRows?.length ?? 0;

    const conversionRate = totalViews > 0 ? totalSubmissions / totalViews : 0;

    // ---- Daily aggregation ----
    const dailyMap: Record<string, { views: number; submissions: number }> = {};

    viewRows?.forEach((row: any) => {
        const date = new Date(row.created_at).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { views: 0, submissions: 0 };
        dailyMap[date].views += 1;
    });

    subRows?.forEach((row: any) => {
        const date = new Date(row.created_at).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { views: 0, submissions: 0 };
        dailyMap[date].submissions += 1;
    });

    const daily: DailyAnalytics[] = Object.entries(dailyMap)
        .map(([date, { views, submissions }]) => ({ date, views, submissions }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));

    return { totalViews, totalSubmissions, conversionRate, daily };
}

/**
 * Helper to record a view – used on the public form page.
 */
export async function trackFormView(formId: string): Promise<void> {
    const { error } = await supabase.from('form_views').insert({ form_id: formId });
    if (error) console.error('Failed to track form view:', error);
}
