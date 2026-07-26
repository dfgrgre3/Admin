'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  className?: string;
}

export function PasswordStrengthMeter({ strength, className }: PasswordStrengthMeterProps) {
  const getStrengthConfig = () => {
    switch (strength) {
      case 'weak':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-500',
          label: 'ضعيفة',
          width: '33%',
        };
      case 'medium':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-500',
          label: 'متوسطة',
          width: '66%',
        };
      case 'strong':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-500',
          label: 'قوية',
          width: '100%',
        };
      default:
        return {
          color: 'bg-gray-700',
          textColor: 'text-gray-500',
          label: '',
          width: '0%',
        };
    }
  };

  const config = getStrengthConfig();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">قوة كلمة المرور</span>
        {config.label && (
          <span className={cn("text-xs font-bold", config.textColor)}>
            {config.label}
          </span>
        )}
      </div>
      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            config.color
          )}
          style={{ width: config.width }}
        />
      </div>
    </div>
  );
}

export function checkPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak';

  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}
