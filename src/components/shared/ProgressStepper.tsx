"use client";

import { Check } from "lucide-react";
import clsx from "clsx";

export interface Step {
  id: number;
  label: string;
  shortLabel?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export const ANALYZE_STEPS: Step[] = [
  { id: 1, label: "Téléversement", shortLabel: "Upload" },
  { id: 2, label: "Vérification", shortLabel: "Vérif." },
  { id: 3, label: "Questionnaire", shortLabel: "Questions" },
  { id: 4, label: "Rapport", shortLabel: "Rapport" },
];

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 z-0" />
        <div className="absolute top-4 left-0 h-0.5 bg-brand-500 z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
        {steps.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const pending = step.id > currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300", done && "bg-brand-600 border-brand-600 text-white", active && "bg-white border-brand-600 text-brand-700 shadow-md ring-4 ring-brand-100", pending && "bg-white border-neutral-200 text-neutral-400")}>
                {done ? <Check size={14} /> : step.id}
              </div>
              <span className={clsx("text-xs font-medium hidden sm:block transition-colors", active && "text-brand-700", done && "text-neutral-500", pending && "text-neutral-400")}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
