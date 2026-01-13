import React from "react";
import { FormField, LogicRule, LogicCondition, LogicOperator, LogicAction } from "@/lib/types/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface LogicEditorProps {
    field: FormField;
    allFields: FormField[];
    onChange: (logic: LogicRule[]) => void;
}

export function LogicEditor({ field, allFields, onChange }: LogicEditorProps) {
    const rules = field.logic || [];

    const addRule = () => {
        const newRule: LogicRule = {
            id: `rule-${Date.now()}`,
            conditions: [{
                fieldId: "",
                operator: "equals",
                value: "",
            }],
            action: "show",
        };
        onChange([...rules, newRule]);
    };

    const removeRule = (ruleId: string) => {
        onChange(rules.filter(r => r.id !== ruleId));
    };

    const updateRule = (ruleId: string, updates: Partial<LogicRule>) => {
        onChange(rules.map(r => r.id === ruleId ? { ...r, ...updates } : r));
    };

    const updateCondition = (ruleId: string, conditionIndex: number, updates: Partial<LogicCondition>) => {
        onChange(rules.map(r => {
            if (r.id === ruleId) {
                const newConditions = [...r.conditions];
                newConditions[conditionIndex] = { ...newConditions[conditionIndex], ...updates };
                return { ...r, conditions: newConditions };
            }
            return r;
        }));
    };

    // Filter out current field from target options
    const availableFields = allFields.filter(f => f.id !== field.id);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium">Conditional Logic</h3>
                    <p className="text-xs text-muted-foreground">
                        Show/hide this field based on other fields
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRule}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rule
                </Button>
            </div>

            {rules.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No logic rules defined
                </p>
            )}

            {rules.map((rule) => (
                <Card key={rule.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-sm">Rule</CardTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeRule(rule.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Condition */}
                        {rule.conditions.map((condition, idx) => (
                            <div key={idx} className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label className="text-xs">If Field</Label>
                                    <Select
                                        value={condition.fieldId}
                                        onValueChange={(value) => updateCondition(rule.id, idx, { fieldId: value })}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableFields.map(f => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-xs">Operator</Label>
                                    <Select
                                        value={condition.operator}
                                        onValueChange={(value: LogicOperator) => updateCondition(rule.id, idx, { operator: value })}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equals">Equals</SelectItem>
                                            <SelectItem value="not_equals">Not Equals</SelectItem>
                                            <SelectItem value="contains">Contains</SelectItem>
                                            <SelectItem value="gt">Greater Than</SelectItem>
                                            <SelectItem value="lt">Less Than</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-xs">Value</Label>
                                    <Input
                                        type="text"
                                        value={String(condition.value)}
                                        onChange={(e) => updateCondition(rule.id, idx, { value: e.target.value })}
                                        className="h-8 text-xs"
                                        placeholder="Value"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Action */}
                        <div>
                            <Label className="text-xs">Then</Label>
                            <Select
                                value={rule.action}
                                onValueChange={(value: LogicAction) => updateRule(rule.id, { action: value })}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="show">Show this field</SelectItem>
                                    <SelectItem value="hide">Hide this field</SelectItem>
                                    <SelectItem value="require">Make required</SelectItem>
                                    <SelectItem value="disable">Disable this field</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
