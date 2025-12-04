import contactForm from "./contact-form.json";
import feedbackForm from "./feedback-form.json";
import jobApplication from "./job-application.json";
import eventRegistration from "./event-registration.json";
import bugReport from "./bug-report.json";
import signupLead from "./signup-lead.json";
import appointmentBooking from "./appointment-booking.json";
import { FormSchema } from "@/lib/types/form";

export interface FormTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    schema: FormSchema;
}

export const templates: FormTemplate[] = [
    contactForm as FormTemplate,
    feedbackForm as FormTemplate,
    jobApplication as FormTemplate,
    eventRegistration as FormTemplate,
    bugReport as FormTemplate,
    signupLead as FormTemplate,
    appointmentBooking as FormTemplate,
];

export function getTemplate(id: string): FormTemplate | undefined {
    return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): FormTemplate[] {
    return templates.filter((t) => t.category === category);
}
