import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Edit, Key, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook, getWebhookLogs, Webhook, WebhookLog } from "@/lib/api/webhooks";
import { getForm } from "@/lib/api/forms";
import { format } from "date-fns";

export default function FormWebhooks() {
  const { formId } = useParams<{ formId: string }>();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [formName, setFormName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);

  // Form state
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [payloadFormat, setPayloadFormat] = useState<'json' | 'form-data'>('json');
  const [retriesEnabled, setRetriesEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    if (!formId) return;

    setLoading(true);

    // Load form details
    const { data: formData } = await getForm(formId);
    if (formData) setFormName(formData.name);

    // Load webhooks
    const { data: webhookData } = await getWebhooks(formId);
    if (webhookData) setWebhooks(webhookData);

    // Load logs
    const { data: logData } = await getWebhookLogs(formId);
    if (logData) setLogs(logData);

    setLoading(false);
  };

  const generateSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setSecret(secret);
  };

  const handleCreate = async () => {
    if (!formId || !url || !secret) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await createWebhook(formId, url, secret, {
      payload_format: payloadFormat,
      retries_enabled: retriesEnabled
    });

    if (error) {
      toast.error("Failed to create webhook");
    } else {
      toast.success("Webhook created successfully");
      setIsCreateOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleUpdate = async (webhookId: string, updates: any) => {
    const { error } = await updateWebhook(webhookId, updates);

    if (error) {
      toast.error("Failed to update webhook");
    } else {
      toast.success("Webhook updated successfully");
      setEditingWebhook(null);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    const { error } = await deleteWebhook(webhookId);

    if (error) {
      toast.error("Failed to delete webhook");
    } else {
      toast.success("Webhook deleted successfully");
      loadData();
    }
  };

  const resetForm = () => {
    setUrl("");
    setSecret("");
    setPayloadFormat('json');
    setRetriesEnabled(true);
  };

  const openEditDialog = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setUrl(webhook.url);
    setSecret(webhook.secret);
    setPayloadFormat(webhook.payload_format);
    setRetriesEnabled(webhook.retries_enabled);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to={`/builder/${formId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Builder
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{formName}</h1>
            <p className="text-muted-foreground">Webhook Integration</p>
          </div>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configured Webhooks</CardTitle>
                <CardDescription>
                  Manage endpoints that receive form submissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Webhook
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Webhook</DialogTitle>
                        <DialogDescription>
                          Configure a new webhook endpoint.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input
                            placeholder="https://api.example.com/webhook"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Secret Key</Label>
                          <div className="flex gap-2">
                            <Input
                              value={secret}
                              onChange={(e) => setSecret(e.target.value)}
                              placeholder="Signing secret"
                            />
                            <Button variant="outline" size="icon" onClick={generateSecret}>
                              <Key className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Payload Format</Label>
                          <Select value={payloadFormat} onValueChange={(v: any) => setPayloadFormat(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="form-data">Form Data</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Retry on Failure</Label>
                          <Switch
                            checked={retriesEnabled}
                            onCheckedChange={setRetriesEnabled}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create Webhook</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {webhooks.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No webhooks configured</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Retries</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell className="font-mono text-sm truncate max-w-[300px]">
                            {webhook.url}
                          </TableCell>
                          <TableCell className="uppercase text-xs font-bold text-muted-foreground">
                            {webhook.payload_format}
                          </TableCell>
                          <TableCell>
                            {webhook.retries_enabled ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Disabled
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={webhook.enabled}
                              onCheckedChange={() => handleUpdate(webhook.id, { enabled: !webhook.enabled })}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(webhook)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(webhook.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Edit Dialog */}
                <Dialog open={!!editingWebhook} onOpenChange={(open) => !open && setEditingWebhook(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Webhook</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <Input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <div className="flex gap-2">
                          <Input
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                          />
                          <Button variant="outline" size="icon" onClick={generateSecret}>
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Payload Format</Label>
                        <Select value={payloadFormat} onValueChange={(v: any) => setPayloadFormat(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="form-data">Form Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Retry on Failure</Label>
                        <Switch
                          checked={retriesEnabled}
                          onCheckedChange={setRetriesEnabled}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingWebhook(null)}>Cancel</Button>
                      <Button onClick={() => {
                        if (editingWebhook) {
                          handleUpdate(editingWebhook.id, {
                            url,
                            secret,
                            payload_format: payloadFormat,
                            retries_enabled: retriesEnabled
                          });
                        }
                      }}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Logs</CardTitle>
                <CardDescription>
                  Recent webhook delivery attempts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {logs.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No logs available</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Response</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                          </TableCell>
                          <TableCell>
                            {log.status === 'success' ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Success
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Failed
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono">
                            {log.response_code || '-'}
                          </TableCell>
                          <TableCell>
                            {log.attempt_count}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <div className="truncate text-xs font-mono bg-muted p-1 rounded">
                              {log.response_body || "No response body"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
