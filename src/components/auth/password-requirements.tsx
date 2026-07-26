'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Requirement {
  id: string;
  label: string;
  check: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    id: 'length',
    label: '8 أحرف على الأقل',
    check: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'حرف كبير واحد على الأقل',
    check: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'حرف صغير واحد على الأقل',
    check: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'رقم واحد على الأقل',
    check: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'رمز خاص واحد على الأقل',
    check: (password) => /[^a-zA-Z0-9]/.test(password),
  },
];

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-2">
        {requirements.map((requirement) => {
          const isMet = requirement.check(password);
          return (
            <div
              key={requirement.id}
              className={cn(
                "flex items-center gap-2 text-xs font-medium transition-colors",
                isMet ? "text-green-500" : "text-gray-500"
              )}
            >
              {isMet ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{requirement.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function areAllRequirementsMet(password: string): boolean {
  return requirements.every((req) => req.check(password));
}
