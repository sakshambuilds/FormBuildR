import { supabase } from "@/lib/supabase/client";

export interface RateLimitResult {
    allowed: boolean;
    reason?: string;
    retryAfter?: number; // seconds
}

export interface RateLimitCheck {
    ipAddress: string;
    formId?: string;
}

// Rate limit rules
const RATE_LIMITS = {
    PER_MINUTE: 3,
    PER_DAY: 50,
};

export async function checkRateLimit({ ipAddress, formId }: RateLimitCheck): Promise<RateLimitResult> {
    try {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Check last minute (3 submissions max)
        const { data: recentSubmissions, error: recentError } = await supabase
            .from("form_submissions_log")
            .select("id")
            .eq("ip_address", ipAddress)
            .gte("submitted_at", oneMinuteAgo.toISOString());

        if (recentError) throw recentError;

        if (recentSubmissions && recentSubmissions.length >= RATE_LIMITS.PER_MINUTE) {
            return {
                allowed: false,
                reason: "Too many submissions in the last minute. Please wait and try again.",
                retryAfter: 60,
            };
        }

        // Check last 24 hours (50 submissions max)
        const { data: dailySubmissions, error: dailyError } = await supabase
            .from("form_submissions_log")
            .select("id")
            .eq("ip_address", ipAddress)
            .gte("submitted_at", oneDayAgo.toISOString());

        if (dailyError) throw dailyError;

        if (dailySubmissions && dailySubmissions.length >= RATE_LIMITS.PER_DAY) {
            return {
                allowed: false,
                reason: "Daily submission limit reached. Please try again tomorrow.",
                retryAfter: 86400, // 24 hours
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error("Rate limit check error:", error);
        // On error, allow submission (fail open for better UX)
        return { allowed: true };
    }
}

export async function logSubmission(
    ipAddress: string,
    formId: string,
    success: boolean,
    userAgent?: string
) {
    try {
        await supabase.from("form_submissions_log").insert({
            ip_address: ipAddress,
            form_id: formId,
            success,
            user_agent: userAgent,
        });
    } catch (error) {
        console.error("Failed to log submission:", error);
    }
}

export async function logSpamAttempt(
    ipAddress: string,
    reason: string,
    formId?: string,
    attemptedData?: any,
    userAgent?: string
) {
    try {
        await supabase.from("spam_attempts").insert({
            ip_address: ipAddress,
            form_id: formId,
            reason,
            attempted_data: attemptedData,
            user_agent: userAgent,
        });
    } catch (error) {
        console.error("Failed to log spam attempt:", error);
    }
}

// Get client IP address (using a third-party service as fallback)
export async function getClientIP(): Promise<string> {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip || "unknown";
    } catch (error) {
        console.error("Failed to get IP:", error);
        return "unknown";
    }
}
