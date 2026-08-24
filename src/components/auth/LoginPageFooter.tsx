"use client";

import Link from "next/link";

/** Copyright + legal links footer shared by `LoginPage`'s card. */
export default function LoginPageFooter() {
  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} Tolo Platform. جميع الحقوق محفوظة.
        </p>
        <div className="flex gap-4">
          <Link href="/help" className="hover:text-gray-300 transition-colors">
            مساعدة
          </Link>
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            الخصوصية
          </Link>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            الشروط
          </Link>
        </div>
      </div>
    </div>
  );
}
