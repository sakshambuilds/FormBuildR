import { FormField, FormSchema, LogicRule, LogicCondition, LogicOperator, LogicAction } from "@/lib/types/form";

/**
 * Evaluate a single condition against form data
 */
function evaluateCondition(condition: LogicCondition, formData: Record<string, any>): boolean {
    const fieldValue = formData[condition.fieldId];
    const targetValue = condition.value;

    switch (condition.operator) {
        case "equals":
            return fieldValue == targetValue; // Loose equality for type flexibility

        case "not_equals":
            return fieldValue != targetValue;

        case "contains":
            if (typeof fieldValue === "string") {
                return fieldValue.toLowerCase().includes(String(targetValue).toLowerCase());
            }
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(targetValue);
            }
            return false;

        case "gt":
            return Number(fieldValue) > Number(targetValue);

        case "lt":
            return Number(fieldValue) < Number(targetValue);

        case "gte":
            return Number(fieldValue) >= Number(targetValue);

        case "lte":
            return Number(fieldValue) <= Number(targetValue);

        default:
            return false;
    }
}

/**
 * Evaluate a single logic rule
 */
export function evaluateRule(rule: LogicRule, formData: Record<string, any>): boolean {
    if (!rule.conditions || rule.conditions.length === 0) {
        return false;
    }

    const conditionType = rule.conditionType || "AND";

    if (conditionType === "AND") {
        return rule.conditions.every(condition => evaluateCondition(condition, formData));
    } else {
        return rule.conditions.some(condition => evaluateCondition(condition, formData));
    }
}

/**
 * Calculate the computed state for a single field based on its logic rules
 */
export interface FieldState {
    visible: boolean;
    required: boolean;
    disabled: boolean;
}

export function evaluateFieldLogic(
    field: FormField,
    formData: Record<string, any>
): FieldState {
    const state: FieldState = {
        visible: true,
        required: field.required,
        disabled: false,
    };

    if (!field.logic || field.logic.length === 0) {
        return state;
    }

    // Apply each rule
    for (const rule of field.logic) {
        const conditionMet = evaluateRule(rule, formData);

        if (conditionMet) {
            switch (rule.action) {
                case "show":
                    state.visible = true;
                    break;
                case "hide":
                    state.visible = false;
                    break;
                case "require":
                    state.required = true;
                    break;
                case "disable":
                    state.disabled = true;
                    break;
                // skip_page would be handled at a higher level
            }
        }
    }

    return state;
}

/**
 * Calculate states for all fields in a schema
 */
export function evaluateAllFieldLogic(
    schema: FormSchema,
    formData: Record<string, any>
): Record<string, FieldState> {
    const states: Record<string, FieldState> = {};

    for (const field of schema.fields) {
        states[field.id] = evaluateFieldLogic(field, formData);
    }

    return states;
}

/**
 * React hook for managing form logic
 */
import { useState, useEffect } from "react";

export function useFormLogic(schema: FormSchema, formData: Record<string, any>) {
    const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});

    useEffect(() => {
        const states = evaluateAllFieldLogic(schema, formData);
        setFieldStates(states);
    }, [schema, formData]);

    return fieldStates;
}
