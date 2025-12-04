import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { SubmissionFilter } from "@/lib/api/submissions";

interface SubmissionFiltersProps {
    fields: { id: string; label: string; type: string }[];
    filters: SubmissionFilter[];
    onFiltersChange: (filters: SubmissionFilter[]) => void;
}

export function SubmissionFilters({
    fields,
    filters,
    onFiltersChange,
}: SubmissionFiltersProps) {
    const addFilter = () => {
        onFiltersChange([
            ...filters,
            { field: fields[0]?.id || "", operator: "contains", value: "" },
        ]);
    };

    const removeFilter = (index: number) => {
        const newFilters = [...filters];
        newFilters.splice(index, 1);
        onFiltersChange(newFilters);
    };

    const updateFilter = (index: number, updates: Partial<SubmissionFilter>) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], ...updates };
        onFiltersChange(newFilters);
    };

    const getOperators = (fieldType: string) => {
        switch (fieldType) {
            case "number":
                return [
                    { value: "eq", label: "=" },
                    { value: "gt", label: ">" },
                    { value: "lt", label: "<" },
                    { value: "gte", label: ">=" },
                    { value: "lte", label: "<=" },
                ];
            case "boolean":
                return [{ value: "eq", label: "is" }];
            default:
                return [
                    { value: "contains", label: "contains" },
                    { value: "eq", label: "is exactly" },
                    { value: "neq", label: "is not" },
                ];
        }
    };

    return (
        <div className="space-y-2">
            {filters.map((filter, index) => {
                const field = fields.find((f) => f.id === filter.field);
                const operators = field ? getOperators(field.type) : [];

                return (
                    <div key={index} className="flex items-center gap-2">
                        <Select
                            value={filter.field}
                            onValueChange={(val) => updateFilter(index, { field: val })}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                                {fields.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filter.operator}
                            onValueChange={(val: any) => updateFilter(index, { operator: val })}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                                {operators.map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                        {op.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            className="w-[200px]"
                            placeholder="Value"
                            value={filter.value}
                            onChange={(e) => updateFilter(index, { value: e.target.value })}
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFilter(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                );
            })}

            <Button variant="outline" size="sm" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
            </Button>
        </div>
    );
}
