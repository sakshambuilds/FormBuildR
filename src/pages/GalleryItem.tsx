import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";
import { getGalleryForm, PublicForm } from "@/lib/api/gallery";
import { toast } from "sonner";
import { submitResponse } from "@/lib/api/responses";

export default function GalleryItem() {
    const { id } = useParams<{ id: string }>();
    const [galleryForm, setGalleryForm] = useState<PublicForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchGalleryForm = async () => {
            if (!id) return;

            setLoading(true);
            const { data, error } = await getGalleryForm(id);

            if (error) {
                toast.error("Failed to load form");
                console.error(error);
            } else {
                setGalleryForm(data);
            }

            setLoading(false);
        };

        fetchGalleryForm();
    }, [id]);

    const handleSubmit = async (data: Record<string, any>) => {
        if (!galleryForm) return;

        const { error } = await submitResponse(galleryForm.form_id, data);

        if (error) {
            toast.error("Failed to submit form. Please try again.");
            console.error(error);
        } else {
            setSubmitted(true);
            toast.success("Form submitted successfully!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!galleryForm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Form Not Found</CardTitle>
                        <CardDescription>This form does not exist or has been removed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/gallery">
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Gallery
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Thank You!</CardTitle>
                        <CardDescription>Your response has been recorded.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                            Submit Another Response
                        </Button>
                        <Link to="/gallery" className="block">
                            <Button variant="secondary" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Gallery
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link to="/gallery" className="inline-block mb-6">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Gallery
                    </Button>
                </Link>

                {/* Form Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <CardTitle className="text-3xl">{galleryForm.title}</CardTitle>
                                {galleryForm.description && (
                                    <CardDescription className="text-base">
                                        {galleryForm.description}
                                    </CardDescription>
                                )}
                            </div>
                            {galleryForm.category && (
                                <Badge variant="secondary" className="shrink-0">
                                    {galleryForm.category}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Published {new Date(galleryForm.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Public Form</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Renderer */}
                <FormRenderer
                    schema={galleryForm.form_schema}
                    formId={galleryForm.form_id}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
