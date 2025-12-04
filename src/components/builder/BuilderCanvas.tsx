import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FormField } from "@/lib/types/form";
import { SortableFieldItem } from "./SortableFieldItem";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BuilderCanvasProps {
  fields: FormField[];
  formTitle: string;
  onFormTitleChange: (title: string) => void;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
}

export function BuilderCanvas({
  fields,
  formTitle,
  onFormTitleChange,
  selectedFieldId,
  onSelectField,
  onDeleteField,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-droppable",
  });

  return (
    <Card
      ref={setNodeRef}
      className={`min-h-[600px] p-6 transition-colors ${
        isOver ? "border-primary bg-accent/50" : ""
      }`}
    >
      <div className="space-y-6">
        <div>
          <Input
            value={formTitle}
            onChange={(e) => onFormTitleChange(e.target.value)}
            placeholder="Form Title"
            className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
          />
        </div>

        {fields.length === 0 ? (
          <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">
              Drag and drop fields here to build your form
            </p>
          </div>
        ) : (
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {fields.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={onSelectField}
                  onDelete={onDeleteField}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </Card>
  );
}
