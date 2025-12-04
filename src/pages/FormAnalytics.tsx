import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getFormAnalytics } from "@/lib/api/analytics";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

export default function FormAnalytics() {
    const { formId } = useParams<{ formId: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!formId) return;
        getFormAnalytics(formId)
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message || "Failed to load analytics");
                setLoading(false);
            });
    }, [formId]);

    if (loading) {
        return (
            <Card className="m-4">
                <CardContent>Loading analytics…</CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="m-4">
                <CardContent className="text-red-600">{error}</CardContent>
            </Card>
        );
    }

    const { totalViews, totalSubmissions, conversionRate, daily } = data;

    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle>Form Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                        <h3 className="text-lg font-medium">Views</h3>
                        <p className="text-2xl font-bold">{totalViews}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Submissions</h3>
                        <p className="text-2xl font-bold">{totalSubmissions}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Conversion</h3>
                        <p className="text-2xl font-bold">{(conversionRate * 100).toFixed(1)}%</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={daily} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
                        <Line type="monotone" dataKey="submissions" stroke="#82ca9d" name="Submissions" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
