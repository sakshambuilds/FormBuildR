import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FormSchema, FormField } from "@/lib/types/form";
import { FieldPalette } from "@/components/builder/FieldPalette";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { FieldProperties } from "@/components/builder/FieldProperties";
import { ThemeEditor } from "@/components/builder/ThemeEditor";
import { TemplatesPanel } from "@/components/builder/TemplatesPanel";
import { PublishDialog } from "@/components/builder/PublishDialog";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code2, Palette, FileStack, Upload, Settings, CheckCircle2, AlertCircle, Loader2, Globe, XCircle } from "lucide-react";
import { FormAccessSettings } from "@/components/builder/FormAccessSettings";
import { FormEmbed } from "@/components/builder/FormEmbed";
import { fieldTemplates } from "@/components/builder/fieldTemplates";
import { FormTemplate } from "@/templates";
import { toast } from "sonner";
import { createForm, updateForm, getForm } from "@/lib/api/forms";
import { publishToGallery, checkIfPublished, unpublishForm } from "@/lib/api/gallery";

export default function Builder() {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const [formSchema, setFormSchema] = useState<FormSchema>({
        title: "Untitled Form",
        fields: [],
    });
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [currentFormId, setCurrentFormId] = useState<string | null>(null);

    // Auto-save states
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [loading, setLoading] = useState(true);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [accessType, setAccessType] = useState<'public' | 'password' | 'auth' | 'one_response'>('public');

    // Ref to track if initial load is done to avoid auto-saving on mount
    const isLoaded = useRef(false);
    // Ref to store the latest schema for retry logic
    const latestSchema = useRef(formSchema);

    useEffect(() => {
        latestSchema.current = formSchema;
    }, [formSchema]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Load form data
    useEffect(() => {
        const loadForm = async () => {
            if (formId && formId !== "new") {
                setLoading(true);
                const { data, error } = await getForm(formId);

                if (error) {
                    toast.error("Failed to load form");
                    console.error(error);
                } else if (data) {
                    setFormSchema(data.schema);
                    setCurrentFormId(data.id);
                    setAccessType(data.access_type || 'public');
                    // Check if published using the new field in forms table
                    // The getForm response should include is_published if we updated the type, 
                    // but we can also use checkIfPublished or just check data.is_published if we cast it.
                    // For now, let's rely on checkIfPublished or the data if available.
                    // Since we updated the DB but maybe not the TS type for getForm return fully, 
                    // let's check safely.
                    if ((data as any).is_published) {
                        setIsPublished(true);
                    } else {
                        // Fallback to checking via API if needed, but getForm should return *
                        setIsPublished(false);
                    }
                    isLoaded.current = true;
                }
                setLoading(false);
            } else {
                // New form
                setLoading(false);
                isLoaded.current = true;
            }
        };

        loadForm();
    }, [formId]);

    // Auto-save effect
    useEffect(() => {
        if (!isLoaded.current) return;
        if (loading) return;

        const save = async () => {
            setSaveStatus('saving');

            try {
                let id = currentFormId;

                if (!id) {
                    // Create new form if it doesn't exist yet
                    const { data, error } = await createForm(
                        formSchema.title,
                        formSchema,
                        {},
                        accessType
                    );
                    if (error) throw error;
                    if (data) {
                        id = data.id;
                        setCurrentFormId(data.id);
                        // Update URL without reload
                        window.history.replaceState(null, "", `/builder/${data.id}`);
                    }
                } else {
                    // Update existing
                    const { error } = await updateForm(id, {
                        name: formSchema.title,
                        schema: formSchema,
                    });
                    if (error) throw error;
                }

                setSaveStatus('saved');
                setLastSaved(new Date());

                // Hide "Saved" after 2 seconds
                setTimeout(() => {
                    setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
                }, 2000);

            } catch (error) {
                console.error("Auto-save failed:", error);
                setSaveStatus('error');
                // Retry after 3 seconds
                setTimeout(() => {
                    save();
                }, 3000);
            }
        };

        const timer = setTimeout(() => {
            save();
        }, 800);

        return () => clearTimeout(timer);
    }, [formSchema, formSchema.title]); // Trigger on schema or title change

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Adding new field from palette
        if (active.data.current?.isNew && over.id === "canvas-droppable") {
            const fieldType = active.data.current.type;
            const template = fieldTemplates.find((t) => t.type === fieldType);

            if (template) {
                const newField: FormField = {
                    id: `field-${Date.now()}`,
                    ...template.defaultField,
                };

                setFormSchema((prev) => ({
                    ...prev,
                    fields: [...prev.fields, newField],
                }));
            }
            return;
        }

        // Reordering existing fields
        if (active.id !== over.id && !active.data.current?.isNew) {
            setFormSchema((prev) => {
                const oldIndex = prev.fields.findIndex((f) => f.id === active.id);
                const newIndex = prev.fields.findIndex((f) => f.id === over.id);

                return {
                    ...prev,
                    fields: arrayMove(prev.fields, oldIndex, newIndex),
                };
            });
        }
    };

    const handleDeleteField = (id: string) => {
        setFormSchema((prev) => ({
            ...prev,
            fields: prev.fields.filter((f) => f.id !== id),
        }));

        if (selectedFieldId === id) {
            setSelectedFieldId(null);
        }
    };

    const handleUpdateField = (updates: Partial<FormField>) => {
        if (!selectedFieldId) return;

        setFormSchema((prev) => ({
            ...prev,
            fields: prev.fields.map((f) =>
                f.id === selectedFieldId ? { ...f, ...updates } : f
            ),
        }));
    };

    const handleUseTemplate = (template: FormTemplate) => {
        setFormSchema(template.schema);
        setSelectedFieldId(null);
        toast.success(`Template "${template.title}" loaded successfully!`);
    };

    const handlePublish = async (metadata: { title: string; description?: string; category?: string }) => {
        if (!currentFormId) {
            toast.error("Please wait for auto-save to complete");
            return;
        }

        const { data, error } = await publishToGallery({
            formId: currentFormId,
            title: metadata.title,
            description: metadata.description,
            category: metadata.category,
        });

        if (error) {
            toast.error("Failed to publish form");
            console.error(error);
        } else {
            setIsPublished(true);
            toast.success("Form published to gallery successfully!");
            setPublishDialogOpen(false);
        }
    };

    const handleUnpublish = async () => {
        if (!currentFormId) return;

        if (!confirm("Are you sure you want to unpublish this form? It will no longer be visible in the gallery.")) {
            return;
        }

        const { error } = await unpublishForm(currentFormId);

        if (error) {
            toast.error("Failed to unpublish form");
            console.error(error);
        } else {
            setIsPublished(false);
            toast.success("Form unpublished successfully");
        }
    };

    // Check if form is already published
    useEffect(() => {
        const checkPublished = async () => {
            if (currentFormId) {
                const { data } = await checkIfPublished(currentFormId);
                setIsPublished(data || false);
            }
        };
        checkPublished();
    }, [currentFormId]);

    const selectedField = formSchema.fields.find((f) => f.id === selectedFieldId) || null;

    const handleExportSchema = () => {
        const json = JSON.stringify(formSchema, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "form-schema.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Schema exported");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading form...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Form Builder</h1>
                    <div className="flex gap-2 items-center">
                        {/* Auto-save indicator */}
                        <div className="mr-4 text-sm text-muted-foreground flex items-center gap-2">
                            {saveStatus === 'saving' && (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Saving...
                                </>
                            )}
                            {saveStatus === 'saved' && (
                                <>
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    Saved
                                </>
                            )}
                            {saveStatus === 'error' && (
                                <>
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                    Failed to save
                                </>
                            )}
                        </div>

                        <Button variant="outline" onClick={handleExportSchema}>
                            <Code2 className="h-4 w-4 mr-2" />
                            Export Schema
                        </Button>

                        {isPublished ? (
                            <Button
                                variant="destructive"
                                onClick={handleUnpublish}
                                disabled={!currentFormId}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Unpublish
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                onClick={() => setPublishDialogOpen(true)}
                                disabled={!currentFormId}
                            >
                                <Globe className="h-4 w-4 mr-2" />
                                Publish to Gallery
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Left Sidebar - Field Palette */}
                        <div className="col-span-3">
                            <FieldPalette />
                        </div>

                        {/* Center - Canvas with Preview Tabs */}
                        <div className="col-span-6">
                            <Tabs defaultValue="builder" className="w-full">
                                <TabsList className="w-full">
                                    <TabsTrigger value="templates" className="flex-1">
                                        <FileStack className="h-4 w-4 mr-2" />
                                        Templates
                                    </TabsTrigger>
                                    <TabsTrigger value="builder" className="flex-1">
                                        Builder
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="flex-1">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview
                                    </TabsTrigger>
                                    <TabsTrigger value="theme" className="flex-1">
                                        <Palette className="h-4 w-4 mr-2" />
                                        Theme
                                    </TabsTrigger>
                                    <TabsTrigger value="settings" className="flex-1">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </TabsTrigger>
                                    <TabsTrigger value="embed" className="flex-1">
                                        <Code2 className="h-4 w-4 mr-2" />
                                        Embed
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="templates" className="mt-4">
                                    <TemplatesPanel onSelectTemplate={handleUseTemplate} />
                                </TabsContent>

                                <TabsContent value="builder" className="mt-4">
                                    <BuilderCanvas
                                        fields={formSchema.fields}
                                        formTitle={formSchema.title}
                                        onFormTitleChange={(title) =>
                                            setFormSchema((prev) => ({ ...prev, title }))
                                        }
                                        selectedFieldId={selectedFieldId}
                                        onSelectField={setSelectedFieldId}
                                        onDeleteField={handleDeleteField}
                                    />
                                </TabsContent>

                                <TabsContent value="preview" className="mt-4">
                                    <FormRenderer schema={formSchema} formId={currentFormId || "preview"} />
                                </TabsContent>

                                <TabsContent value="theme" className="mt-4">
                                    <ThemeEditor
                                        theme={formSchema.theme}
                                        onChange={(theme) => setFormSchema((prev) => ({ ...prev, theme }))}
                                    />
                                </TabsContent>

                                <TabsContent value="settings" className="mt-4">
                                    {currentFormId ? (
                                        <FormAccessSettings
                                            formId={currentFormId}
                                            initialAccessType={accessType}
                                            onUpdate={() => {
                                                // Refresh form data to get latest settings
                                                getForm(currentFormId).then(({ data }) => {
                                                    if (data) setAccessType(data.access_type);
                                                });
                                            }}
                                        />
                                    ) : (
                                        <div className="p-8 text-center bg-muted rounded-lg border border-dashed">
                                            <p className="text-muted-foreground">Please save the form first to configure access settings.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="embed" className="mt-4">
                                    {currentFormId ? (
                                        <FormEmbed formId={currentFormId} />
                                    ) : (
                                        <div className="p-8 text-center bg-muted rounded-lg border border-dashed">
                                            <p className="text-muted-foreground">Please save the form first to get embed options.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Right Sidebar - Properties */}
                        <div className="col-span-3">
                            <FieldProperties
                                field={selectedField}
                                allFields={formSchema.fields}
                                onUpdateField={handleUpdateField}
                            />
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-card border rounded-lg p-4 shadow-lg">
                            Dragging...
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <PublishDialog
                open={publishDialogOpen}
                onOpenChange={setPublishDialogOpen}
                onPublish={handlePublish}
                defaultTitle={formSchema.title}
            />
        </div>
    );
}
