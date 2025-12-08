import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className={cn("flex items-center", index === steps.length - 1 ? "flex-none" : "flex-1")}>
          <div
            className={cn(
              "flex flex-col items-center cursor-pointer group relative",
              index <= currentStep && "cursor-pointer"
            )}
            onClick={() => onStepClick?.(index)}
          >
            <div
              className={cn(
                "w-8 h-8 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 font-display font-bold shrink-0",
                currentStep > index
                  ? "bg-secondary text-secondary-foreground shadow-card"
                  : currentStep === index
                    ? "bg-primary text-primary-foreground shadow-card scale-110"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > index ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                step.icon
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium transition-colors hidden sm:block absolute top-full left-1/2 -translate-x-1/2 w-32 text-center",
                currentStep >= index
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 mx-0.5 sm:mx-2">
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  currentStep > index
                    ? "bg-secondary"
                    : "bg-border"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
