import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Education } from "@/types/resume";
import { GraduationCap, Building, Calendar } from "lucide-react";

interface EducationFormProps {
  data: Education;
  onChange: (data: Education) => void;
}

export function EducationForm({ data, onChange }: EducationFormProps) {
  const handleChange = (field: keyof Education, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <FormSection
      title="Education"
      description="Add your educational background"
    >
      <FormField label="Degree" required>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Bachelor's in Computer Science"
            value={data.degree}
            onChange={(e) => handleChange("degree", e.target.value)}
            className="pl-10"
          />
        </div>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Institution" required>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="University Name"
              value={data.institution}
              onChange={(e) => handleChange("institution", e.target.value)}
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField label="Graduation Year" required>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="2023"
              value={data.graduationYear}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (/^\d+$/.test(value) && value.length <= 4)) {
                  handleChange("graduationYear", value);
                }
              }}
              className="pl-10"
              maxLength={4}
            />
          </div>
        </FormField>
      </div>
    </FormSection>
  );
}
