import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";

interface SummaryFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function SummaryForm({ value, onChange }: SummaryFormProps) {
  return (
    <FormSection
      title="Professional Summary"
      description="Write a compelling 3-4 line summary of your professional experience"
    >
      <FormField label="Summary" required>
        <Textarea
          placeholder="Experienced Full Stack Developer with over 2 years of hands-on experience in building and maintaining scalable web applications..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[140px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {value.length}/500 characters
        </p>
      </FormField>
    </FormSection>
  );
}
