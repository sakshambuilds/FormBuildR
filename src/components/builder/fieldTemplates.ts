import { FieldTemplate } from "@/lib/types/form";

export const fieldTemplates: FieldTemplate[] = [
  {
    type: "text",
    icon: "Type",
    label: "Text Input",
    defaultField: {
      type: "text",
      label: "Text Field",
      required: false,
      placeholder: "Enter text...",
    },
  },
  {
    type: "textarea",
    icon: "AlignLeft",
    label: "Text Area",
    defaultField: {
      type: "textarea",
      label: "Long Text",
      required: false,
      placeholder: "Enter longer text...",
    },
  },
  {
    type: "select",
    icon: "List",
    label: "Dropdown",
    defaultField: {
      type: "select",
      label: "Select Option",
      required: false,
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    type: "multiselect",
    icon: "ListChecks",
    label: "Multi-Select",
    defaultField: {
      type: "multiselect",
      label: "Select Multiple",
      required: false,
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    type: "checkbox",
    icon: "CheckSquare",
    label: "Checkbox",
    defaultField: {
      type: "checkbox",
      label: "Check this",
      required: false,
    },
  },
  {
    type: "toggle",
    icon: "ToggleLeft",
    label: "Toggle Switch",
    defaultField: {
      type: "toggle",
      label: "Enable feature",
      required: false,
    },
  },
  {
    type: "number",
    icon: "Hash",
    label: "Number",
    defaultField: {
      type: "number",
      label: "Number Field",
      required: false,
      placeholder: "0",
    },
  },
  {
    type: "rating",
    icon: "Star",
    label: "Rating",
    defaultField: {
      type: "rating",
      label: "Rate this",
      required: false,
      max: 5,
    },
  },
  {
    type: "phone",
    icon: "Phone",
    label: "Phone Number",
    defaultField: {
      type: "phone",
      label: "Phone Number",
      required: false,
      placeholder: "Enter phone number",
    },
  },
  {
    type: "datetime",
    icon: "Calendar",
    label: "Date & Time",
    defaultField: {
      type: "datetime",
      label: "Select Date & Time",
      required: false,
    },
  },
  {
    type: "signature",
    icon: "PenTool",
    label: "Signature",
    defaultField: {
      type: "signature",
      label: "Sign Here",
      required: false,
    },
  },
  {
    type: "file",
    icon: "Paperclip",
    label: "File (Basic)",
    defaultField: {
      type: "file",
      label: "Upload File",
      required: false,
    },
  },
  {
    type: "file_upload",
    icon: "Upload",
    label: "File Upload",
    defaultField: {
      type: "file_upload",
      label: "Upload File",
      required: false,
      accept: ".pdf,.jpg,.jpeg,.png",
      max: 10, // 10MB default
    },
  },
];
