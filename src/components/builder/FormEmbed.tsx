import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface FormEmbedProps {
    formId: string;
}

export function FormEmbed({ formId }: FormEmbedProps) {
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/f/${formId}`;
    const embedScriptUrl = `${baseUrl}/embed.js`;

    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(null), 2000);
    };

    const iframeCode = `<iframe
  src="${formUrl}"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`;

    const scriptCode = `<div id="my-form"></div>
<script src="${embedScriptUrl}" form-id="${formId}"></script>`;

    const reactCode = `import React from "react";

export function FormEmbed({ formId }) {
  return (
    <iframe
      src={\`${baseUrl}/f/\${formId}\`}
      style={{ width: "100%", height: "600px", border: "0" }}
    />
  );
}`;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2">Embed Form</h2>
                <p className="text-sm text-muted-foreground">
                    Choose an embed method to add this form to your website.
                </p>
            </div>

            <Tabs defaultValue="iframe" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="iframe">Iframe</TabsTrigger>
                    <TabsTrigger value="script">Script</TabsTrigger>
                    <TabsTrigger value="react">React</TabsTrigger>
                </TabsList>

                <TabsContent value="iframe" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Iframe Embed</CardTitle>
                            <CardDescription>
                                The simplest way to embed. Works on any website.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                    {iframeCode}
                                </pre>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute top-2 right-2"
                                    onClick={() => copyToClipboard(iframeCode, "iframe")}
                                >
                                    {copied === "iframe" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="script" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Script Embed</CardTitle>
                            <CardDescription>
                                Embeds the form into a specific div on your page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                    {scriptCode}
                                </pre>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute top-2 right-2"
                                    onClick={() => copyToClipboard(scriptCode, "script")}
                                >
                                    {copied === "script" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="react" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>React Component</CardTitle>
                            <CardDescription>
                                Use this component in your React application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                    {reactCode}
                                </pre>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute top-2 right-2"
                                    onClick={() => copyToClipboard(reactCode, "react")}
                                >
                                    {copied === "react" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
