'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  error,
  disabled = false 
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(newValue)) return;
    
    // Take only the last character if multiple are pasted
    const char = newValue.slice(-1);
    
    // Update the value
    const newValueArray = value.split('');
    newValueArray[index] = char;
    const newOTP = newValueArray.join('');
    onChange(newOTP);
    
    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Filter only numbers
    const numbers = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (numbers) {
      onChange(numbers.padEnd(length, ''));
      // Focus on the last filled input or the next empty one
      const focusIndex = Math.min(numbers.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center" dir="ltr">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            disabled={disabled}
            className={cn(
              "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl",
              "bg-white/5 border border-white/10 text-white",
              "focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10",
              "outline-none transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500/50 focus:border-red-500"
            )}
            autoComplete="one-time-code"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-500 font-medium text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
