import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, User, ListChecks } from "lucide-react";
import { PublicForm } from "@/lib/api/gallery";

interface GalleryCardProps {
    form: PublicForm;
}

export function GalleryCard({ form }: GalleryCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
                {/* Thumbnail logic if we had one, for now placeholder or if user adds it */}
                <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-t-lg">
                    <span className="text-4xl font-bold text-muted-foreground opacity-50">
                        {form.name.charAt(0).toUpperCase()}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{form.name}</CardTitle>
                        {form.category && (
                            <Badge variant="secondary" className="shrink-0">
                                {form.category}
                            </Badge>
                        )}
                    </div>

                    {form.description && (
                        <CardDescription className="line-clamp-2">
                            {form.description}
                        </CardDescription>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>{new Date(form.published_at || form.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ListChecks className="h-3 w-3" />
                            <span>{form.schema.fields.length} fields</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Link to={`/f/${form.id}`} className="w-full">
                    <Button className="w-full" variant="default">
                        <Eye className="h-4 w-4 mr-2" />
                        Open Form
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
