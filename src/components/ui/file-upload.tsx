import React, { useCallback, useState } from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";
import { uploadFile } from "@/lib/api/storage";
import { toast } from "sonner";

interface FileUploadProps {
    value?: string; // URL of uploaded file
    onChange?: (url: string) => void;
    label?: string;
    required?: boolean;
    accept?: string;
    maxSize?: number; // in MB
}

export function FileUpload({
    value,
    onChange,
    label,
    required,
    accept,
    maxSize = 10,
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = useCallback(
        async (file: File) => {
            // Validate file size
            if (file.size > maxSize * 1024 * 1024) {
                toast.error(`File size must be less than ${maxSize}MB`);
                return;
            }

            // Validate file type
            if (accept) {
                const acceptedTypes = accept.split(",").map((t) => t.trim());
                const fileType = file.type;
                const fileExt = `.${file.name.split(".").pop()}`;

                const isAccepted = acceptedTypes.some(
                    (type) => type === fileType || type === fileExt
                );

                if (!isAccepted) {
                    toast.error(`File type not accepted. Accepted types: ${accept}`);
                    return;
                }
            }

            setUploading(true);

            const result = await uploadFile(file);

            if (result.error) {
                toast.error(result.error);
            } else {
                onChange?.(result.url);
                toast.success("File uploaded successfully");
            }

            setUploading(false);
        },
        [accept, maxSize, onChange]
    );

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        onChange?.("");
    };

    return (
        <div className="space-y-2">
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            {!value ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleChange}
                        accept={accept}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    Drop file here or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Max size: {maxSize}MB
                                    {accept && ` • ${accept}`}
                                </p>
                            </>
                        )}
                    </label>
                </div>
            ) : (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm truncate hover:underline"
                    >
                        {value.split("/").pop()}
                    </a>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
