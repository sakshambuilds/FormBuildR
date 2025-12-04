import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubmissionActionsProps {
    selectedCount: number;
    onDelete: () => void;
    onExport: (format: "csv" | "json") => void;
}

export function SubmissionActions({
    selectedCount,
    onDelete,
    onExport,
}: SubmissionActionsProps) {
    return (
        <div className="flex items-center gap-2">
            {selectedCount > 0 && (
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedCount})
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onExport("csv")}>
                        Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport("json")}>
                        Export as JSON
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
