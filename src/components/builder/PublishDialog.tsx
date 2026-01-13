import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PublishDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPublish: (data: {
        title: string;
        description: string | undefined;
        category: string | undefined;
    }) => Promise<void>;
    defaultTitle?: string;
}

const categories = [
    "Contact Forms",
    "Surveys",
    "Registrations",
    "Feedback",
    "Applications",
    "Bookings",
    "Other",
];

export function PublishDialog({ open, onOpenChange, onPublish, defaultTitle }: PublishDialogProps) {
    const [title, setTitle] = useState(defaultTitle || "");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [publishing, setPublishing] = useState(false);

    const handlePublish = async () => {
        if (!title.trim()) {
            return;
        }

        setPublishing(true);
        try {
            await onPublish({
                title: title.trim(),
                description: description.trim() || undefined,
                category: category || undefined,
            });
            onOpenChange(false);
            // Reset form
            setTitle(defaultTitle || "");
            setDescription("");
            setCategory("");
        } catch (error) {
            console.error(error);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Publish to Gallery</DialogTitle>
                    <DialogDescription>
                        Make your form publicly available in the gallery. Anyone will be able to view and submit responses.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Form Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a descriptive title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this form is for... (optional)"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={publishing}>
                        Cancel
                    </Button>
                    <Button onClick={handlePublish} disabled={!title.trim() || publishing}>
                        {publishing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            "Publish to Gallery"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
