"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ResetPasswordSuccessStepProps {
  onBackToLogin: () => void;
}

/** Shown on `ResetPasswordPage` after a successful password reset. */
export default function ResetPasswordSuccessStep({ onBackToLogin }: ResetPasswordSuccessStepProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 border border-green-500/20">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <p className="text-sm text-gray-400">
          تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
        </p>
      </div>

      <div className="pt-4 space-y-3">
        <Button
          onClick={onBackToLogin}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
          العودة إلى تسجيل الدخول
        </Button>
      </div>
    </motion.div>
  );
}
