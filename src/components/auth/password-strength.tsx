'use client';

import { useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthCriteria {
  label: string;
  test: (password: string) => boolean;
}

const criteria: StrengthCriteria[] = [
  {
    label: '8 أحرف على الأقل',
    test: (password) => password.length >= 8,
  },
  {
    label: 'حرف صغير (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'حرف كبير (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'رقم (0-9)',
    test: (password) => /\d/.test(password),
  },
  {
    label: 'رمز خاص (!@#$%...)',
    test: (password) => /[!@#$%^&*()_+\-=\x5b\x5d{};':"\\|,.<>/?]/.test(password),
  },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    const passedCriteria = criteria.filter((criterion) => criterion.test(password)).length;
    const score = (passedCriteria / criteria.length) * 100;

    if (score <= 20) return { score, label: 'ضعيفة جداً', color: 'bg-red-500' };
    if (score <= 40) return { score, label: 'ضعيفة', color: 'bg-orange-500' };
    if (score <= 60) return { score, label: 'متوسطة', color: 'bg-yellow-500' };
    if (score <= 80) return { score, label: 'جيدة', color: 'bg-blue-500' };
    return { score, label: 'قوية', color: 'bg-green-500' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">قوة كلمة المرور:</span>
          <span className={`font-bold ${strength.score <= 40 ? 'text-red-400' : strength.score <= 60 ? 'text-yellow-400' : 'text-green-400'}`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Criteria List */}
      <div className="grid grid-cols-1 gap-1.5">
        {criteria.map((criterion, index) => {
          const passed = criterion.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
              )}
              <span className={passed ? 'text-gray-300' : 'text-gray-600'}>
                {criterion.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}