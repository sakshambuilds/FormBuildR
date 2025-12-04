import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSubmission, deleteSubmission } from "@/lib/api/submissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SubmissionDetails() {
    const { formId, submissionId } = useParams<{ formId: string; submissionId: string }>();
    const navigate = useNavigate();

    const { data: submission, isLoading } = useQuery({
        queryKey: ["submission", submissionId],
        queryFn: () => getSubmission(submissionId!).then((res) => res.data),
        enabled: !!submissionId,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSubmission,
        onSuccess: () => {
            toast.success("Submission deleted");
            navigate(`/dashboard/forms/${formId}/submissions`);
        },
    });

    const handleExport = () => {
        if (!submission) return;
        const blob = new Blob([JSON.stringify(submission, null, 2)], {
            type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `submission-${submission.id}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!submission) return <div>Submission not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/forms/${formId}/submissions`)}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Submissions
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export JSON
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm("Delete this submission?")) {
                                    deleteMutation.mutate(submission.id);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Submission Details</CardTitle>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>ID: {submission.id}</p>
                            <p>Submitted: {format(new Date(submission.created_at), "PPP pp")}</p>
                            <p>IP Address: {submission.ip_address || "N/A"}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            {Object.entries(submission.data).map(([key, value]) => (
                                <div key={key} className="border-b pb-4 last:border-0">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </h3>
                                    <div className="text-lg">
                                        {typeof value === "object" ? (
                                            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                                                {JSON.stringify(value, null, 2)}
                                            </pre>
                                        ) : (
                                            String(value)
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
