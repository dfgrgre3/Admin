"use client";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Logo + title header shown on `ResetPasswordPage`'s card. */
export default function ResetPasswordPageHeader() {
  return (
    <CardHeader className="space-y-1 text-center pb-8">
      <div className="flex justify-center mb-6">
        <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
          <img
            src="/logo-tolo.webp"
            alt="TOLO"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center text-white font-black text-2xl">
            T
          </div>
        </div>
      </div>

      <CardTitle className="text-3xl font-bold tracking-tight text-white">إعادة تعيين كلمة المرور</CardTitle>
      <CardDescription className="text-base text-gray-400">أدخل كلمة المرور الجديدة لحسابك</CardDescription>
    </CardHeader>
  );
}
