// Form-related TypeScript types
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "number"
  | "rating"
  | "file"
  | "file_upload"
  | "phone"
  | "signature"
  | "datetime"
  | "toggle"
  | "multiselect";

// Conditional Logic Types
export type LogicOperator = "equals" | "not_equals" | "contains" | "gt" | "lt" | "gte" | "lte";
export type LogicAction = "show" | "hide" | "require" | "disable" | "skip_page";

export interface LogicCondition {
  fieldId: string;
  operator: LogicOperator;
  value: string | number | boolean;
}

export interface LogicRule {
  id: string;
  conditions: LogicCondition[];
  conditionType?: "AND" | "OR"; // For future expansion
  action: LogicAction;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  success: string;
  text: string;
  background: string;
}

export interface BackgroundConfig {
  type: "color" | "gradient" | "image";
  value: string;
  imageOptions?: {
    size: "cover" | "contain" | "repeat";
    position: string;
  };
}

export interface ThemeConfig {
  mode: "light" | "dark";
  light: ThemeColors;
  dark: ThemeColors;
  background?: BackgroundConfig;
  customCSS?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select, multiselect
  max?: number; // For rating, file size limits, number max
  min?: number; // For number min
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  accept?: string; // For file uploads
  helpText?: string;
  transform?: ('uppercase' | 'lowercase' | 'trim')[];
  logic?: LogicRule[]; // Conditional logic rules
}

export interface FormSchema {
  title: string;
  fields: FormField[];
  theme?: ThemeConfig;
}

export interface FieldTemplate {
  type: FieldType;
  icon: string;
  label: string;
  defaultField: Omit<FormField, "id">;
}

export type Form = {};
export type FormResponse = {};
