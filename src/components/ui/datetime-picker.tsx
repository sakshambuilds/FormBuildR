import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    required?: boolean;
}

export function DateTimePicker({ value, onChange, label, required }: DateTimePickerProps) {
    const [date, setDate] = useState<Date | undefined>(
        value ? new Date(value) : undefined
    );
    const [time, setTime] = useState(
        value ? format(new Date(value), "HH:mm") : "12:00"
    );

    const handleDateChange = (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            updateDateTime(newDate, time);
        }
    };

    const handleTimeChange = (newTime: string) => {
        setTime(newTime);
        if (date) {
            updateDateTime(date, newTime);
        }
    };

    const updateDateTime = (selectedDate: Date, selectedTime: string) => {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const combined = new Date(selectedDate);
        combined.setHours(hours, minutes, 0, 0);
        onChange?.(combined.toISOString());
    };

    return (
        <div className="space-y-2">
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateChange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-32"
                />
            </div>
        </div>
    );
}
