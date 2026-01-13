import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface SubmissionTableProps {
    submissions: any[];
    columns: string[];
    selectedIds: string[];
    onSelect: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onDelete: (id: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading: boolean;
}

export function SubmissionTable({
    submissions,
    columns,
    selectedIds,
    onSelect,
    onSelectAll,
    onDelete,
    page,
    totalPages,
    onPageChange,
    loading,
}: SubmissionTableProps) {
    const allSelected =
        submissions.length > 0 &&
        submissions.every((s) => selectedIds.includes(s.id));

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                Loading submissions...
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-muted-foreground border rounded-md bg-muted/10">
                No submissions found matching your criteria.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead className="w-[180px]">Submitted At</TableHead>
                            {columns.slice(0, 5).map((col) => (
                                <TableHead key={col} className="capitalize min-w-[150px]">
                                    {col.replace(/_/g, " ")}
                                </TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.includes(submission.id)}
                                        onCheckedChange={(checked) =>
                                            onSelect(submission.id, !!checked)
                                        }
                                    />
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {format(new Date(submission.created_at), "MMM d, yyyy HH:mm")}
                                </TableCell>
                                {columns.slice(0, 5).map((col) => (
                                    <TableCell key={col} className="truncate max-w-[200px]">
                                        {typeof submission.data[col] === "object"
                                            ? JSON.stringify(submission.data[col])
                                            : String(submission.data[col] || "-")}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            to={`./${submission.id}`}
                                            className="text-muted-foreground hover:text-primary"
                                        >
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => onDelete(submission.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
