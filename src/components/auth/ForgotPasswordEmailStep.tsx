"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFormValues {
  email: string;
}

interface ForgotPasswordEmailStepProps {
  register: UseFormRegister<EmailFormValues>;
  errors: FieldErrors<EmailFormValues>;
  isSubmitting: boolean;
  isValid: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

/** Step 1 of `ForgotPasswordPage` — collects the account email. */
export default function ForgotPasswordEmailStep({
  register,
  errors,
  isSubmitting,
  isValid,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordEmailStepProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-300">
            البريد الإلكتروني <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              {...register("email")}
              className={`pr-10 text-white bg-white/5 border-white/10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              dir="rtl"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جارٍ الإرسال...
            </>
          ) : (
            <>
              إرسال الكود
              <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <button
          onClick={onBackToLogin}
          className="w-full text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          العودة إلى تسجيل الدخول
        </button>
      </div>
    </motion.div>
  );
}
