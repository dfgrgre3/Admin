'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepsIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function StepsIndicator({ 
  steps, 
  currentStep, 
  completedSteps = [],
  className 
}: StepsIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isPending = step.id > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-orange-500 text-white scale-110",
                    isPending && "bg-gray-700 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    isCompleted && "text-green-500",
                    isCurrent && "text-orange-500",
                    isPending && "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-300",
                    isCompleted ? "bg-green-500" : "bg-gray-700"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
