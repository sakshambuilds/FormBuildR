import React, { useState } from "react";
import { ThemeConfig, ThemeColors } from "@/lib/types/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon } from "lucide-react";

interface ThemeEditorProps {
    theme?: ThemeConfig;
    onChange: (theme: ThemeConfig) => void;
}

const DEFAULT_LIGHT: ThemeColors = {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#8b5cf6",
    error: "#ef4444",
    success: "#22c55e",
    text: "#0f172a",
    background: "#ffffff",
};

const DEFAULT_DARK: ThemeColors = {
    primary: "#60a5fa",
    secondary: "#94a3b8",
    accent: "#a78bfa",
    error: "#f87171",
    success: "#4ade80",
    text: "#f1f5f9",
    background: "#0f172a",
};

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
    const currentTheme = theme || {
        mode: "light" as const,
        light: DEFAULT_LIGHT,
        dark: DEFAULT_DARK,
    };

    const activeColors = currentTheme.mode === "light" ? currentTheme.light : currentTheme.dark;

    const handleColorChange = (key: keyof ThemeColors, value: string) => {
        const updatedTheme = { ...currentTheme };
        if (currentTheme.mode === "light") {
            updatedTheme.light = { ...updatedTheme.light, [key]: value };
        } else {
            updatedTheme.dark = { ...updatedTheme.dark, [key]: value };
        }
        onChange(updatedTheme);
    };

    const handleModeToggle = () => {
        onChange({
            ...currentTheme,
            mode: currentTheme.mode === "light" ? "dark" : "light",
        });
    };

    const handleBackgroundChange = (type: "color" | "gradient" | "image", value: string) => {
        onChange({
            ...currentTheme,
            background: {
                type,
                value,
                imageOptions: type === "image" ? {
                    size: "cover",
                    position: "center",
                } : undefined,
            },
        });
    };

    const handleCustomCSSChange = (css: string) => {
        onChange({
            ...currentTheme,
            customCSS: css,
        });
    };

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Theme Mode</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleModeToggle}
                            className="gap-2"
                        >
                            {currentTheme.mode === "light" ? (
                                <>
                                    <Sun className="h-4 w-4" />
                                    Light
                                </>
                            ) : (
                                <>
                                    <Moon className="h-4 w-4" />
                                    Dark
                                </>
                            )}
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Editing {currentTheme.mode} theme colors
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Color Pickers */}
            <Card>
                <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Customize theme colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(Object.keys(activeColors) as Array<keyof ThemeColors>).map((key) => (
                        <div key={key} className="flex items-center gap-4">
                            <Label className="w-24 capitalize">{key}</Label>
                            <Input
                                type="color"
                                value={activeColors[key]}
                                onChange={(e) => handleColorChange(key, e.target.value)}
                                className="w-20 h-10 p-1 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={activeColors[key]}
                                onChange={(e) => handleColorChange(key, e.target.value)}
                                className="flex-1 font-mono text-sm"
                                placeholder="#000000"
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Background */}
            <Card>
                <CardHeader>
                    <CardTitle>Background</CardTitle>
                    <CardDescription>Set form background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Type</Label>
                        <Select
                            value={currentTheme.background?.type || "color"}
                            onValueChange={(value: "color" | "gradient" | "image") =>
                                handleBackgroundChange(value, currentTheme.background?.value || "")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="color">Solid Color</SelectItem>
                                <SelectItem value="gradient">Gradient</SelectItem>
                                <SelectItem value="image">Image URL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {currentTheme.background?.type === "color" && (
                        <div>
                            <Label>Color</Label>
                            <Input
                                type="color"
                                value={currentTheme.background?.value || "#ffffff"}
                                onChange={(e) => handleBackgroundChange("color", e.target.value)}
                                className="w-full h-10 p-1 cursor-pointer"
                            />
                        </div>
                    )}

                    {currentTheme.background?.type === "gradient" && (
                        <div>
                            <Label>CSS Gradient</Label>
                            <Input
                                type="text"
                                value={currentTheme.background?.value || ""}
                                onChange={(e) => handleBackgroundChange("gradient", e.target.value)}
                                placeholder="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                            />
                        </div>
                    )}

                    {currentTheme.background?.type === "image" && (
                        <div>
                            <Label>Image URL</Label>
                            <Input
                                type="text"
                                value={currentTheme.background?.value || ""}
                                onChange={(e) => handleBackgroundChange("image", e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Custom CSS */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom CSS</CardTitle>
                    <CardDescription>
                        Add custom CSS (inline styles only, no selectors)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={currentTheme.customCSS || ""}
                        onChange={(e) => handleCustomCSSChange(e.target.value)}
                        placeholder=".form-container { padding: 2rem; }&#10;.form-title { font-size: 2rem; }"
                        className="font-mono text-sm min-h-[200px]"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
