import { useParams } from "react-router-dom";

import { FormRenderer } from "@/components/form-renderer/FormRenderer";
import { FormSchema } from "@/lib/types/form";
import { useState, useEffect } from "react";
import { getForm } from "@/lib/api/forms";
import { supabase } from "@/lib/supabase/client";

export default function PublicForm() {
  const { formId } = useParams<{ formId: string }>();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      if (!formId) {
        setError("Form ID not found");
        setLoading(false);
        return;
      }
      const { data, error } = await getForm(formId);
      if (error) {
        setError(error);
      } else if (data) {
        setSchema(data.schema);
        // Track view
        await supabase.from("form_views").insert({ form_id: formId });
      } else {
        setError("Form not found");
      }
      setLoading(false);
    };
    loadForm();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
          <p className="text-muted-foreground">{error || "The form you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <FormRenderer schema={schema} formId={formId!} />
      </div>
    </div>
  );
}
