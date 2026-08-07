import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication | Tolo',
  description: 'نظام الدخول إلى عالم Tolo',
  robots: { index: true, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="z-10 w-full max-w-4xl">
        <div className="text-center mb-10">
          <Link href="/" className="flex flex-col items-center gap-4">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-white border border-white/20 shadow-lg">
              <Image src="/logo-tolo.webp" alt="TOLO" fill sizes="80px" className="object-cover" />
            </div>
            <h1 className="text-6xl font-black text-orange-500 tracking-tighter">
              TOLO
            </h1>
          </Link>
          <p className="mt-4 text-gray-400 font-medium text-lg">
            بوابتك التعليمية المميزة نحو التميز
          </p>
        </div>

        <div className="w-full">
          {children}
        </div>

        <p className="mt-12 text-center text-sm text-gray-500 font-bold">
          &copy; {new Date().getFullYear()} Tolo Platform. كل الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
