import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { fieldTemplates } from "./fieldTemplates";
import { FieldType } from "@/lib/types/form";

interface DraggableFieldProps {
  type: FieldType;
  icon: string;
  label: string;
}

function DraggableField({ type, icon, label }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, isNew: true },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = Icons[icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
    >
      <div className="flex flex-col items-center gap-2">
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
        <span className="text-sm font-medium text-center">{label}</span>
      </div>
    </Card>
  );
}

export function FieldPalette() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Field Types</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag fields to the canvas
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {fieldTemplates.map((template) => (
          <DraggableField
            key={template.type}
            type={template.type}
            icon={template.icon}
            label={template.label}
          />
        ))}
      </div>
    </div>
  );
}
