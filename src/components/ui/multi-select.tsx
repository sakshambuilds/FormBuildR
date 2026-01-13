import React, { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface MultiSelectProps {
    options: string[];
    value?: string[];
    onChange?: (value: string[]) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
}

export function MultiSelect({
    options,
    value = [],
    onChange,
    label,
    placeholder = "Select items...",
    required,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (option: string) => {
        const newValue = value.includes(option)
            ? value.filter((v) => v !== option)
            : [...value, option];
        onChange?.(newValue);
    };

    const handleRemove = (option: string) => {
        onChange?.(value.filter((v) => v !== option));
    };

    return (
        <div className="space-y-2">
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <span className="truncate">
                            {value.length > 0 ? `${value.length} selected` : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search..." />
                        <CommandEmpty>No options found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option}
                                    onSelect={() => handleSelect(option)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(option) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {value.map((item) => (
                        <Badge key={item} variant="secondary" className="gap-1">
                            {item}
                            <button
                                type="button"
                                onClick={() => handleRemove(item)}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
