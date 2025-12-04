import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Label } from "./label";
import "./phone-input-styles.css";

interface PhoneInputFieldProps {
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
}

export function PhoneInputField({
    value,
    onChange,
    label,
    placeholder = "Enter phone number",
    required,
}: PhoneInputFieldProps) {
    return (
        <div className="space-y-2">
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <PhoneInput
                international
                defaultCountry="US"
                value={value}
                onChange={(val) => onChange?.(val || "")}
                placeholder={placeholder}
                className="phone-input-custom"
            />
        </div>
    );
}
