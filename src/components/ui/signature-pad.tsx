import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "./button";
import { Label } from "./label";

interface SignaturePadProps {
    value?: string;
    onChange?: (signature: string) => void;
    label?: string;
    required?: boolean;
}

export function SignaturePad({ value, onChange, label, required }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        if (value && sigCanvas.current) {
            sigCanvas.current.fromDataURL(value);
            setIsEmpty(false);
        }
    }, [value]);

    const handleClear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
        onChange?.("");
    };

    const handleEnd = () => {
        if (sigCanvas.current) {
            const dataURL = sigCanvas.current.toDataURL("image/png");
            setIsEmpty(sigCanvas.current.isEmpty());
            onChange?.(dataURL);
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <div className="border rounded-md bg-white">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        className: "w-full h-40",
                        style: { touchAction: "none" }
                    }}
                    onEnd={handleEnd}
                />
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isEmpty}
            >
                Clear
            </Button>
        </div>
    );
}
