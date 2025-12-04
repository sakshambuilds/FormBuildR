import { FormSchema } from "@/lib/types/form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Star, Lock, LogIn, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitResponse } from "@/lib/api/responses";
import { verifyFormPassword, getForm } from "@/lib/api/forms";
import { supabase } from "@/lib/supabase/client";
import { FileUpload } from "@/components/ui/file-upload";
import { PhoneInputField } from "@/components/ui/phone-input";
import { SignaturePad } from "@/components/ui/signature-pad";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { checkRateLimit, logSubmission, logSpamAttempt, getClientIP } from "@/lib/api/rateLimit";

interface FormRendererProps {
    schema: FormSchema;
    formId: string;
    onSubmit?: (data: any) => Promise<void>;
}

export function FormRenderer({ schema, formId, onSubmit: externalSubmit }: FormRendererProps) {
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [customFields, setCustomFields] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [honeypot, setHoneypot] = useState("");
    const captchaRef = useRef<HCaptcha>(null);

    // Permission states
    const [accessGranted, setAccessGranted] = useState(false);
    const [loadingAccess, setLoadingAccess] = useState(true);
    const [accessType, setAccessType] = useState<'public' | 'password' | 'auth' | 'one_response'>('public');
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [passwordAttempts, setPasswordAttempts] = useState(0);
    const [authError, setAuthError] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

    // Generate theme CSS variables
    const themeColors = schema.theme ?
        (schema.theme.mode === 'dark' ? schema.theme.dark : schema.theme.light) :
        null;

    const themeStyle = themeColors ? {
        '--theme-primary': themeColors.primary,
        '--theme-secondary': themeColors.secondary,
        '--theme-accent': themeColors.accent,
        '--theme-error': themeColors.error,
        '--theme-success': themeColors.success,
        '--theme-text': themeColors.text,
        '--theme-background': themeColors.background,
    } as React.CSSProperties : {};

    // Check permissions on load
    useEffect(() => {
        const checkPermissions = async () => {
            if (formId === 'preview' || externalSubmit) {
                setAccessGranted(true);
                setLoadingAccess(false);
                return;
            }

            setLoadingAccess(true);
            try {
                // Fetch form access settings
                const { data: form } = await getForm(formId);

                if (!form) {
                    setLoadingAccess(false);
                    return;
                }

                const type = form.access_type || 'public';
                setAccessType(type);

                if (type === 'public') {
                    setAccessGranted(true);
                } else if (type === 'auth') {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        setAccessGranted(true);
                    } else {
                        setAuthError(true);
                    }
                } else if (type === 'one_response') {
                    // Check local storage
                    const submitted = localStorage.getItem(`submitted_${formId}`);
                    if (submitted) {
                        setAlreadySubmitted(true);
                    } else {
                        setAccessGranted(true);
                    }
                }
                // For 'password', accessGranted remains false initially
            } catch (error) {
                console.error("Error checking permissions:", error);
            } finally {
                setLoadingAccess(false);
            }
        };

        checkPermissions();
    }, [formId, externalSubmit]);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordAttempts >= 5) {
            setPasswordError("Too many attempts. Please try again later.");
            return;
        }

        setVerifyingPassword(true);
        setPasswordError("");

        try {
            const isValid = await verifyFormPassword(formId, passwordInput);

            if (isValid) {
                setAccessGranted(true);
            } else {
                setPasswordError("Incorrect password");
                setPasswordAttempts(prev => prev + 1);
            }
        } catch (error) {
            setPasswordError("Verification failed");
        } finally {
            setVerifyingPassword(false);
        }
    };

    const handleLogin = async () => {
        // Redirect to login page or show login modal
        // For now, we'll just redirect to the main app login
        window.location.href = "/auth";
    };

    const applyTransformations = (value: string, transforms: string[]) => {
        let newValue = value;
        if (transforms.includes('uppercase')) newValue = newValue.toUpperCase();
        if (transforms.includes('lowercase')) newValue = newValue.toLowerCase();
        if (transforms.includes('trim')) newValue = newValue.trim();
        return newValue;
    };

    const onSubmit = async (data: any) => {
        setSubmitting(true);

        try {
            // Apply transformations to all fields before submission
            const transformedData = { ...data };
            schema.fields.forEach(field => {
                if (field.transform && field.transform.length > 0 && typeof transformedData[field.id] === 'string') {
                    transformedData[field.id] = applyTransformations(transformedData[field.id], field.transform);
                }
            });

            // 1. HONEYPOT CHECK
            if (honeypot) {
                const ipAddress = await getClientIP();
                await logSpamAttempt(ipAddress, "Honeypot field filled", formId, transformedData, navigator.userAgent);
                setSubmitting(false);
                reset();
                setCaptchaToken(null);
                captchaRef.current?.resetCaptcha();
                return;
            }

            // 2. CAPTCHA CHECK
            if (!externalSubmit && import.meta.env.VITE_HCAPTCHA_SITE_KEY && !captchaToken) {
                toast.error("Please complete the verification");
                setSubmitting(false);
                return;
            }

            // 3. RATE LIMIT CHECK
            if (!externalSubmit) {
                const ipAddress = await getClientIP();
                const rateLimitResult = await checkRateLimit({ ipAddress, formId });

                if (!rateLimitResult.allowed) {
                    await logSpamAttempt(ipAddress, `Rate limit: ${rateLimitResult.reason}`, formId, transformedData, navigator.userAgent);
                    toast.error(rateLimitResult.reason || "Too many requests");
                    setSubmitting(false);
                    return;
                }
            }

            // 4. PROCEED WITH SUBMISSION
            const finalData = { ...transformedData, ...ratings, ...customFields };

            if (externalSubmit) {
                await externalSubmit(finalData);
            } else {
                const { data: response, error } = await submitResponse(formId, finalData);

                if (error) throw new Error(error);

                // Log successful submission
                const ipAddress = await getClientIP();
                await logSubmission(ipAddress, formId, true, navigator.userAgent);

                // Set local storage for one_response forms
                if (accessType === 'one_response') {
                    localStorage.setItem(`submitted_${formId}`, 'true');
                    setAlreadySubmitted(true);
                    setAccessGranted(false); // Hide form after submission
                }

                toast.success("Form submitted successfully!", {
                    description: "Thank you for your response."
                });
            }

            // Reset form
            reset();
            setRatings({});
            setCustomFields({});
            setCaptchaToken(null);
            captchaRef.current?.resetCaptcha();
        } catch (error: any) {
            if (!externalSubmit) {
                const ipAddress = await getClientIP();
                await logSubmission(ipAddress, formId, false, navigator.userAgent);
                toast.error("Failed to submit form", {
                    description: error.message || "Please try again."
                });
            }
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (field: any) => {
        const commonProps = {
            id: field.id,
            placeholder: field.placeholder,
        };

        const watchedValue = watch(field.id);

        switch (field.type) {
            case "text":
                return (
                    <div>
                        <Input
                            {...commonProps}
                            type="text"
                            {...register(field.id, {
                                required: field.required ? `${field.label} is required` : false,
                                minLength: field.minLength ? { value: field.minLength, message: `Minimum ${field.minLength} characters required` } : undefined,
                                maxLength: field.maxLength ? { value: field.maxLength, message: `Maximum ${field.maxLength} characters allowed` } : undefined,
                                pattern: field.pattern ? { value: new RegExp(field.pattern), message: field.patternError || "Invalid format" } : undefined,
                                onBlur: (e) => {
                                    if (field.transform && field.transform.length > 0) {
                                        const newValue = applyTransformations(e.target.value, field.transform);
                                        setValue(field.id, newValue);
                                    }
                                }
                            })}
                        />
                        <div className="flex justify-between mt-1">
                            {errors[field.id] ? (
                                <p className="text-sm text-destructive">
                                    {errors[field.id]?.message as string}
                                </p>
                            ) : <div></div>}
                            {field.maxLength && (
                                <p className="text-xs text-muted-foreground">
                                    {(watchedValue || "").length} / {field.maxLength}
                                </p>
                            )}
                        </div>
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "textarea":
                return (
                    <div>
                        <Textarea
                            {...commonProps}
                            {...register(field.id, {
                                required: field.required ? `${field.label} is required` : false,
                                minLength: field.minLength ? { value: field.minLength, message: `Minimum ${field.minLength} characters required` } : undefined,
                                maxLength: field.maxLength ? { value: field.maxLength, message: `Maximum ${field.maxLength} characters allowed` } : undefined,
                                pattern: field.pattern ? { value: new RegExp(field.pattern), message: field.patternError || "Invalid format" } : undefined,
                                onBlur: (e) => {
                                    if (field.transform && field.transform.length > 0) {
                                        const newValue = applyTransformations(e.target.value, field.transform);
                                        setValue(field.id, newValue);
                                    }
                                }
                            })}
                        />
                        <div className="flex justify-between mt-1">
                            {errors[field.id] ? (
                                <p className="text-sm text-destructive">
                                    {errors[field.id]?.message as string}
                                </p>
                            ) : <div></div>}
                            {field.maxLength && (
                                <p className="text-xs text-muted-foreground">
                                    {(watchedValue || "").length} / {field.maxLength}
                                </p>
                            )}
                        </div>
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "number":
                return (
                    <div>
                        <Input
                            {...commonProps}
                            type="number"
                            {...register(field.id, {
                                required: field.required ? `${field.label} is required` : false,
                                min: field.min ? { value: field.min, message: `Minimum value is ${field.min}` } : undefined,
                                max: field.max ? { value: field.max, message: `Maximum value is ${field.max}` } : undefined,
                            })}
                        />
                        {errors[field.id] && (
                            <p className="text-sm text-destructive mt-1">
                                {errors[field.id]?.message as string}
                            </p>
                        )}
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "select":
                return (
                    <div>
                        <Select
                            onValueChange={(value) => setValue(field.id, value)}
                            {...register(field.id, {
                                required: field.required ? `${field.label} is required` : false
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                {(field.options || []).map((option: string, idx: number) => (
                                    <SelectItem key={idx} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors[field.id] && (
                            <p className="text-sm text-destructive mt-1">
                                {errors[field.id]?.message as string}
                            </p>
                        )}
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "checkbox":
                return (
                    <div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={field.id}
                                onCheckedChange={(checked) => setValue(field.id, checked)}
                                {...register(field.id, {
                                    required: field.required ? `${field.label} is required` : false
                                })}
                            />
                            <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                                {field.label}
                            </Label>
                        </div>
                        {errors[field.id] && (
                            <p className="text-sm text-destructive mt-1">
                                {errors[field.id]?.message as string}
                            </p>
                        )}
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "rating":
                const maxRating = field.max || 5;
                const currentRating = ratings[field.id] || 0;
                return (
                    <div>
                        <div className="flex gap-1">
                            {Array.from({ length: maxRating }).map((_, idx) => (
                                <Star
                                    key={idx}
                                    className={`h-6 w-6 cursor-pointer transition-colors ${idx < currentRating
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground"
                                        }`}
                                    onClick={() => setRatings({ ...ratings, [field.id]: idx + 1 })}
                                />
                            ))}
                        </div>
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "file":
                return (
                    <div>
                        <Input
                            {...commonProps}
                            type="file"
                            {...register(field.id, {
                                required: field.required ? `${field.label} is required` : false
                            })}
                        />
                        {errors[field.id] && (
                            <p className="text-sm text-destructive mt-1">
                                {errors[field.id]?.message as string}
                            </p>
                        )}
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "file_upload":
                return (
                    <div>
                        <FileUpload
                            label={field.label}
                            required={field.required}
                            accept={field.accept}
                            maxSize={field.max}
                            value={customFields[field.id]}
                            onChange={(url) => setCustomFields({ ...customFields, [field.id]: url })}
                        />
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "phone":
                return (
                    <div>
                        <PhoneInputField
                            label={field.label}
                            required={field.required}
                            placeholder={field.placeholder}
                            value={customFields[field.id]}
                            onChange={(value) => setCustomFields({ ...customFields, [field.id]: value })}
                        />
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "signature":
                return (
                    <div>
                        <SignaturePad
                            label={field.label}
                            required={field.required}
                            value={customFields[field.id]}
                            onChange={(signature) => setCustomFields({ ...customFields, [field.id]: signature })}
                        />
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "datetime":
                return (
                    <div>
                        <DateTimePicker
                            label={field.label}
                            required={field.required}
                            value={customFields[field.id]}
                            onChange={(datetime) => setCustomFields({ ...customFields, [field.id]: datetime })}
                        />
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "toggle":
                return (
                    <div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id={field.id}
                                checked={customFields[field.id] || false}
                                onCheckedChange={(checked) => setCustomFields({ ...customFields, [field.id]: checked })}
                            />
                            <Label htmlFor={field.id} className="cursor-pointer">
                                {field.label}
                                {field.required && <span className="text-destructive ml-1">*</span>}
                            </Label>
                        </div>
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            case "multiselect":
                return (
                    <div>
                        <MultiSelect
                            label={field.label}
                            required={field.required}
                            options={field.options || []}
                            value={customFields[field.id] || []}
                            onChange={(values) => setCustomFields({ ...customFields, [field.id]: values })}
                            placeholder={field.placeholder || "Select options..."}
                        />
                        {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loadingAccess) {
        return (
            <Card className="p-8 max-w-2xl mx-auto flex items-center justify-center">
                <p className="text-muted-foreground">Loading form...</p>
            </Card>
        );
    }

    if (!accessGranted) {
        if (alreadySubmitted) {
            return (
                <Card className="p-8 max-w-2xl mx-auto text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold">Already Submitted</h2>
                        <p className="text-muted-foreground">
                            You have already submitted this form. Thank you for your response.
                        </p>
                    </div>
                </Card>
            );
        }

        if (authError) {
            return (
                <Card className="p-8 max-w-2xl mx-auto text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <LogIn className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold">Authentication Required</h2>
                        <p className="text-muted-foreground mb-4">
                            You must be logged in to view and submit this form.
                        </p>
                        <Button onClick={handleLogin}>Log In / Sign Up</Button>
                    </div>
                </Card>
            );
        }

        if (accessType === 'password') {
            return (
                <Card className="p-8 max-w-md mx-auto">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                                <Lock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-bold">Password Protected</h2>
                            <p className="text-muted-foreground">
                                This form is password protected. Please enter the password to continue.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="form-password">Password</Label>
                            <Input
                                id="form-password"
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Enter password"
                            />
                            {passwordError && (
                                <p className="text-sm text-destructive">{passwordError}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={verifyingPassword}>
                            {verifyingPassword ? "Verifying..." : "Access Form"}
                        </Button>
                    </form>
                </Card>
            );
        }
    }

    return (
        <>
            {/* Inject custom CSS */}
            {schema.theme?.customCSS && (
                <style>{schema.theme.customCSS}</style>
            )}

            <Card
                className="p-6 max-w-2xl"
                style={{
                    ...themeStyle,
                    backgroundColor: themeColors?.background,
                    color: themeColors?.text,
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <h2 className="text-2xl font-bold" style={{ color: themeColors?.text }}>
                        {schema.title || "Untitled Form"}
                    </h2>

                    {schema.fields.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No fields in this form yet
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {schema.fields.map((field) => {
                                // Fields that render their own labels internally
                                const hasOwnLabel = [
                                    "checkbox",
                                    "toggle",
                                    "phone",
                                    "signature",
                                    "datetime",
                                    "file_upload",
                                    "multiselect"
                                ].includes(field.type);

                                return (
                                    <div key={field.id} className="space-y-2">
                                        {!hasOwnLabel && (
                                            <Label htmlFor={field.id}>
                                                {field.label}
                                                {field.required && <span className="text-destructive ml-1">*</span>}
                                            </Label>
                                        )}
                                        {renderField(field)}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Honeypot - hidden spam trap */}
                    <input
                        type="text"
                        name="secret_middle_name"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                    />

                    {/* hCaptcha Widget */}
                    {!externalSubmit && (
                        import.meta.env.VITE_HCAPTCHA_SITE_KEY ? (
                            <div className="flex justify-center my-4">
                                <HCaptcha
                                    ref={captchaRef}
                                    sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                                    onVerify={(token) => setCaptchaToken(token)}
                                    onExpire={() => setCaptchaToken(null)}
                                />
                            </div>
                        ) : (
                            <div className="p-4 my-4 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-800 text-sm text-center">
                                ⚠️ hCaptcha Site Key is missing.
                                <br />
                                Please add VITE_HCAPTCHA_SITE_KEY to your .env file.
                            </div>
                        )
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={submitting}
                        style={{
                            backgroundColor: themeColors?.primary,
                            color: themeColors?.background,
                        }}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </Button>
                </form>
            </Card>
        </>
    );
}
