import { supabase } from "@/lib/supabase/client";

export interface UploadResult {
    url: string;
    path: string;
    error: string | null;
}

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name (default: "form-uploads")
 * @param path Optional path prefix within the bucket
 */
export async function uploadFile(
    file: File,
    bucket: string = "form-uploads",
    path?: string
): Promise<UploadResult> {
    try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = path ? `${path}/${fileName}` : fileName;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            return { url: "", path: "", error: uploadError.message };
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

        return {
            url: data.publicUrl,
            path: filePath,
            error: null,
        };
    } catch (error: any) {
        return {
            url: "",
            path: "",
            error: error.message || "File upload failed",
        };
    }
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(path: string, bucket: string = "form-uploads"): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string, bucket: string = "form-uploads"): Promise<{ error: string | null }> {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        return { error: error ? error.message : null };
    } catch (error: any) {
        return { error: error.message || "File deletion failed" };
    }
}
