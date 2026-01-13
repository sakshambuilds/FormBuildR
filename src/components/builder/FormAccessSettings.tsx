import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Lock, Globe, Users, UserCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { updateForm } from "@/lib/api/forms";
import * as bcrypt from "bcryptjs";

interface FormAccessSettingsProps {
    formId: string;
    initialAccessType: 'public' | 'password' | 'auth' | 'one_response';
    onUpdate: () => void;
}

export function FormAccessSettings({ formId, initialAccessType, onUpdate }: FormAccessSettingsProps) {
    const [accessType, setAccessType] = useState(initialAccessType);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            let updates: any = { access_type: accessType };

            if (accessType === 'password') {
                if (!password) {
                    toast.error("Please enter a password");
                    setLoading(false);
                    return;
                }
                // Hash password before sending to server
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                updates.password_hash = hash;
            }

            const { error } = await updateForm(formId, updates);

            if (error) {
                toast.error("Failed to update access settings");
            } else {
                toast.success("Access settings updated successfully");
                onUpdate();
                setPassword(""); // Clear password field after save
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Form Access</CardTitle>
                <CardDescription>
                    Control who can view and submit your form.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Access Type</Label>
                    <Select
                        value={accessType}
                        onValueChange={(value: any) => setAccessType(value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">
                                <div className="flex items-center">
                                    <Globe className="mr-2 h-4 w-4 text-green-500" />
                                    Public (Everyone)
                                </div>
                            </SelectItem>
                            <SelectItem value="password">
                                <div className="flex items-center">
                                    <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                                    Password Protected
                                </div>
                            </SelectItem>
                            <SelectItem value="auth">
                                <div className="flex items-center">
                                    <Users className="mr-2 h-4 w-4 text-blue-500" />
                                    Logged-in Users Only
                                </div>
                            </SelectItem>
                            <SelectItem value="one_response">
                                <div className="flex items-center">
                                    <UserCheck className="mr-2 h-4 w-4 text-purple-500" />
                                    One Response per Person
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {accessType === 'password' && (
                    <div className="space-y-2 p-4 bg-muted rounded-md border">
                        <Label>Set Password</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter access password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Users will need to enter this password to view the form.
                        </p>
                    </div>
                )}

                {accessType === 'auth' && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-200">
                        <p className="font-semibold mb-1">Authentication Required</p>
                        Users must be logged into their account to view and submit this form.
                        Submissions will automatically be linked to their user ID.
                    </div>
                )}

                {accessType === 'one_response' && (
                    <div className="p-4 bg-purple-50 text-purple-800 rounded-md text-sm border border-purple-200">
                        <p className="font-semibold mb-1">Limit One Response</p>
                        We will use browser cookies and IP address checks to prevent users from submitting more than once.
                        <br />
                        <span className="text-xs opacity-80 mt-1 block">
                            Note: Determined users may still be able to bypass this by clearing cookies or changing IPs.
                        </span>
                    </div>
                )}

                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                </Button>
            </CardContent>
        </Card>
    );
}
