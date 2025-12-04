import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getForm } from "@/lib/api/forms";
import {
    getSubmissions,
    deleteSubmissions,
    SubmissionFilter,
} from "@/lib/api/submissions";
import { SubmissionTable } from "@/components/submissions/SubmissionTable";
import { SubmissionFilters } from "@/components/submissions/SubmissionFilters";
import { SubmissionActions } from "@/components/submissions/SubmissionActions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Submissions() {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<SubmissionFilter[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [limit, setLimit] = useState(20);

    // Fetch Form Details (for fields)
    const { data: form, isLoading: formLoading } = useQuery({
        queryKey: ["form", formId],
        queryFn: () => getForm(formId!).then((res) => res.data),
        enabled: !!formId,
    });

    // Fetch Submissions
    const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
        queryKey: ["submissions", formId, page, limit, filters],
        queryFn: () =>
            getSubmissions({
                formId: formId!,
                page,
                limit,
                filters,
            }),
        enabled: !!formId,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteSubmissions,
        onSuccess: () => {
            toast.success("Submissions deleted successfully");
            setSelectedIds([]);
            queryClient.invalidateQueries({ queryKey: ["submissions", formId] });
        },
        onError: (error: any) => {
            toast.error("Failed to delete submissions: " + error.message);
        },
    });

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked && submissionsData?.data) {
            setSelectedIds(submissionsData.data.map((s: any) => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} submissions?`)) {
            deleteMutation.mutate(selectedIds);
        }
    };

    const handleExport = (format: "csv" | "json") => {
        if (!submissionsData?.data) return;

        const dataToExport =
            selectedIds.length > 0
                ? submissionsData.data.filter((s: any) => selectedIds.includes(s.id))
                : submissionsData.data;

        if (format === "json") {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                type: "application/json",
            });
            downloadFile(blob, `${form?.name}-submissions.json`);
        } else {
            // CSV Export
            const headers = ["ID", "Created At", ...Object.keys(dataToExport[0]?.data || {})];
            const csvContent = [
                headers.join(","),
                ...dataToExport.map((s: any) =>
                    [
                        s.id,
                        s.created_at,
                        ...Object.values(s.data).map((v) => `"${v}"`),
                    ].join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv" });
            downloadFile(blob, `${form?.name}-submissions.csv`);
        }
    };

    const downloadFile = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (formLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!form) return <div>Form not found</div>;

    // Extract fields from schema for filters
    const fields = form.schema.fields || [];
    // Extract columns from first submission or schema
    const columns =
        fields.length > 0
            ? fields.map((f: any) => f.id)
            : submissionsData?.data?.[0]
                ? Object.keys(submissionsData.data[0].data)
                : [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
                        <p className="text-gray-500">Submission Management</p>
                    </div>
                    <SubmissionActions
                        selectedCount={selectedIds.length}
                        onDelete={handleDelete}
                        onExport={handleExport}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Submissions</CardTitle>
                        <CardDescription>
                            Manage and view your form submissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SubmissionFilters
                            fields={fields}
                            filters={filters}
                            onFiltersChange={setFilters}
                        />

                        <SubmissionTable
                            submissions={submissionsData?.data || []}
                            columns={columns}
                            selectedIds={selectedIds}
                            onSelect={handleSelect}
                            onSelectAll={handleSelectAll}
                            onDelete={(id) => deleteMutation.mutate([id])}
                            page={page}
                            totalPages={submissionsData?.totalPages || 1}
                            onPageChange={setPage}
                            loading={submissionsLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
