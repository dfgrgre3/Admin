"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Shown on `TwoFactorPage` when the request has no `userId` to verify against. */
export default function TwoFactorInvalidState() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-2xl font-bold text-white">طلب غير صالح</h3>
            <p className="text-gray-400">عذراً، يبدو أن طلب التحقق الثنائي غير صالح</p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
              العودة إلى تسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
