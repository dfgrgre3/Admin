"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ForgotPasswordSuccessStepProps {
  redirectCountdown: number;
  onBackToLogin: () => void;
}

/** Final step of `ForgotPasswordPage` — confirms the password change. */
export default function ForgotPasswordSuccessStep({
  redirectCountdown,
  onBackToLogin,
}: ForgotPasswordSuccessStepProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
      <div className="inline-flex items-center justify-center p-6 rounded-full bg-green-500/10 border border-green-500/20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
          <CheckCircle className="h-16 w-16 text-green-500" />
        </motion.div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">تم التغيير بنجاح!</h3>
        <p className="text-gray-400">جاري تحويلك إلى صفحة تسجيل الدخول خلال {redirectCountdown} ثوانٍ</p>
      </div>

      <Button
        onClick={onBackToLogin}
        className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
      >
        <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
        العودة الآن
      </Button>
    </motion.div>
  );
}
