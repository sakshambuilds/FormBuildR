import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFormResponses, FormResponse } from "@/lib/api/responses";
import { getForm } from "@/lib/api/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FormResponses() {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [formName, setFormName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!formId) return;

            try {
                // Load form details
                const { data: formData, error: formError } = await getForm(formId);
                if (formError) throw new Error(formError);
                setFormName(formData.name);

                // Load responses
                const { data: responseData, error: responseError } = await getFormResponses(formId);
                if (responseError) throw new Error(responseError);
                setResponses(responseData || []);
            } catch (error: any) {
                console.error("Error loading data:", error);
                toast.error("Failed to load responses");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [formId]);

    const handleExport = () => {
        if (responses.length === 0) return;

        const headers = ["ID", "Created At", ...Object.keys(responses[0].data)];
        const csvContent = [
            headers.join(","),
            ...responses.map(r => [
                r.id,
                r.created_at,
                ...Object.values(r.data).map(v => `"${v}"`)
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${formName}-responses.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{formName}</h1>
                        <p className="text-gray-500">Form Responses</p>
                    </div>
                    <Button onClick={handleExport} disabled={responses.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Responses ({responses.length})</CardTitle>
                        <CardDescription>
                            View all submissions for this form
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {responses.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No responses yet. Share your form to start collecting data.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            {Object.keys(responses[0].data).slice(0, 5).map((key) => (
                                                <TableHead key={key} className="capitalize">
                                                    {key.replace(/_/g, " ")}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {responses.map((response) => (
                                            <TableRow key={response.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(response.created_at).toLocaleString()}
                                                </TableCell>
                                                {Object.entries(response.data).slice(0, 5).map(([key, value]) => (
                                                    <TableCell key={key}>
                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
