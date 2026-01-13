import { FormField } from "@/lib/types/form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { LogicEditor } from "./LogicEditor";
import { Plus, X } from "lucide-react";

interface FieldPropertiesProps {
  field: FormField | null;
  allFields: FormField[];
  onUpdateField: (updates: Partial<FormField>) => void;
}

export function FieldProperties({ field, allFields, onUpdateField }: FieldPropertiesProps) {
  if (!field) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a field to edit its properties
        </p>
      </Card>
    );
  }

  const addOption = () => {
    const currentOptions = field.options || [];
    onUpdateField({
      options: [...currentOptions, `Option ${currentOptions.length + 1}`],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdateField({ options: newOptions });
  };

  const toggleTransform = (transformType: 'uppercase' | 'lowercase' | 'trim') => {
    const currentTransforms = field.transform || [];
    if (currentTransforms.includes(transformType)) {
      onUpdateField({ transform: currentTransforms.filter(t => t !== transformType) });
    } else {
      // If adding uppercase, remove lowercase and vice versa
      let newTransforms = [...currentTransforms];
      if (transformType === 'uppercase') newTransforms = newTransforms.filter(t => t !== 'lowercase');
      if (transformType === 'lowercase') newTransforms = newTransforms.filter(t => t !== 'uppercase');

      onUpdateField({ transform: [...newTransforms, transformType] });
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">General</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="logic">Logic</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4 mt-4">
          <h3 className="font-semibold">Field Properties</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={field.label}
                onChange={(e) => onUpdateField({ label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={field.placeholder || ""}
                onChange={(e) => onUpdateField({ placeholder: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpText">Help Text</Label>
              <Input
                id="helpText"
                value={field.helpText || ""}
                onChange={(e) => onUpdateField({ helpText: e.target.value })}
                placeholder="Description below the field"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="required">Required</Label>
              <Switch
                id="required"
                checked={field.required}
                onCheckedChange={(checked) => onUpdateField({ required: checked })}
              />
            </div>

            {(field.type === "select" || field.type === "multiselect") && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {field.type === "rating" && (
              <div className="space-y-2">
                <Label htmlFor="max">Max Rating</Label>
                <Input
                  id="max"
                  type="number"
                  min="1"
                  max="10"
                  value={field.max || 5}
                  onChange={(e) => onUpdateField({ max: parseInt(e.target.value) })}
                />
              </div>
            )}

            {field.type === "file_upload" && (
              <div className="space-y-2">
                <Label htmlFor="accept">Accepted File Types</Label>
                <Input
                  id="accept"
                  value={field.accept || ""}
                  onChange={(e) => onUpdateField({ accept: e.target.value })}
                  placeholder=".pdf,.jpg,.png"
                />
                <Label htmlFor="maxSize">Max Size (MB)</Label>
                <Input
                  id="maxSize"
                  type="number"
                  min="1"
                  max="100"
                  value={field.max || 10}
                  onChange={(e) => onUpdateField({ max: parseInt(e.target.value) })}
                />
              </div>
            )}

            {/* Advanced Transformations */}
            {['text', 'textarea', 'email'].includes(field.type) && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="font-semibold">Value Transformations</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transform-uppercase"
                      checked={(field.transform || []).includes('uppercase')}
                      onCheckedChange={() => toggleTransform('uppercase')}
                    />
                    <Label htmlFor="transform-uppercase" className="font-normal">Uppercase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transform-lowercase"
                      checked={(field.transform || []).includes('lowercase')}
                      onCheckedChange={() => toggleTransform('lowercase')}
                    />
                    <Label htmlFor="transform-lowercase" className="font-normal">Lowercase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transform-trim"
                      checked={(field.transform || []).includes('trim')}
                      onCheckedChange={() => toggleTransform('trim')}
                    />
                    <Label htmlFor="transform-trim" className="font-normal">Trim Whitespace</Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4 mt-4">
          <h3 className="font-semibold">Validation Rules</h3>

          {['text', 'textarea', 'email', 'password'].includes(field.type) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Min Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min="0"
                    value={field.minLength || ""}
                    onChange={(e) => onUpdateField({ minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLength">Max Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    min="0"
                    value={field.maxLength || ""}
                    onChange={(e) => onUpdateField({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">Regex Pattern</Label>
                <Input
                  id="pattern"
                  value={field.pattern || ""}
                  onChange={(e) => onUpdateField({ pattern: e.target.value })}
                  placeholder="e.g. ^[A-Za-z]+$"
                />
                <p className="text-xs text-muted-foreground">Regular expression for validation</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patternError">Custom Error Message</Label>
                <Input
                  id="patternError"
                  value={field.patternError || ""}
                  onChange={(e) => onUpdateField({ patternError: e.target.value })}
                  placeholder="Invalid format"
                />
              </div>
            </>
          )}

          {field.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minVal">Minimum Value</Label>
                <Input
                  id="minVal"
                  type="number"
                  value={field.min || ""}
                  onChange={(e) => onUpdateField({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxVal">Maximum Value</Label>
                <Input
                  id="maxVal"
                  type="number"
                  value={field.max || ""}
                  onChange={(e) => onUpdateField({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
            </div>
          )}

          {!['text', 'textarea', 'email', 'password', 'number'].includes(field.type) && (
            <p className="text-sm text-muted-foreground italic">
              No advanced validation options available for this field type.
            </p>
          )}
        </TabsContent>

        <TabsContent value="logic" className="mt-4">
          <LogicEditor
            field={field}
            allFields={allFields}
            onChange={(logic) => onUpdateField({ logic })}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
