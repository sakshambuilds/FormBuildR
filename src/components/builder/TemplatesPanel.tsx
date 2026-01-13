import React, { useState } from "react";
import { FormTemplate, templates } from "@/templates";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    FileText,
    MessageSquare,
    Briefcase,
    Calendar,
    Bug,
    UserPlus,
    Clock,
    Check
} from "lucide-react";

interface TemplatesPanelProps {
    onSelectTemplate: (template: FormTemplate) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
    general: <FileText className="h-5 w-5" />,
    feedback: <MessageSquare className="h-5 w-5" />,
    hr: <Briefcase className="h-5 w-5" />,
    events: <Calendar className="h-5 w-5" />,
    support: <Bug className="h-5 w-5" />,
    marketing: <UserPlus className="h-5 w-5" />,
    scheduling: <Clock className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
    general: "bg-blue-100 text-blue-800",
    feedback: "bg-green-100 text-green-800",
    hr: "bg-purple-100 text-purple-800",
    events: "bg-pink-100 text-pink-800",
    support: "bg-red-100 text-red-800",
    marketing: "bg-cyan-100 text-cyan-800",
    scheduling: "bg-violet-100 text-violet-800",
};

export function TemplatesPanel({ onSelectTemplate }: TemplatesPanelProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handlePreview = (template: FormTemplate) => {
        setSelectedTemplate(template);
        setIsPreviewOpen(true);
    };

    const handleUseTemplate = (template: FormTemplate) => {
        onSelectTemplate(template);
        setIsPreviewOpen(false);
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Form Templates</h2>
                    <p className="text-muted-foreground">Start with a pre-built template and customize it to your needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {categoryIcons[template.category]}
                                        <CardTitle className="text-lg">{template.title}</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className={categoryColors[template.category]}>
                                        {template.category}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {template.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    <p className="flex items-center gap-1">
                                        <Check className="h-4 w-4" />
                                        {template.schema.fields.length} fields included
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handlePreview(template)}
                                >
                                    Preview
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleUseTemplate(template)}
                                >
                                    Use Template
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {selectedTemplate && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{selectedTemplate.title}</DialogTitle>
                                <DialogDescription>{selectedTemplate.description}</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Included Fields</h3>
                                    <div className="space-y-2">
                                        {selectedTemplate.schema.fields.map((field, idx) => (
                                            <div key={field.id} className="flex items-center gap-2 text-sm">
                                                <Badge variant="outline" className="font-mono">
                                                    {field.type}
                                                </Badge>
                                                <span className="font-medium">{field.label}</span>
                                                {field.required && (
                                                    <Badge variant="secondary" className="text-xs">Required</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedTemplate.schema.theme && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Theme</h3>
                                        <div className="flex gap-2 items-center">
                                            <div
                                                className="h-8 w-8 rounded border"
                                                style={{
                                                    backgroundColor: selectedTemplate.schema.theme.light.primary,
                                                }}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {selectedTemplate.schema.theme.mode} mode with custom colors
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    onClick={() => handleUseTemplate(selectedTemplate)}
                                >
                                    Use This Template
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
