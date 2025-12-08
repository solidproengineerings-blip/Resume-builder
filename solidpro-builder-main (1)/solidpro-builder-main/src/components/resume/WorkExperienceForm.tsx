import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { WorkExperience } from "@/types/resume";
import { Plus, Trash2, Building2, ChevronDown, ChevronUp } from "lucide-react";

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function WorkExperienceForm({ experiences, onChange }: WorkExperienceFormProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      companyName: "",
      jobTitle: "",
      startYear: "",
      endYear: "",
      responsibilities: [""],
    };
    onChange([...experiences, newExp]);
    setExpandedIds([...expandedIds, newExp.id]);
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | string[]) => {
    onChange(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
    setExpandedIds(expandedIds.filter((eid) => eid !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(
      expandedIds.includes(id)
        ? expandedIds.filter((eid) => eid !== id)
        : [...expandedIds, id]
    );
  };

  const handleResponsibilitiesChange = (id: string, value: string) => {
    const responsibilities = value.split("\n").filter((r) => r.trim());
    updateExperience(id, "responsibilities", responsibilities);
  };

  return (
    <FormSection
      title="Work Experience"
      description="Add your professional work history"
    >
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div
            key={exp.id}
            className="border-2 border-border rounded-xl p-4 bg-card transition-all hover:border-primary/30"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(exp.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold font-display">
                    {exp.companyName || `Experience ${index + 1}`}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {exp.jobTitle || "Job Title"} {exp.startYear && `| ${exp.startYear}`}
                    {exp.endYear && `–${exp.endYear}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExperience(exp.id);
                  }}
                  className="text-muted-foreground hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {expandedIds.includes(exp.id) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedIds.includes(exp.id) && (
              <div className="mt-4 space-y-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Company Name" required>
                    <Input
                      placeholder="Company Inc."
                      value={exp.companyName}
                      onChange={(e) =>
                        updateExperience(exp.id, "companyName", e.target.value)
                      }
                    />
                  </FormField>
                  <FormField label="Job Title" required>
                    <Input
                      placeholder="Software Developer"
                      value={exp.jobTitle}
                      onChange={(e) =>
                        updateExperience(exp.id, "jobTitle", e.target.value)
                      }
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Start Year" required>
                    <Input
                      placeholder="2022"
                      value={exp.startYear}
                      onChange={(e) =>
                        updateExperience(exp.id, "startYear", e.target.value)
                      }
                    />
                  </FormField>
                  <FormField label="End Year" required>
                    <Input
                      placeholder="2024 or Present"
                      value={exp.endYear}
                      onChange={(e) =>
                        updateExperience(exp.id, "endYear", e.target.value)
                      }
                    />
                  </FormField>
                </div>
                <FormField label="Responsibilities (one per line)" required>
                  <Textarea
                    placeholder="Developed web applications using React&#10;Implemented REST APIs&#10;Collaborated with design team"
                    value={exp.responsibilities.join("\n")}
                    onChange={(e) =>
                      handleResponsibilitiesChange(exp.id, e.target.value)
                    }
                    className="min-h-[120px]"
                  />
                </FormField>
              </div>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline-secondary"
          onClick={addExperience}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>
      </div>
    </FormSection>
  );
}
