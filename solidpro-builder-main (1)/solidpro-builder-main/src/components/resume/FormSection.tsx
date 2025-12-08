import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-display text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground font-body">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
