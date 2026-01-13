import { useState, useEffect } from "react";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { getGalleryForms, PublicForm } from "@/lib/api/gallery";
import { toast } from "sonner";

const categories = [
    "All Categories",
    "Contact Forms",
    "Surveys",
    "Registrations",
    "Feedback",
    "Applications",
    "Bookings",
    "Other",
];

export default function Gallery() {
    const [forms, setForms] = useState<PublicForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch forms
    useEffect(() => {
        const fetchForms = async () => {
            setLoading(true);

            const filters = {
                search: debouncedSearch || undefined,
                category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
                limit: 50,
            };

            const { data, error } = await getGalleryForms(filters);

            if (error) {
                toast.error("Failed to load gallery forms");
                console.error(error);
            } else {
                setForms(data || []);
            }

            setLoading(false);
        };

        fetchForms();
    }, [debouncedSearch, selectedCategory]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-b">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold mb-4">Form Gallery</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Browse and discover public forms created by our community. Find inspiration or use them as templates for your own projects.
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search forms..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Forms Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : forms.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg mb-4">
                            {searchQuery || selectedCategory !== "All Categories"
                                ? "No forms found matching your criteria"
                                : "No public forms available yet"}
                        </p>
                        {searchQuery || selectedCategory !== "All Categories" ? (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All Categories");
                                }}
                            >
                                Clear Filters
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {forms.map((form) => (
                                <GalleryCard key={form.id} form={form} />
                            ))}
                        </div>

                        <div className="text-center mt-8 text-muted-foreground">
                            Showing {forms.length} form{forms.length !== 1 ? "s" : ""}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
