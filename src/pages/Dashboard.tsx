import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { fetchForms, deleteForm, Form } from "@/lib/api/forms";
import { Plus, Edit, Trash2, ExternalLink, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadForms(user.id);
        }
    }, [user]);

    const loadForms = async (userId: string) => {
        try {
            const { data, error } = await fetchForms(userId);
            if (error) throw new Error(error);
            setForms(data || []);
        } catch (error: any) {
            console.error("Error loading forms:", error);
            toast({
                variant: "destructive",
                title: "Error loading forms",
                description: "Could not fetch your forms. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await deleteForm(id);
            if (error) throw error;

            setForms(forms.filter(f => f.id !== id));
            toast({
                title: "Form deleted",
                description: "The form has been successfully deleted.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error deleting form",
                description: error.message,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Manage your forms and submissions</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={handleLogout}>
                            Logout
                        </Button>
                        <Button onClick={() => navigate("/builder/new")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Form
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="h-24 bg-gray-100" />
                                <CardContent className="h-12 bg-gray-100 mt-4" />
                            </Card>
                        ))}
                    </div>
                ) : forms.length === 0 ? (
                    <Card className="text-center py-16 border-dashed">
                        <CardContent>
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-blue-50 p-4 rounded-full">
                                    <FileText className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">No forms created yet</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Start building your first form to collect responses from your users.
                                </p>
                                <Button onClick={() => navigate("/builder/new")} className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Form
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                        {forms.map((form) => (
                            <Card key={form.id} className="hover:shadow-md transition-all duration-200 group h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="truncate text-lg leading-tight">{form.name}</CardTitle>
                                        {form.settings?.published && (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full shrink-0">
                                                Live
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription>
                                        Created {new Date(form.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <FileText className="h-4 w-4" />
                                        {form.schema.fields.length} fields
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center pt-4 border-t bg-gray-50/50 gap-2">
                                    <div className="flex gap-2 flex-wrap">
                                        <Button variant="outline" size="sm" asChild className="hover:bg-white">
                                            <Link to={`/builder/${form.id}`}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="hover:bg-white">
                                            <Link to={`/dashboard/forms/${form.id}/responses`}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Responses
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="hover:bg-white">
                                            <Link to={`/dashboard/forms/${form.id}/analytics`}>
                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                Analytics
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild className="hover:bg-white">
                                            <Link to={`/f/${form.id}`} target="_blank">
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Form?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete "{form.name}" and all collected responses.
                                                    This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(form.id)} className="bg-red-600 hover:bg-red-700">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
