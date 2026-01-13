import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { FormField } from "@/lib/types/form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SortableFieldItemProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SortableFieldItem({
  field,
  isSelected,
  onSelect,
  onDelete,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(field.id)}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{field.label}</span>
            {field.required && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {field.type}
            </Badge>
          </div>
          
          {field.placeholder && (
            <p className="text-sm text-muted-foreground">{field.placeholder}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
