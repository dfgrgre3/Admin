"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

/** Shown on `TwoFactorPage` briefly after a successful verification, before redirect. */
export default function TwoFactorVerifiedState() {
  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 border border-green-500/20"
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white">تم التحقق بنجاح!</h3>
            <p className="text-gray-400">جاري تحويلك إلى لوحة التحكم...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
