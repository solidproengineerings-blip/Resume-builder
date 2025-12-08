import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Plus, X } from "lucide-react";

interface SkillsFormProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <FormSection
      title="Skills"
      description="Add your technical and professional skills"
    >
      <FormField label="Add Skills" required>
        <div className="relative flex-1">
          <Input
            placeholder="e.g., JavaScript, Python, React..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <button
            type="button"
            onClick={addSkill}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </FormField>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium border border-secondary/30 transition-all hover:bg-secondary/30"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </FormSection>
  );
}
